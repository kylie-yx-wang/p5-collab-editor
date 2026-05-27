// lib/sliderExtension.ts

import { EditorView, showTooltip } from "@codemirror/view";
import { StateField, StateEffect, Transaction } from "@codemirror/state";
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
    // we must remap the from/to positions so the tooltip stays attached to the number!
    if (value && tr.docChanged) {
      if (tr.isUserEvent("slider")) { // user caused
        // Keep the slider open and remap the coordinates so it doesn't break
        return {
          ...value,
          from: tr.changes.mapPos(value.from),
          to: tr.changes.mapPos(value.to, 1)
        };
        //return value;
      }
      
      // Otherwise, the user typed on their keyboard! Close the slider.
      return null;
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
    create: createSliderTooltip // <-- STABLE REFERENCE!
  };
});

// 5. Intercept clicks to open/close the tooltip
const clickHandler = EditorView.domEventHandlers({
  mousedown(e, view) {
    const pos = view.posAtCoords({ x: e.clientX, y: e.clientY });
    if (pos === null) {
      view.dispatch({ effects: setSlider.of(null) });
      return false;
    }

    const node = syntaxTree(view.state).resolveInner(pos, 1);
    if (node.name === "Number") {
      const text = view.state.sliceDoc(node.from, node.to);
      const value = parseFloat(text);
      if (!isNaN(value)) {
        // Trigger the pop-up
        view.dispatch({
          effects: setSlider.of({
            from: node.from,
            to: node.to,
            value,
            isFloat: text.includes(".")
          })
        });
      }
    } else {
      // If they click on anything that isn't a number, close the slider
      view.dispatch({ effects: setSlider.of(null) });
    }
    
    // Return false so the cursor still moves normally
    return false; 
  }
});

// 6. Export the final array of extensions
export const numberSlider = () => [
  sliderStateField,
  sliderTooltip,
  clickHandler
];