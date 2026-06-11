export const generateP5Html = (userCode: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
<script>
          let errorTimeout = null;
          let pendingP5Error = null;
          let pendingNativeError = null;

          function sendErrorToParent() {
            let finalMessage = "";
            if (pendingP5Error && pendingNativeError) {
              finalMessage = pendingP5Error + "\\n" + pendingNativeError;
            } else if (pendingP5Error) {
              finalMessage = pendingP5Error;
            } else if (pendingNativeError) {
              finalMessage = pendingNativeError;
            }

            if (finalMessage) {
              window.parent.postMessage({ type: 'P5_RUNTIME_ERROR', message: finalMessage }, '*');
              pendingP5Error = null;
              pendingNativeError = null;
            }
          }

          const originalLog = console.log;
          const originalWarn = console.warn;

          function processP5Log(args, originalFn) {
            if (typeof args[0] === 'string') {
              // Catch both the standard p5 prefix AND the specific scope warning
              if (args[0].includes('p5.js says') || args[0].includes('Did you just try to use p5.js')) {
                if (!pendingP5Error) {
                  pendingP5Error = args.join('\\n'); 
                } else if (!pendingP5Error.includes(args[0])) {
                  // If a second, different p5 message fires in the same cycle, glue it on!
                  pendingP5Error += "\\n" + args.join('\\n');
                }
                clearTimeout(errorTimeout);
                errorTimeout = setTimeout(sendErrorToParent, 50);
              }
            }
            originalFn.apply(console, args);
          }

          // Intercept both logs and warnings
          console.log = function(...args) { processP5Log(args, originalLog); };
          console.warn = function(...args) { processP5Log(args, originalWarn); };

          window.onerror = function(message, source, lineno, colno, error) {
            pendingNativeError = message + " (at line " + lineno + ")";
            clearTimeout(errorTimeout);
            errorTimeout = setTimeout(sendErrorToParent, 50);
            return false;
          };

          window.addEventListener('unhandledrejection', function(event) {
            pendingNativeError = event.reason ? event.reason.toString() : 'Unknown Error';
            clearTimeout(errorTimeout);
            errorTimeout = setTimeout(sendErrorToParent, 50);
          });
        </script>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.js"></script>
        
        <style>
          body { margin: 0; padding: 0; overflow: hidden; background-color: #f0f0f0; }
          canvas { display: block; }
        </style>
      </head>
      <body>
        <script>
          ${userCode}

          function windowResized() {
            if (typeof resizeCanvas === 'function') {
              resizeCanvas(windowWidth, windowHeight);
            }
          }
        </script>
      </body>
    </html>
  `;
};