export interface FriendlyError {
    message: string;
    hint: string;
    line?: number;
  }

  const TEMPLATE_LINE_OFFSET : number = 56;
  
  export function translateRuntimeError(rawMessage: string, stack?: string): FriendlyError {
    let message = "Something went wrong!";
    let hint = rawMessage; // Defaults to the full error message
    let line: number | undefined = undefined;
  
    // Handle p5.js errors
    if (rawMessage.includes("p5.js says")) {
      // Extract line number directly from the message string (e.g., "line 59")
      const p5LineMatch = rawMessage.match(/line\s+(\d+)/i);
      if (p5LineMatch && p5LineMatch[1]) {
        line = parseInt(p5LineMatch[1], 10) - TEMPLATE_LINE_OFFSET; // Apply custom iframe offset
      }
  
      // Extract the culprit variable name inside the double quotes (e.g., "hello" or "abc")
      const quotedMatch = rawMessage.match(/"([^"]+)"/);
      const variableName = quotedMatch ? quotedMatch[1] : "something";
  
      // Route to friendly summaries based on what p5 caught
      if (rawMessage.includes("is not defined") || rawMessage.includes("accidentally written")) {
        message = `The computer doesn't know what "${variableName}" means.`;
      } else {
        // Fallback summary wrapper for other p5 rules until you expand your list
        message = "p5.js noticed a mistake in how this code is written.";
      }
  
      // return friendly summary and full raw p5 message as the hint
      return { 
        message, 
        hint: rawMessage, 
        line 
      };
    }
  
    // Fallback for standard errors
    const cleanMessage = rawMessage
      .replace(/^Uncaught\s+/, "")
      .replace(/^[a-zA-Z]+Error:\s+/, "");
  
    if (stack) {
      const stackLines = stack.split("\n");
      for (const stackLine of stackLines) {
        if (stackLine.includes("at ")) {
          const lineMatch = stackLine.match(/(?::|line\s)(\d+)(?::\d+)?/);
          if (lineMatch && lineMatch[1]) {
            line = parseInt(lineMatch[1], 10) - TEMPLATE_LINE_OFFSET; // Apply custom iframe offset
            break; 
          }
        }
      }
    }
  
    if (cleanMessage.includes("is not defined")) {
      const variableName = cleanMessage.split(" ")[0] || "something";
      message = `The computer doesn't know what "${variableName}" means.`;
      hint = `Did you misspell it, or forget to create it using "let ${variableName}" or "const ${variableName}" at the top?`;
    } else if (cleanMessage.includes("is not a function")) {
      const functionName = cleanMessage.split(" ")[0] || "This";
      message = `You tried to use "${functionName}" as an action, but it isn't one.`;
      hint = "Check your spelling! For example, make sure it is 'ellipse' instead of 'elipse', or 'background' instead of 'back ground'.";
    } else if (cleanMessage.includes("Unexpected token")) {
      message = "There is a typo or an extra symbol in your code.";
      hint = "This usually means a parenthesis '()', bracket '{}', or comma ',' is missing or in the wrong spot.";
    } else {
      hint = cleanMessage;
    }
  
    return { message, hint, line };
  }