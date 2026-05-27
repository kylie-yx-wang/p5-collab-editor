import * as numSlider from "@/lib/numberSlider"
import * as colorPicker from "@/lib/colorPicker"
import { EditorView } from "@codemirror/view";


// Intercept clicks and mouse to open/close the tooltip
const clickmouseHandler = EditorView.domEventHandlers({
    mousedown(e, view) {
      const pos = view.posAtCoords({ x: e.clientX, y: e.clientY });
      
      if (pos !== null) {
        const numData = numSlider.extractNumberData(view.state, pos);
        if (numData) {
          view.dispatch({ effects: numSlider.setSlider.of(numData) });
          return false;
        }

        const colorData = colorPicker.extractColorData(view.state, pos);
        if (colorData) {
            view.dispatch({ effects: colorPicker.setColorPicker.of(colorData) });
            return false;
        }
      }
      
      // If we didn't click a number, close the slider
      view.dispatch({ effects: numSlider.setSlider.of(null) });
      view.dispatch({ effects: colorPicker.setColorPicker.of(null) });
      return false; 
    },
    keydown(e, view) {
      // Check if the slider is currently open
      if (view.state.field(numSlider.sliderStateField)) {
        // Close it!
        view.dispatch({ effects: numSlider.setSlider.of(null) });
      }
      return false;
    },
  });
  
  const cursorWatcher = EditorView.updateListener.of((update) => {
    // Only run if the cursor explicitly moved
    if (update.selectionSet) {
      
      // position of the text cursor in the document
      const pos = update.state.selection.main.head;
      const numData = numSlider.extractNumberData(update.state, pos);
  
      if (numData) {
        update.view.dispatch({ effects: numSlider.setSlider.of(numData) });
      } else {
        // If the cursor moved OFF a number, close it
        if (update.state.field(numSlider.sliderStateField)) {
          update.view.dispatch({ effects: numSlider.setSlider.of(null) });
        }
      }
      const colorData = colorPicker.extractColorData(update.view.state, pos);
      if (colorData) {
        update.view.dispatch({ effects: colorPicker.setColorPicker.of(colorData) });
        return false;
      } else {
        if (update.state.field(colorPicker.colorPickerStateField)) {
            update.view.dispatch({ effects: colorPicker.setColorPicker.of(null) });
          }
      }
    }
  });
  
  // Export the final array of extensions
  export const editTools = () => [
    numSlider.sliderStateField,
    numSlider.sliderTooltip,
    colorPicker.colorPickerStateField,
    colorPicker.colorTooltip,
    clickmouseHandler,
    //keyboardHandler,
    cursorWatcher
  ];