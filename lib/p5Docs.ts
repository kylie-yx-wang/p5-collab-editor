// lib/p5Docs.ts

export interface P5Function {
    label: string;      // The function name (what they type)
    type: string;       // Shows an icon in the autocomplete list
    detail: string;     // The parameters (shows next to the name)
    info: string;       // The full description (shows in a popup box)
  }
  
  export const p5BasicDocs: P5Function[] = [
    {
      label: "rect",
      type: "function",
      detail: "(x, y, w, h, [r])",
      info: "Draws a rectangle to the screen. x and y are the top-left corner, w and h are width and height. r is an optional argument for corner radius."
    },
    {
      label: "ellipse",
      type: "function",
      detail: "(x, y, w, [h])",
      info: "Draws an ellipse (oval) to the screen. If height is left out, it draws a perfect circle."
    },
    {
      label: "circle",
      type: "function",
      detail: "(x, y, d)",
      info: "Draws a circle to the screen. d is the diameter (width across)."
    },
    {
      label: "fill",
      type: "function",
      detail: "(r, g, b)",
      info: "Sets the color used to fill shapes. Can be a single grayscale number, or RGB."
    },
    {
      label: "stroke",
      type: "function",
      detail: "(r, g, b)",
      info: "Sets the color used to draw lines and borders around shapes."
    },
    {
      label: "background",
      type: "function",
      detail: "(color)",
      info: "Clears the screen and sets the background color. Usually placed at the top of draw()."
    },
    
  ];