export interface FriendlyError {
    message: string;
    hint: string;
    line?: number;
  }
  
  const TEMPLATE_LINE_OFFSET: number = 61;
  
  export function translateRuntimeError(rawMessage: string, stack?: string): FriendlyError {
    let message = "Something went wrong!";
    let hint = rawMessage; 
    let line: number | undefined = undefined;
  
    // Handle p5.js errors
    if (rawMessage.includes("p5.js says")) {
        
        // Scans left-to-right to grab the line number
        const p5LineMatch = rawMessage.match(/line\s+(\d+)/i);
        if (p5LineMatch && p5LineMatch[1]) {
            line = parseInt(p5LineMatch[1], 10) - TEMPLATE_LINE_OFFSET; 
        }
  
        // Extract function names from parameter errors (e.g., "ellipse() was expecting...")
        const funcExpectMatch = rawMessage.match(/([a-zA-Z0-9_]+)\(\)\s+was expecting/);
        const functionName = funcExpectMatch ? `${funcExpectMatch[1]}()` : "This function";
  
        // Extract standard variables safely (handling quotes)
        let variableName = "something";
        const p5VariableMatch = rawMessage.match(/"([^"]+)"/);
        const tokenMatch = rawMessage.match(/Unexpected token '([^']+)'/);
  
        if (p5VariableMatch && p5VariableMatch[1]) {
          variableName = p5VariableMatch[1];
        } else if (tokenMatch && tokenMatch[1]) {
          variableName = tokenMatch[1];
        }
  
        // ROUTING P5.JS ERRORS
  
        // Too few arguments (e.g., ellipse();)
        if (rawMessage.includes("was expecting at least")) {
          const countMatch = rawMessage.match(/at least (\d+) arguments?, but received (?:only )?(\d+)/i);
          if (countMatch) {
            message = `"${functionName}" needs at least ${countMatch[1]} inputs, but it only got ${countMatch[2]}.`;
          } else {
            message = `"${functionName}" didn't get enough inputs.`;
          }
        } 
        // Too many arguments (e.g., ellipse(200, 200, 30, 30, 50, 60);)
        else if (rawMessage.includes("was expecting no more than")) {
          const countMatch = rawMessage.match(/no more than (\d+) arguments?, but received (\d+)/i);
          if (countMatch) {
            message = `"${functionName}" can only take up to ${countMatch[1]} inputs, but you gave it ${countMatch[2]}.`;
          } else {
            message = `"${functionName}" was given too many inputs.`;
          }
        }
        // Type Mismatch (e.g., ellipse(200, 200, "hi", 30);)
        else if (rawMessage.includes("was expecting") && rawMessage.includes("parameter")) {
          const typeMatch = rawMessage.match(/was expecting (\w+) for the (\w+) parameter, received (\w+)/i);
          if (typeMatch) {
            const [, expected, paramIdx, received] = typeMatch;
            message = `"${functionName}" expects a ${expected.toLowerCase()} for its ${paramIdx} input, but got a ${received.toLowerCase()} instead.`;
          } else {
            message = `One of the inputs to "${functionName}" is the wrong type.`;
          }
        }
        // Syntax Errors
        else if (rawMessage.includes("Syntax Error") || rawMessage.includes("Unexpected token")) {
            message = (p5VariableMatch || tokenMatch)
            ? `There is an unexpected symbol "${variableName}" in your code.` 
            : "There is a typo or an extra symbol in your code.";
        } 
        // Reserved function name collisions
        else if (rawMessage.includes("reserved function")) {
            message = `You can't name your variable "${variableName}".`;
            rawMessage = `p5.js already uses the word "${variableName}" for a built-in command. Try renaming your variable to something else!`;
        } 
        // Scope / Temporal Dead Zone errors (e.g., used before declaration)
        else if (rawMessage.includes("is used before declaration") || rawMessage.includes("before initialization")) {
            message = `You are trying to use "${variableName}" before you created it.`;
        } else if (rawMessage.includes("is not defined")) {
            message = `The computer doesn't know what "${variableName}" means.`;
        }
        // Fallback summary
        else {
            message = "p5.js noticed a mistake in how this code is written.";
        }
  
        return { message, hint: rawMessage, line };
    }
  
    // Standard runtime errors
    const cleanMessage = rawMessage
      .replace(/^Uncaught\s+/, "")
      .replace(/^[a-zA-Z]+Error:\s+/, "");
  
    if (stack) {
      const stackLines = stack.split("\n");
      for (const stackLine of stackLines) {
        if (stackLine.includes("at ")) {
          const lineMatch = stackLine.match(/(?::|line\s)(\d+)(?::\d+)?/);
          if (lineMatch && lineMatch[1]) {
            line = parseInt(lineMatch[1], 10) - TEMPLATE_LINE_OFFSET; 
            break; 
          }
        }
      }
    }
  
    // Destructuring trap (e.g., function setup( {)
    if (cleanMessage.includes("destructuring assignment target") || cleanMessage.includes("Invalid destructuring")) {
      message = "There is a mistake in how your function is set up.";
      hint = "This usually happens if you accidentally open a curly bracket '{' inside a function's parenthesis '()', like 'function setup( {'. Take a look at your brackets!";
    } 
    else if (cleanMessage.includes("is not defined")) {
      const variableName = cleanMessage.split(" ")[0] || "something";
      message = `The computer doesn't know what "${variableName}" means.`;
      hint = `Did you misspell it, or forget to create it using "let ${variableName}" or "const ${variableName}" at the top?`;
    } 
    else if (cleanMessage.includes("is not a function")) {
      const functionName = cleanMessage.split(" ")[0] || "This";
      message = `You tried to use "${functionName}" as an action, but it isn't one.`;
      hint = "Check your spelling! For example, make sure it is 'ellipse' instead of 'elipse', or 'background' instead of 'back ground'.";
    } 
    else if (cleanMessage.includes("Unexpected token")) {
      message = "There is a typo or an extra symbol in your code.";
      hint = "This usually means a parenthesis '()', bracket '{}', or comma ',' is missing or in the wrong spot.";
    } 
    else {
      hint = cleanMessage;
    }
  
    return { message, hint, line };
  }