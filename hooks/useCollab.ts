import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const codeTemplate = `function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
  fill(255, 0, 0);
  ellipse(mouseX, mouseY, 50, 50);
}
`;

const CURSOR_COLORS = ['#ec4899', '#8b5cf6', '#14b8a6', '#f59e0b', '#3b82f6'];

export const useCollab = (roomId: string) => {
  const [yjsState, setYjsState] = useState<{
    ydoc: Y.Doc | null;
    ytext: Y.Text | null;
    provider: WebsocketProvider | null;
    code: string; 
  }>({ ydoc: null, ytext: null, provider: null, code: '' });

  useEffect(() => {
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('codemirror');

    // Connect to server
    const provider = new WebsocketProvider(
      'wss://p5-collab.duckdns.org', 
      `p5-collab-${roomId}`, 
      ydoc
    ); 
    

    // Wait for the existing room data.
    // If it's empty after syncing, then we are the first person here and can insert the template
    provider.on('sync', (isSynced: boolean) => {
      if (isSynced && ytext.toString() === '') {
        ytext.insert(0, codeTemplate);
      }
    });

    const myColor = CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
    const myName = `Guest ${Math.floor(Math.random() * 100)}`;

    provider.awareness.setLocalStateField('user', {
        name: myName,
        color: myColor,
        colorLight: myColor + '40',
    });

    ytext.observe(() => {
      setYjsState(prev => ({ ...prev, code: ytext.toString() }));
    });

    setYjsState({ ydoc, ytext, provider, code: ytext.toString() });

    return () => {
      provider.awareness.setLocalState(null); // tells veryone to remove our cursor
      provider.destroy();
      ydoc.destroy();
    };
  }, [roomId]);

  return yjsState;
};