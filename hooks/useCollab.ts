import { useEffect, useState, useRef } from 'react';
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
  const yjsRef = useRef<{
    ydoc: Y.Doc;
    ytext: Y.Text;
    provider: WebsocketProvider;
  } | null>(null);

  const [yjsState, setYjsState] = useState<{
    ydoc: Y.Doc | null;
    ytext: Y.Text | null;
    provider: WebsocketProvider | null;
    code: string; 
  }>({ ydoc: null, ytext: null, provider: null, code: '' });

  useEffect(() => {
    if (!yjsRef.current) {
      console.log(`[NETWORK DEBUG] 🔌 Initializing WebSockets for room: ${roomId}...`);
      const ydoc = new Y.Doc();
      const ytext = ydoc.getText('codemirror');
      
      // Connecting to the DuckDNS address
      const provider = new WebsocketProvider(
        'wss://p5-collab.duckdns.org', 
        `p5-collab-${roomId}`, 
        ydoc
      );
      
      yjsRef.current = { ydoc, ytext, provider };
    }

    const { ydoc, ytext, provider } = yjsRef.current;

    // --- NETWORK DEBUGGING ---
    provider.on('status', (event: { status: string }) => {
      console.log(`[NETWORK DEBUG] 📡 Connection Status: ${event.status.toUpperCase()}`);
    });

    provider.on('connection-error', (error: any) => {
      console.error(`[NETWORK DEBUG] ❌ Connection Error! Could not reach the server.`, error);
    });

    provider.on('connection-close', (event: any) => {
      console.warn(`[NETWORK DEBUG] 🚪 Connection Closed. Code: ${event?.code}, Reason: ${event?.reason}`);
    });

    // Timeout to detect a hanging connection
    const timeoutId = setTimeout(() => {
      if (!provider.wsconnected) {
        console.error(`[NETWORK DEBUG] ⏰ TIMEOUT: 5 seconds passed and the WebSocket never connected. Your server at p5-collab.duckdns.org is offline or unreachable.`);
      }
    }, 5000);
    // -----------------------------

    const handleSync = (isSynced: boolean) => {
      console.log(`[NETWORK DEBUG] 🔄 Sync achieved! isSynced: ${isSynced}`);
      if (isSynced) {
        if (ytext.toString().trim() === '') {
          console.log(`[NETWORK DEBUG] ✨ Empty document, inserting template.`);
          ytext.insert(0, codeTemplate);
        }
        setYjsState({ ydoc, ytext, provider, code: ytext.toString() });
      }
    };

    if (provider.synced) {
      handleSync(true);
    } else {
      provider.on('sync', handleSync);
    }

    const myColor = CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
    const myName = `Guest ${Math.floor(Math.random() * 100)}`;

    provider.awareness.setLocalStateField('user', {
        name: myName,
        color: myColor,
        colorLight: myColor + '40',
    });

    const handleTextChange = () => {
      setYjsState({ ydoc, ytext, provider, code: ytext.toString() });
    };
    
    ytext.observe(handleTextChange);
    setYjsState({ ydoc, ytext, provider, code: ytext.toString() });

    return () => {
      clearTimeout(timeoutId);
      ytext.unobserve(handleTextChange);
      provider.off('sync', handleSync); 
    };
  }, [roomId]);

  useEffect(() => {
    return () => {
      if (yjsRef.current) {
        yjsRef.current.provider.awareness.setLocalState(null);
        yjsRef.current.provider.destroy();
        yjsRef.current.ydoc.destroy();
        yjsRef.current = null;
      }
    };
  }, []);

  return yjsState;
};