// lib/p5Docs.ts

export interface P5Function {
    label: string;      // The function name (what they type)
    type: string;       // Shows an icon in the autocomplete list
    detail: string;     // The parameters (shows next to the name)
    info: string;       // The full description (shows in a popup box)
    link: string;       // Link to the official p5.js documentation
  }
  
  export const p5BasicDocs: P5Function[] = [
    // --- SHAPES & DRAWING ---
    {
      label: "rect",
      type: "function",
      detail: "(x, y, w, h, [r])",
      info: "Draws a rectangle to the screen. x and y are the top-left corner, w and h are width and height. r is an optional argument for corner radius.",
      link: "https://p5js.org/reference/p5/rect/"
    },
    {
      label: "ellipse",
      type: "function",
      detail: "(x, y, w, [h])",
      info: "Draws an ellipse (oval) to the screen. If height is left out, it draws a perfect circle.",
      link: "https://p5js.org/reference/p5/ellipse/"
    },
    {
      label: "circle",
      type: "function",
      detail: "(x, y, d)",
      info: "Draws a circle to the screen. d is the diameter (width across).",
      link: "https://p5js.org/reference/p5/circle/"
    },
    {
      label: "arc",
      type: "function",
      detail: "(x, y, w, h, start, stop, [mode])",
      info: "Draws an arc (a piece of an ellipse). start and stop are angles.",
      link: "https://p5js.org/reference/p5/arc/"
    },
    {
      label: "line",
      type: "function",
      detail: "(x1, y1, x2, y2)",
      info: "Draws a straight line between two points.",
      link: "https://p5js.org/reference/p5/line/"
    },
    {
      label: "point",
      type: "function",
      detail: "(x, y)",
      info: "Draws a single point (pixel) in space.",
      link: "https://p5js.org/reference/p5/point/"
    },
    {
      label: "quad",
      type: "function",
      detail: "(x1, y1, x2, y2, x3, y3, x4, y4)",
      info: "Draws a quadrilateral (a four-sided shape).",
      link: "https://p5js.org/reference/p5/quad/"
    },
    {
      label: "triangle",
      type: "function",
      detail: "(x1, y1, x2, y2, x3, y3)",
      info: "Draws a triangle connecting three points.",
      link: "https://p5js.org/reference/p5/triangle/"
    },
    {
      label: "square",
      type: "function",
      detail: "(x, y, s)",
      info: "Draws a perfect square. x and y are the top-left corner, s is the side length.",
      link: "https://p5js.org/reference/p5/square/"
    },
    {
      label: "bezier",
      type: "function",
      detail: "(x1, y1, x2, y2, x3, y3, x4, y4)",
      info: "Draws a Bezier curve defined by a series of anchor and control points.",
      link: "https://p5js.org/reference/p5/bezier/"
    },
  
    // --- STYLING & ATTRIBUTES ---
    {
      label: "fill",
      type: "function",
      detail: "(r, g, b)",
      info: "Sets the color used to fill shapes. Can be a single grayscale number, or RGB.",
      link: "https://p5js.org/reference/p5/fill/"
    },
    {
      label: "noFill",
      type: "function",
      detail: "()",
      info: "Disables filling geometry. If both noStroke() and noFill() are called, nothing will be drawn.",
      link: "https://p5js.org/reference/p5/noFill/"
    },
    {
      label: "stroke",
      type: "function",
      detail: "(r, g, b)",
      info: "Sets the color used to draw lines and borders around shapes.",
      link: "https://p5js.org/reference/p5/stroke/"
    },
    {
      label: "noStroke",
      type: "function",
      detail: "()",
      info: "Disables drawing the stroke (border) around shapes.",
      link: "https://p5js.org/reference/p5/noStroke/"
    },
    {
      label: "strokeWeight",
      type: "function",
      detail: "(weight)",
      info: "Sets the width of the stroke used for lines, points, and the border around shapes.",
      link: "https://p5js.org/reference/p5/strokeWeight/"
    },
    {
      label: "strokeCap",
      type: "function",
      detail: "(cap)",
      info: "Sets the style for rendering line endings (SQUARE, PROJECT, or ROUND).",
      link: "https://p5js.org/reference/p5/strokeCap/"
    },
    {
      label: "ellipseMode",
      type: "function",
      detail: "(mode)",
      info: "Changes where ellipses and circles are drawn from (CENTER, RADIUS, CORNER, or CORNERS).",
      link: "https://p5js.org/reference/p5/ellipseMode/"
    },
    {
      label: "rectMode",
      type: "function",
      detail: "(mode)",
      info: "Changes where rectangles and squares are drawn from (CORNER, CORNERS, CENTER, or RADIUS).",
      link: "https://p5js.org/reference/p5/rectMode/"
    },
    {
      label: "background",
      type: "function",
      detail: "(color)",
      info: "Clears the screen and sets the background color. Usually placed at the top of draw().",
      link: "https://p5js.org/reference/p5/background/"
    },
  
    // --- COLOR UTILITIES ---
    {
      label: "alpha",
      type: "function",
      detail: "(color)",
      info: "Extracts the alpha (transparency) value from a color.",
      link: "https://p5js.org/reference/p5/alpha/"
    },
    {
      label: "red",
      type: "function",
      detail: "(color)",
      info: "Extracts the red value from a color.",
      link: "https://p5js.org/reference/p5/red/"
    },
    {
      label: "green",
      type: "function",
      detail: "(color)",
      info: "Extracts the green value from a color.",
      link: "https://p5js.org/reference/p5/green/"
    },
    {
      label: "blue",
      type: "function",
      detail: "(color)",
      info: "Extracts the blue value from a color.",
      link: "https://p5js.org/reference/p5/blue/"
    },
    {
      label: "color",
      type: "function",
      detail: "(v1, v2, v3, [alpha])",
      info: "Creates colors for storing in variables of the color datatype.",
      link: "https://p5js.org/reference/p5/color/"
    },
    {
      label: "lerpColor",
      type: "function",
      detail: "(c1, c2, amt)",
      info: "Blends two colors to find a third color somewhere between them.",
      link: "https://p5js.org/reference/p5/lerpColor/"
    },
  
    // --- TYPOGRAPHY ---
    {
      label: "text",
      type: "function",
      detail: "(str, x, y)",
      info: "Draws text to the screen.",
      link: "https://p5js.org/reference/p5/text/"
    },
    {
      label: "textAlign",
      type: "function",
      detail: "(horiz, [vert])",
      info: "Sets the current alignment for drawing text (LEFT, CENTER, RIGHT).",
      link: "https://p5js.org/reference/p5/textAlign/"
    },
    {
      label: "textSize",
      type: "function",
      detail: "(theSize)",
      info: "Sets/gets the current font size.",
      link: "https://p5js.org/reference/p5/textSize/"
    },
    {
      label: "textStyle",
      type: "function",
      detail: "(theStyle)",
      info: "Sets/gets the styling for text (NORMAL, ITALIC, or BOLD).",
      link: "https://p5js.org/reference/p5/textStyle/"
    },
    {
      label: "textFont",
      type: "function",
      detail: "(font)",
      info: "Sets the current font that will be drawn with the text() function.",
      link: "https://p5js.org/reference/p5/textFont/"
    },
  
    // --- IMAGES ---
    {
      label: "image",
      type: "function",
      detail: "(img, x, y, [w], [h])",
      info: "Draws an image to the p5.js canvas.",
      link: "https://p5js.org/reference/p5/image/"
    },
    {
      label: "tint",
      type: "function",
      detail: "(v1, v2, v3, [a])",
      info: "Sets the fill value for displaying images. Images can be tinted to specified colors or made transparent.",
      link: "https://p5js.org/reference/p5/tint/"
    },
    {
      label: "noTint",
      type: "function",
      detail: "()",
      info: "Removes the current fill value for displaying images.",
      link: "https://p5js.org/reference/p5/noTint/"
    },
  
    // --- MASKING & CLIPPING ---
    {
      label: "beginClip",
      type: "function",
      detail: "([options])",
      info: "Starts defining a mask/clip shape. Must be followed by endClip().",
      link: "https://p5js.org/reference/p5/beginClip/"
    },
    {
      label: "endClip",
      type: "function",
      detail: "()",
      info: "Ends defining a mask/clip shape.",
      link: "https://p5js.org/reference/p5/endClip/"
    },
    {
      label: "beginContour",
      type: "function",
      detail: "()",
      info: "Use to create negative shapes within shapes (like a hole in a donut).",
      link: "https://p5js.org/reference/p5/beginContour/"
    },
    {
      label: "endContour",
      type: "function",
      detail: "()",
      info: "Ends a contour created by beginContour().",
      link: "https://p5js.org/reference/p5/endContour/"
    },
    {
      label: "erase",
      type: "function",
      detail: "([strengthFill], [strengthStroke])",
      info: "All drawing that follows will subtract from the canvas, acting as an eraser.",
      link: "https://p5js.org/reference/p5/erase/"
    },
    {
      label: "noErase",
      type: "function",
      detail: "()",
      info: "Ends erasing and returns to normal drawing.",
      link: "https://p5js.org/reference/p5/noErase/"
    },
  
    // --- MATH ---
    {
      label: "abs",
      type: "function",
      detail: "(n)",
      info: "Calculates the absolute value (magnitude) of a number.",
      link: "https://p5js.org/reference/p5/abs/"
    },
    {
      label: "ceil",
      type: "function",
      detail: "(n)",
      info: "Calculates the closest integer value that is greater than or equal to the value of the parameter.",
      link: "https://p5js.org/reference/p5/ceil/"
    },
    {
      label: "floor",
      type: "function",
      detail: "(n)",
      info: "Calculates the closest integer value that is less than or equal to the value of the parameter.",
      link: "https://p5js.org/reference/p5/floor/"
    },
    {
      label: "round",
      type: "function",
      detail: "(n)",
      info: "Calculates the closest integer to the parameter.",
      link: "https://p5js.org/reference/p5/round/"
    },
    {
      label: "max",
      type: "function",
      detail: "(n0, n1)",
      info: "Determines the largest value in a sequence of numbers.",
      link: "https://p5js.org/reference/p5/max/"
    },
    {
      label: "min",
      type: "function",
      detail: "(n0, n1)",
      info: "Determines the smallest value in a sequence of numbers.",
      link: "https://p5js.org/reference/p5/min/"
    },
    {
      label: "dist",
      type: "function",
      detail: "(x1, y1, x2, y2)",
      info: "Calculates the distance between two points.",
      link: "https://p5js.org/reference/p5/dist/"
    },
    {
      label: "exp",
      type: "function",
      detail: "(n)",
      info: "Returns Euler's number e raised to the power of n.",
      link: "https://p5js.org/reference/p5/exp/"
    },
    {
      label: "pow",
      type: "function",
      detail: "(n, e)",
      info: "Facilitates exponential expressions. Returns n raised to the power of e.",
      link: "https://p5js.org/reference/p5/pow/"
    },
    {
      label: "random",
      type: "function",
      detail: "([min], [max])",
      info: "Returns a random floating-point number. If two arguments are given, it returns a number between them.",
      link: "https://p5js.org/reference/p5/random/"
    },
    {
      label: "randomGaussian",
      type: "function",
      detail: "([mean], [sd])",
      info: "Returns a random number fitting a Gaussian, or normal, distribution.",
      link: "https://p5js.org/reference/p5/randomGaussian/"
    },
    {
      label: "randomSeed",
      type: "function",
      detail: "(seed)",
      info: "Sets the seed value for random(), making random values predictable.",
      link: "https://p5js.org/reference/p5/randomSeed/"
    },
    {
      label: "cos",
      type: "function",
      detail: "(angle)",
      info: "Calculates the cosine of an angle.",
      link: "https://p5js.org/reference/p5/cos/"
    },
    {
      label: "sin",
      type: "function",
      detail: "(angle)",
      info: "Calculates the sine of an angle.",
      link: "https://p5js.org/reference/p5/sin/"
    },
    {
      label: "tan",
      type: "function",
      detail: "(angle)",
      info: "Calculates the tangent of an angle.",
      link: "https://p5js.org/reference/p5/tan/"
    },
  
    // --- TRANSFORMS ---
    {
      label: "push",
      type: "function",
      detail: "()",
      info: "Saves the current drawing style settings and transformations.",
      link: "https://p5js.org/reference/p5/push/"
    },
    {
      label: "pop",
      type: "function",
      detail: "()",
      info: "Restores drawing style settings and transformations to when push() was called.",
      link: "https://p5js.org/reference/p5/pop/"
    },
    {
      label: "translate",
      type: "function",
      detail: "(x, y)",
      info: "Shifts the origin (0, 0) to a new set of coordinates.",
      link: "https://p5js.org/reference/p5/translate/"
    },
    {
      label: "rotate",
      type: "function",
      detail: "(angle)",
      info: "Rotates a shape around the current origin. Use translate() to change the origin.",
      link: "https://p5js.org/reference/p5/rotate/"
    },
    {
      label: "scale",
      type: "function",
      detail: "(s)",
      info: "Increases or decreases the size of a shape by expanding or contracting vertices.",
      link: "https://p5js.org/reference/p5/scale/"
    },
    {
      label: "shearX",
      type: "function",
      detail: "(angle)",
      info: "Shears a shape around the x-axis the amount specified by the angle parameter.",
      link: "https://p5js.org/reference/p5/shearX/"
    },
    {
      label: "shearY",
      type: "function",
      detail: "(angle)",
      info: "Shears a shape around the y-axis the amount specified by the angle parameter.",
      link: "https://p5js.org/reference/p5/shearY/"
    },
  
    // --- ENVIRONMENT / SYSTEM ---
    {
      label: "setup",
      type: "function",
      detail: "()",
      info: "Called once when the program starts. Used to define initial environment properties.",
      link: "https://p5js.org/reference/p5/setup/"
    },
    {
      label: "draw",
      type: "function",
      detail: "()",
      info: "Called directly after setup(). Executes its code block repeatedly until stopped.",
      link: "https://p5js.org/reference/p5/draw/"
    },
    {
      label: "cursor",
      type: "function",
      detail: "(type)",
      info: "Sets the cursor to a predefined symbol, an image, or makes it visible if already hidden.",
      link: "https://p5js.org/reference/p5/cursor/"
    },
    {
      label: "print",
      type: "function",
      detail: "(contents)",
      info: "Writes to the web console. Helpful for debugging.",
      link: "https://p5js.org/reference/p5/print/"
    },
    {
      label: "frameRate",
      type: "function",
      detail: "([fps])",
      info: "Specifies the number of frames to be displayed every second.",
      link: "https://p5js.org/reference/p5/frameRate/"
    },
    {
      label: "frameCount",
      type: "variable",
      detail: "Number",
      info: "The system variable that contains the number of frames that have been displayed since the program started.",
      link: "https://p5js.org/reference/p5/frameCount/"
    },
    {
      label: "millis",
      type: "function",
      detail: "()",
      info: "Returns the number of milliseconds (thousandths of a second) since starting the program.",
      link: "https://p5js.org/reference/p5/millis/"
    },
  
    // --- MOUSE & TOUCH INPUT ---
    {
      label: "mouseX",
      type: "variable",
      detail: "Number",
      info: "The system variable that contains the current horizontal position of the mouse.",
      link: "https://p5js.org/reference/p5/mouseX/"
    },
    {
      label: "mouseY",
      type: "variable",
      detail: "Number",
      info: "The system variable that contains the current vertical position of the mouse.",
      link: "https://p5js.org/reference/p5/mouseY/"
    },
    {
      label: "mouseClicked",
      type: "function",
      detail: "()",
      info: "Function called once after a mouse button has been pressed and then released.",
      link: "https://p5js.org/reference/p5/mouseClicked/"
    },
    {
      label: "doubleClicked",
      type: "function",
      detail: "()",
      info: "Function called once after a mouse button is pressed twice very quickly.",
      link: "https://p5js.org/reference/p5/doubleClicked/"
    },
    {
      label: "mouseMoved",
      type: "function",
      detail: "()",
      info: "Function called every time the mouse moves and a mouse button is not pressed.",
      link: "https://p5js.org/reference/p5/mouseMoved/"
    },
    {
      label: "mousePressed",
      type: "function",
      detail: "()",
      info: "Function called once after every time a mouse button is pressed.",
      link: "https://p5js.org/reference/p5/mousePressed/"
    },
    {
      label: "touchStarted",
      type: "function",
      detail: "()",
      info: "Function called once after every time a touch is registered.",
      link: "https://p5js.org/reference/p5/touchStarted/"
    },
    {
      label: "touchEnded",
      type: "function",
      detail: "()",
      info: "Function called once after every time a touch ends.",
      link: "https://p5js.org/reference/p5/touchEnded/"
    },
    {
      label: "touchMoved",
      type: "function",
      detail: "()",
      info: "Function called every time a touch moves.",
      link: "https://p5js.org/reference/p5/touchMoved/"
    },
    {
      label: "touches",
      type: "variable",
      detail: "Array",
      info: "System variable containing an array of objects relating to current touch points.",
      link: "https://p5js.org/reference/p5/touches/"
    },
  
    // --- KEYBOARD INPUT ---
    {
      label: "key",
      type: "variable",
      detail: "String",
      info: "The system variable that contains the value of the most recent key on the keyboard that was typed.",
      link: "https://p5js.org/reference/p5/key/"
    },
    {
      label: "keyCode",
      type: "variable",
      detail: "Number",
      info: "The system variable used to detect special keys such as BACKSPACE, ENTER, or arrow keys.",
      link: "https://p5js.org/reference/p5/keyCode/"
    },
    {
      label: "keyIsPressed",
      type: "variable",
      detail: "Boolean",
      info: "True if any key is pressed, false if no keys are pressed.",
      link: "https://p5js.org/reference/p5/keyIsPressed/"
    },
    {
      label: "keyIsDown",
      type: "function",
      detail: "(code)",
      info: "Checks if a specific key is currently held down.",
      link: "https://p5js.org/reference/p5/keyIsDown/"
    },
    {
      label: "keyPressed",
      type: "function",
      detail: "()",
      info: "Function called once every time a key is pressed.",
      link: "https://p5js.org/reference/p5/keyPressed/"
    },
    {
      label: "keyReleased",
      type: "function",
      detail: "()",
      info: "Function called once every time a key is released.",
      link: "https://p5js.org/reference/p5/keyReleased/"
    },
    {
      label: "keyTyped",
      type: "function",
      detail: "()",
      info: "Function called once every time a key is pressed, but action keys like Ctrl or Shift are ignored.",
      link: "https://p5js.org/reference/p5/keyTyped/"
    },
  
    // --- ARRAYS ---
    {
      label: "append",
      type: "function",
      detail: "(array, value)",
      info: "Adds a value to the end of an array.",
      link: "https://p5js.org/reference/p5/append/"
    },
    {
      label: "concat",
      type: "function",
      detail: "(a, b)",
      info: "Concatenates two arrays, returning a new array.",
      link: "https://p5js.org/reference/p5/concat/"
    },
    {
      label: "splice",
      type: "function",
      detail: "(list, value, position)",
      info: "Inserts a value or an array of values into an existing array.",
      link: "https://p5js.org/reference/p5/splice/"
    },
    {
      label: "sort",
      type: "function",
      detail: "(list, [count])",
      info: "Sorts an array of numbers from smallest to largest, or strings alphabetically.",
      link: "https://p5js.org/reference/p5/sort/"
    }
  ];