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
          <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.js"></script>
          <script>
            window.onerror = function(message, source, lineno, colno, error) {
            // Delay the message by 50ms so React has time to mount the listener
            setTimeout(() => {
              window.parent.postMessage({
                type: 'P5_RUNTIME_ERROR',
                message: message,
                stack: error ? error.stack : ''
              }, '*');
            }, 50);
            return true; 
          };
          </script>
          
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

            window.addEventListener('error', function(event) {
            // Notify the main React window that an error occurred
            window.parent.postMessage({
              type: 'P5_RUNTIME_ERROR',
              message: event.message,
              stack: event.error ? event.error.stack : ''
            }, '*');
          });
          </script>
        </body>
      </html>
    `;
  };