import { useEffect, useState, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export const useCollab = (roomId: string) => {
  const [code, setCode] = useState<string>(`function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
  fill(255, 0, 0);
  ellipse(mouseX, mouseY, 50, 50);
}`); // saves string
  const providerRef = useRef<WebsocketProvider | null>(null);
  const ytextRef = useRef<Y.Text | null>(null);

  useEffect(() => {
    // Create a Yjs Document (holds shared data)
    const ydoc = new Y.Doc();

    // Connect to a WebSocket Server
    // For development, public demo server for now
    // 'wss://demos.yjs.dev' is a free relay provided by the Yjs creators.
    const provider = new WebsocketProvider(
      'wss://demos.yjs.dev', 
      `p5-collab-${roomId}`, 
      ydoc
    );

    // Define a "Shared Text" type
    const ytext = ydoc.getText('codemirror');
    ytextRef.current = ytext;
    providerRef.current = provider;

    // Listen for changes from other users
    ytext.observe(() => {
      // Whenever the shared text changes, update our local React state
      setCode(ytext.toString());
    });

    // Clean up the connection when the user leaves the page
    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, [roomId]);

  // A function to update the shared text when WE type
  const handleUpdate = (newText: string) => {
    if (ytextRef.current && newText !== ytextRef.current.toString()) {
      // Yjs is smart: it calculates the difference and sends only the change
      ytextRef.current.delete(0, ytextRef.current.length);
      ytextRef.current.insert(0, newText);
    }
  };

  return { code, handleUpdate };
};