/**
 * This function takes the raw code from the collaborative editor
 * and wraps it in a full HTML document that the <iframe> can run.
 * IMPORTANT: errorTranslator.ts needs the offset (# of lines inserted before userCode)
 */
export const generateP5Html = (userCode: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        
        <script>
          let errorTimeout = null;
          let pendingError = null;

          function sendErrorToParent() {
            if (pendingError) {
              window.parent.postMessage({ type: 'P5_RUNTIME_ERROR', message: pendingError }, '*');
              pendingError = null; 
            }
          }

          const originalLog = console.log;
          console.log = function(...args) {
            if (typeof args[0] === 'string' && args[0].includes('p5.js says')) {
              pendingError = args.join('\\n'); 
              clearTimeout(errorTimeout);
              errorTimeout = setTimeout(sendErrorToParent, 50);
            }
            originalLog.apply(console, args);
          };

          window.onerror = function(message) {
            if (!pendingError || !pendingError.includes('p5.js says')) {
              pendingError = message;
            }
            clearTimeout(errorTimeout);
            errorTimeout = setTimeout(sendErrorToParent, 50);
            return false;
          };

          window.addEventListener('unhandledrejection', function(event) {
            if (!pendingError || !pendingError.includes('p5.js says')) {
              pendingError = event.reason ? event.reason.toString() : 'Unknown Error';
            }
            clearTimeout(errorTimeout);
            errorTimeout = setTimeout(sendErrorToParent, 50);
          });
        </script>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.js"></script>
        
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            overflow: hidden; 
            background-color: #f0f0f0; 
          }
          canvas { 
            display: block; 
          }
        </style>
      </head>
      <body>
        <script>
          ${userCode}

          // Force the canvas to resize if the window changes
          function windowResized() {
            if (typeof resizeCanvas === 'function') {
              resizeCanvas(windowWidth, windowHeight);
            }
          }
          
          // (The old rogue window.addEventListener is now deleted from here!)
        </script>
      </body>
    </html>
  `;
};