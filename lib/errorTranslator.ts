export interface FriendlyError {
    message: string;
    hint: string;
    line?: number;
  }
  
  export function translateRuntimeError(rawMessage: string, stack?: string): FriendlyError {
    let message = "Something went wrong!";
    let hint = "Double-check your spelling and look for missing symbols nearby.";
    let line: number | undefined = undefined;
  
    // Strip away browser prefixes if they exist
    // This turns "Uncaught ReferenceError: hello is not defined" into "hello is not defined"
    const cleanMessage = rawMessage
      .replace(/^Uncaught\s+/, "")
      .replace(/^[a-zA-Z]+Error:\s+/, "");
  
    if (stack) {
      // Splitting by lines lets us inspect the top of the stack trace
      const stackLines = stack.split("\n");
      // Look at the first few lines of the stack trace for a line number
      for (const stackLine of stackLines) {
        // Avoid matching line numbers from internal script tags if possible
        if (stackLine.includes("at ")) {
          const lineMatch = stackLine.match(/(?::|line\s)(\d+)(?::\d+)?/);
          if (lineMatch && lineMatch[1]) {
            line = parseInt(lineMatch[1], 10);
            
            // subtract offset from generateP5Html template
            line = line - 34;
            
            break; // Stop at the first valid line number we find
          }
        }
      }
    }
  
    // Translate the clean message
    if (cleanMessage.includes("is not defined")) {
      // Safely grab the first word of our clean message, which is now "hello"
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
  
    return { message, hint, line };
  }