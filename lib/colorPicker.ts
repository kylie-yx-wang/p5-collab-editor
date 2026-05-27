import { StateField, StateEffect, EditorState } from "@codemirror/state";
import { EditorView, showTooltip, Tooltip } from "@codemirror/view";

interface ColorState {
  from: number;
  to: number;
  color: string;
}

export const setColorPicker = StateEffect.define<ColorState | null>();

// Scans the current line for Hex colors around the cursor
export function extractColorData(state: EditorState, pos: number): ColorState | null {
  const line = state.doc.lineAt(pos);
  const text = line.text;
  const posInLine = pos - line.from;

  // Matches #RRGGBB or #RGB
  const hexRegex = /#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/g;
  let match;
  
  while ((match = hexRegex.exec(text)) !== null) {
    const start = match.index;
    const end = start + match[0].length;
    
    // If the cursor is touching this color hex code
    if (posInLine >= start && posInLine <= end) {
      return {
        from: line.from + start,
        to: line.from + end,
        color: match[0]
      };
    }
  }
  return null;
}

export const colorPickerStateField = StateField.define<ColorState | null>({
    create() { return null; },
    update(value, tr) {
      for (let e of tr.effects) {
        if (e.is(setColorPicker)) return e.value;
      }
  
      if (value) {
        if (tr.isUserEvent("colorpicker")) {
          if (tr.docChanged) {
            return {
              ...value,
              from: tr.changes.mapPos(value.from),
              to: tr.changes.mapPos(value.to, 1),
              // Grab the new color text from the document
              color: tr.newDoc.sliceString(
                tr.changes.mapPos(value.from), 
                tr.changes.mapPos(value.to, 1)
              )
            };
          }
          return value;
        }
  
        // Close if they type normally or move the cursor
        if (tr.docChanged) {
          return null;
        }
      }
      return value;
    }
  });

  export const colorTooltip = StateField.define<Tooltip | null>({
    create() { return null; },
    update(tooltip, tr) {
      const state = tr.state.field(colorPickerStateField);
      if (!state) return null;
  
      return {
        pos: state.from,
        above: true,
        create(view) {
          const dom = document.createElement("div");
          dom.style.cssText = "padding: 2px; background: var(--cm-tooltip-bg, #fff); border: 1px solid #ddd; border-radius: 4px; display: flex;";
          
        //   dom.addEventListener("mousedown", (e) => {
        //     e.stopPropagation();
        //   });
          const stopBubbling = (e: Event) => e.stopPropagation();
            dom.addEventListener("pointerdown", stopBubbling);
            dom.addEventListener("mousedown", stopBubbling);
            dom.addEventListener("click", stopBubbling);

          const input = document.createElement("input");
          input.type = "color";
          input.style.cursor = "pointer";
          
          // HTML color inputs strictly require 6-digit hex codes. 
          // We convert 3-digit hex (e.g., #fff) to 6-digit (#ffffff)
          let safeColor = state.color;
          if (safeColor.length === 4) {
            safeColor = "#" + safeColor[1]+safeColor[1] + safeColor[2]+safeColor[2] + safeColor[3]+safeColor[3];
          }
          input.value = safeColor;
          
          // When the user picks a color, update the document!
          input.addEventListener("input", (e) => {
            const newColor = (e.target as HTMLInputElement).value;
            const currentState = view.state.field(colorPickerStateField);
            
            if (currentState) {
              view.dispatch({
                changes: { from: currentState.from, to: currentState.to, insert: newColor },
                userEvent: "colorpicker" // StateField exception
              });
            }
          });
  
          dom.appendChild(input);
          return { dom };
        }
      };
    },
    provide: (f) => showTooltip.from(f)
  });