import { StateField, StateEffect, EditorState } from "@codemirror/state";
import { EditorView, showTooltip, Tooltip } from "@codemirror/view";

interface ColorState {
  from: number;
  to: number;
  color: string;
}

export const setColorPicker = StateEffect.define<ColorState | null>();

// Converts function strings or hex to the strict 6-digit hex required by the color input
function colorToHex(color: string): string {
  if (color.startsWith("#")) {
    if (color.length === 4 || color.length === 5) {
      return "#" + color[1]+color[1] + color[2]+color[2] + color[3]+color[3];
    }
    return color.substring(0, 7); 
  }
  
  // Extract all numbers from the function (e.g., "fill(255, 0, 100, 0.5)")
  const match = color.match(/[\d.]+/g);
  if (match && match.length >= 3) {
    const r = parseInt(match[0], 10).toString(16).padStart(2, "0");
    const g = parseInt(match[1], 10).toString(16).padStart(2, "0");
    const b = parseInt(match[2], 10).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }
  return "#000000"; // Fallback
}

// Converts the input's hex back into the user's original function and preserves alpha
function hexToOriginalFormat(hex: string, originalFormat: string): string {
  if (originalFormat.startsWith("#")) return hex;

  // Dynamically grab the function name (fill, stroke, tint, etc.)
  const match = originalFormat.match(/^([a-zA-Z]+)\s*\(/);
  if (match) {
    const funcName = match[1];
    
    // Parse the new R, G, B values from the color wheel's hex
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // Check if the original string had a 4th argument (alpha)
    const numbers = originalFormat.match(/[\d.]+/g);
    const alpha = (numbers && numbers.length >= 4) ? numbers[3] : null;

    if (alpha !== null) {
      return `${funcName}(${r}, ${g}, ${b}, ${alpha})`;
    }
    return `${funcName}(${r}, ${g}, ${b})`;
  }
  
  return hex;
}

// Scans the current line for Hex and canvas color functions around the cursor
export function extractColorData(state: EditorState, pos: number): ColorState | null {
  const line = state.doc.lineAt(pos);
  const text = line.text;
  const posInLine = pos - line.from;

  // Matches Hex OR fill(), background(), color(), tint(), stroke()
  const colorRegex = /(#[0-9a-fA-F]{8}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{4}|#[0-9a-fA-F]{3}|\b(color|fill|background|tint|stroke)\s*\([^)]+\))/gi;
  let match;
  
  while ((match = colorRegex.exec(text)) !== null) {
    const start = match.index;
    const end = start + match[0].length;
    
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
      if (e.is(setColorPicker)) {
        if (value && e.value && value.from === e.value.from && value.to === e.value.to) {
          return value; 
        }
        return e.value;
      }
    }

    if (value) {
      if (tr.isUserEvent("colorpicker")) {
        if (tr.docChanged) {
          return {
            ...value,
            from: tr.changes.mapPos(value.from),
            to: tr.changes.mapPos(value.to, 1),
            color: tr.newDoc.sliceString(
              tr.changes.mapPos(value.from), 
              tr.changes.mapPos(value.to, 1)
            )
          };
        }
        return value;
      }

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

    if (tooltip) {
      return { ...tooltip, pos: state.from };
    }

    return {
      pos: state.from,
      above: true,
      create(view) {
        const dom = document.createElement("div");
        dom.style.cssText = "padding: 2px; background: var(--cm-tooltip-bg, #fff); border: 1px solid #ddd; border-radius: 4px; display: flex;";
        
        const stopBubbling = (e: Event) => e.stopPropagation();
        dom.addEventListener("pointerdown", stopBubbling);
        dom.addEventListener("mousedown", stopBubbling);
        dom.addEventListener("click", stopBubbling);

        const input = document.createElement("input");
        input.type = "color";
        input.style.cursor = "pointer";
        
        const startState = view.state.field(colorPickerStateField);
        if (startState) {
          input.value = colorToHex(startState.color);
        }
        
        input.addEventListener("input", (e) => {
          const newHex = (e.target as HTMLInputElement).value;
          const currentState = view.state.field(colorPickerStateField);
          
          if (currentState) {
            const finalColorText = hexToOriginalFormat(newHex, currentState.color);
            
            view.dispatch({
              changes: { from: currentState.from, to: currentState.to, insert: finalColorText },
              userEvent: "colorpicker" 
            });
          }
        });

        dom.appendChild(input);
        
        return { 
          dom,
          update(viewUpdate) {
            const currState = viewUpdate.state.field(colorPickerStateField);
            if (currState) {
              const safeColor = colorToHex(currState.color);
              if (input.value !== safeColor) {
                input.value = safeColor;
              }
            }
          }
        };
      }
    };
  },
  provide: (f) => showTooltip.from(f)
});