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
            // Combine both error logs if they both exist!
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
              // Clear out tracking states
              pendingP5Error = null;
              pendingNativeError = null;
            }
          }

          const originalLog = console.log;
          console.log = function(...args) {
            if (typeof args[0] === 'string' && args[0].includes('p5.js says')) {
              if (!pendingP5Error) {
                pendingP5Error = args.join('\\n'); 
              }
              clearTimeout(errorTimeout);
              errorTimeout = setTimeout(sendErrorToParent, 50);
            }
            originalLog.apply(console, args);
          };

          window.onerror = function(message, source, lineno, colno, error) {
            // We explicitly tag this with a clear line wrapper for our regex parser
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