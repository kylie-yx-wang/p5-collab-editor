export interface FriendlyError {
    message: string;
    hint: string;
    line?: number;
    url?: string;
  }
  
  const TEMPLATE_LINE_OFFSET: number = 74;
  
  export function translateRuntimeError(rawMessage: string, stack?: string): FriendlyError {
    let message = "Something went wrong!";
    let line: number | undefined = undefined;
    let url: string | undefined = undefined;
  
    // Unescape newlines sent from the iframe
    rawMessage = rawMessage.replace(/\\n/g, '\n');
  
    // Extract the URL and clean it out of the raw message
    const urlMatch = rawMessage.match(/(https?:\/\/[^\s)]+)/);
    if (urlMatch) {
        url = urlMatch[1];
        // Strip the "+ More info: <url>" text out of the message
        rawMessage = rawMessage.replace(/\+?\s*More info:\s*https?:\/\/[^\s)]+\)?/i, "").trim();
    }
  
    // Handle p5.js errors (NOTE: Added back the check for the specific scope warning!)
    if (rawMessage.includes("p5.js says") || rawMessage.includes("Did you just try to use p5.js")) {
        
        // Extract and fix the line number
        const p5LineMatch = rawMessage.match(/line\s+(\d+)/i);
        if (p5LineMatch && p5LineMatch[1]) {
            const rawLine = parseInt(p5LineMatch[1], 10);
            line = rawLine - TEMPLATE_LINE_OFFSET; 
            
            rawMessage = rawMessage.replace(new RegExp(`line ${rawLine}`, 'g'), `line ${line}`);
        }
  
        // Extract function names from parameter errors
        const funcExpectMatch = rawMessage.match(/([a-zA-Z0-9_]+)\(\)\s+was expecting/);
        const functionName = funcExpectMatch ? `${funcExpectMatch[1]}()` : "This function";
  
        // Extract standard variables safely
        let variableName = "something";
        const p5VariableMatch = rawMessage.match(/"([^"]+)"/);
        const tokenMatch = rawMessage.match(/Unexpected token '([^']+)'/);
  
        if (p5VariableMatch && p5VariableMatch[1]) {
          variableName = p5VariableMatch[1];
        } else if (tokenMatch && tokenMatch[1]) {
          variableName = tokenMatch[1];
        }
  
        // ROUTING P5.JS ERRORS
        if (rawMessage.includes("Did you just try to use p5.js's")) {
            const outOfScopeMatch = rawMessage.match(/p5\.js's ([a-zA-Z0-9_]+)\(\)/);
            const fnName = outOfScopeMatch ? outOfScopeMatch[1] : "a command";
            message = `You used "${fnName}()" in the wrong place.`;
            rawMessage = `You cannot use p5.js drawing commands that are floating around. Try moving "${fnName}()" inside your setup() or draw() block!`;
        }
        else if (rawMessage.includes("was expecting at least")) {
          const countMatch = rawMessage.match(/at least (\d+) arguments?, but received (?:only )?(\d+)/i);
          if (countMatch) {
            message = `"${functionName}" needs at least ${countMatch[1]} inputs, but it only got ${countMatch[2]}.`;
          } else {
            message = `"${functionName}" didn't get enough inputs.`;
          }
        } 
        else if (rawMessage.includes("was expecting no more than")) {
          const countMatch = rawMessage.match(/no more than (\d+) arguments?, but received (\d+)/i);
          if (countMatch) {
            message = `"${functionName}" can only take up to ${countMatch[1]} inputs, but you gave it ${countMatch[2]}.`;
          } else {
            message = `"${functionName}" was given too many inputs.`;
          }
        }
        else if (rawMessage.includes("was expecting") && rawMessage.includes("parameter")) {
            const typeMatch = rawMessage.match(/was expecting (\w+) for the (\w+) parameter, received (.*?) instead/i);
            if (typeMatch) {
              const [, expected, paramIdx, received] = typeMatch;
              message = `"${functionName}" expects a ${expected.toLowerCase()} for its ${paramIdx} input, but received ${received.trim().toLowerCase()}.`;
            } else {
              message = `One of the inputs to "${functionName}" is the wrong type.`;
            }
        }
        else if (rawMessage.includes("Syntax Error") || rawMessage.includes("Unexpected token")) {
            message = (p5VariableMatch || tokenMatch)
            ? `There is an unexpected symbol "${variableName}" in your code.` 
            : "There is a typo or an extra symbol in your code.";
        } 
        else if (rawMessage.includes("reserved function")) {
            message = `You can't name your variable "${variableName}".`;
            rawMessage = `p5.js already uses the word "${variableName}" for a built-in command. Try renaming your variable to something else!`;
        } 
        else if (rawMessage.includes("is used before declaration") || rawMessage.includes("before initialization")) {
            message = `You are trying to use "${variableName}" before you created it.`;
        } 
        else if (rawMessage.includes("is not defined")) {
            message = `The computer doesn't know what "${variableName}" means. It may have been declared in the wrong scope!`;
        } 
        else if (rawMessage.includes("could not be called as a function")) {
            const methodMatch = rawMessage.match(/"([^"]+)" could not be called as a function\. Verify whether "([^"]+)"/);
            if (methodMatch) {
              message = `You tried to use "${methodMatch[1]}()" on "${methodMatch[2]}", but "${methodMatch[2]}" doesn't have that action.`;
            } else {
              message = "You tried to call an action on a variable that doesn't support it.";
            }
          }
        else {
            message = "p5.js noticed a mistake in how this code is written.";
        }
  
        // We assign hint directly to rawMessage here because we updated rawMessage at the top of the block
        return { message, hint: rawMessage, line, url };
    }
  
    // --- Standard runtime errors ---
  
    // Extract and correct the line number first!
    if (stack) {
      const stackLines = stack.split("\n");
      for (const stackLine of stackLines) {
        if (stackLine.includes("at ")) {
          const lineMatch = stackLine.match(/(?::|line\s)(\d+)(?::\d+)?/);
          if (lineMatch && lineMatch[1]) {
            const rawLine = parseInt(lineMatch[1], 10);
            line = rawLine - TEMPLATE_LINE_OFFSET; 
            
            // Replace native line offset in the raw string
            rawMessage = rawMessage.replace(new RegExp(`line ${rawLine}`, 'g'), `line ${line}`);
            break;
          }
        }
      }
    }
  
    const cleanMessage = rawMessage
      .replace(/^Uncaught\s+/, "")
      .replace(/^[a-zA-Z]+Error:\s+/, "");
  
    let hint = rawMessage;
  
    // ROUTING STANDARD ERRORS
    if (cleanMessage.includes("destructuring assignment target") || cleanMessage.includes("Invalid destructuring")) {
      message = "There is a mistake in how your function is set up.";
      hint = "This usually happens if you accidentally open a curly bracket '{' inside a function's parenthesis '()', like 'function setup( {'. Take a look at your brackets!";
    } 
    else if (cleanMessage.includes("Unexpected end of input")) {
        message = "Your code ended before it was supposed to.";
        hint = "You are likely missing a closing curly bracket '}', parenthesis ')', or bracket ']' at the very end of your code.";
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
      // If it hits the fallback, it uses the cleaned message, which includes the corrected line number!
      hint = cleanMessage;
    }
  
    return { message, hint, line, url };
  }