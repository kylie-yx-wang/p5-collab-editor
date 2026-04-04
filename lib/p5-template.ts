/**
 * This function takes the raw code from the collaborative editor
 * and wraps it in a full HTML document that the <iframe> can run.
 */
export const generateP5Html = (userCode: string): string => {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
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
            // wrap the user's code in a try/catch block.
            // This prevents a typo from crashing everything.
            try {
              ${userCode}
            } catch (error) {
              // We send the error back to the app
              // so we can show a "friendly" error message later.
              console.error("p5.js Runtime Error:", error);
            }
  
            // Force the canvas to resize if the window changes
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