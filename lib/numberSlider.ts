// lib/sliderExtension.ts

import { EditorView, showTooltip, keymap } from "@codemirror/view";
import { StateField, StateEffect, Transaction, EditorState } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";


// data we need to track when a number is clicked
interface SliderState {
  from: number;
  to: number;
  value: number;
  isFloat: boolean;
}

// effect that turns the slider on or off
const setSlider = StateEffect.define<SliderState | null>();

// Create the StateField to remember the active number
const sliderStateField = StateField.define<SliderState | null>({
  create() { return null; },
  update(value, tr) {
    // If we clicked a number, set the state
    for (let e of tr.effects) {
      if (e.is(setSlider)) return e.value;
    }
    // If the document changes while the slider is open (from dragging),
    // we must remap the from/to positions so the tooltip stays attached to the number
    if (value) {
      if (tr.isUserEvent("slider") && tr.docChanged) { // user caused
        // Keep the slider open and remap the coordinates so it doesn't break
        return {
          ...value,
          from: tr.changes.mapPos(value.from),
          to: tr.changes.mapPos(value.to, 1)
        };
        //return value;
      }
      
      // Otherwise, the user typed on their keyboard! Close the slider.
      if (tr.docChanged) {
        return null;
      }
    }
    return value;
  }
});

// Define the tooltip builder OUTSIDE the compute function so it has a stable memory reference
function createSliderTooltip(view: EditorView) {
  const dom = document.createElement("div");
  // Tailwind styling for the pop-up container
  dom.className = "flex items-center gap-2 bg-white p-2 rounded-lg shadow-lg border border-gray-200 z-50 mb-1";

  // Minus Button (-1)
  const minusBtn = document.createElement("button");
  minusBtn.textContent = "-1";
  minusBtn.className = "px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-bold transition";

  // HTML Range Slider
  const slider = document.createElement("input");
  slider.type = "range";
  slider.className = "w-24 cursor-pointer accent-pink-500";
  
  // Plus Button (+1)
  const plusBtn = document.createElement("button");
  plusBtn.textContent = "+1";
  plusBtn.className = "px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-bold transition";

  // Grab the initial state to set up the slider's starting values
  const active = view.state.field(sliderStateField);
  if (active) {
    const range = 100;
    slider.min = (active.value - range).toString();
    slider.max = (active.value + range).toString();
    slider.step = active.isFloat ? "0.1" : "1";
    slider.value = active.value.toString();
  }

  // Function to dispatch updates to CodeMirror and Yjs
  const updateDoc = (newVal: number) => {
    // Read the LATEST state from the view directly
    const currentState = view.state.field(sliderStateField);
    if (!currentState) return;

    // Use currentState to check isFloat so it's never stale!
    const formatted = currentState.isFloat ? newVal.toFixed(2) : Math.round(newVal).toString();

    view.dispatch({
      changes: { from: currentState.from, to: currentState.to, insert: formatted },
      annotations: Transaction.userEvent.of("slider")
    });
  };

  // Attach Click & Drag Events
  minusBtn.onclick = (e) => {
    e.preventDefault();
    const newVal = parseFloat(slider.value) - 1;
    slider.value = newVal.toString();
    updateDoc(newVal);
  };

  plusBtn.onclick = (e) => {
    e.preventDefault();
    const newVal = parseFloat(slider.value) + 1;
    slider.value = newVal.toString();
    updateDoc(newVal);
  };

  slider.oninput = (e) => {
    const newVal = parseFloat((e.target as HTMLInputElement).value);
    updateDoc(newVal);
  };

  slider.onmouseup = () => {
    const range = 100; 
    const currentVal = parseFloat(slider.value);
    slider.min = (currentVal - range).toString();
    slider.max = (currentVal + range).toString();
  };

  // Add everything to the container
  dom.appendChild(minusBtn);
  dom.appendChild(slider);
  dom.appendChild(plusBtn);

  return { dom };
}

// uses stable reference
const sliderTooltip = showTooltip.compute([sliderStateField], state => {
  const active = state.field(sliderStateField);
  if (!active) return null;

  return {
    pos: active.from,
    above: true,
    create: createSliderTooltip 
  };
});

// Helper function to grab a number and its minus sign
function extractNumberData(state : EditorState, pos : number) {
  const node = syntaxTree(state).resolveInner(pos, 1);
  if (node.name !== "Number") return null;

  let from = node.from;
  const to = node.to;

  // Check if the character immediately before the number is a '-'
  if (from > 0 && state.sliceDoc(from - 1, from) === "-") {
    from -= 1; // Expand the selection to include the minus sign
  }

  const text = state.sliceDoc(from, to);
  const value = parseFloat(text);

  if (isNaN(value)) return null;

  return {
    from,
    to,
    value,
    isFloat: text.includes(".")
  };
}

// Intercept clicks and mouse to open/close the tooltip
const clickmouseHandler = EditorView.domEventHandlers({
  mousedown(e, view) {
    const pos = view.posAtCoords({ x: e.clientX, y: e.clientY });
    
    if (pos !== null) {
      const numData = extractNumberData(view.state, pos);
      if (numData) {
        view.dispatch({ effects: setSlider.of(numData) });
        return false;
      }
    }
    
    // If we didn't click a number, close the slider
    view.dispatch({ effects: setSlider.of(null) });
    return false; 
  },
  keydown(e, view) {
    // Check if the slider is currently open
    if (view.state.field(sliderStateField)) {
      // Close it!
      view.dispatch({ effects: setSlider.of(null) });
    }
    return false;
  },
});

// const keyboardHandler = Prec.highest(
//   keymap.of([{
//     any: (view, event) => {
//       // If the slider is open, any keypress (Arrows, Esc, Letters) destroys it
//       if (view.state.field(sliderStateField)) {
//         view.dispatch({ effects: setSlider.of(null) });
//       }
      
//       // return false so the key performs its normal action
//       return false; 
//     }
//   }])
// );

const cursorWatcher = EditorView.updateListener.of((update) => {
  // Only run if the cursor explicitly moved
  if (update.selectionSet) {
    
    // position of the text cursor in the document
    const pos = update.state.selection.main.head;
    const numData = extractNumberData(update.state, pos);

    if (numData) {
      update.view.dispatch({ effects: setSlider.of(numData) });
    } else {
      // If the cursor moved OFF a number, close it
      if (update.state.field(sliderStateField)) {
        update.view.dispatch({ effects: setSlider.of(null) });
      }
    }
  }
});

// Export the final array of extensions
export const numberSlider = () => [
  sliderStateField,
  sliderTooltip,
  clickmouseHandler,
  //keyboardHandler,
  cursorWatcher
];