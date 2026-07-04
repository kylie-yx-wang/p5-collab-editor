import { useEffect, useState, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { fromHex } from '@/lib/utils';

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

export const useCollab = (roomId: string, nickname: string = "Anonymous", initialState?: any) => {
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

  // MAIN SETUP EFFECT
  useEffect(() => {
    // Wait for Supabase to finish fetching before we do ANYTHING
    if (initialState === undefined) return;

    if (!yjsRef.current) {
      console.log(`[NETWORK DEBUG] 🔌 Initializing WebSockets for room: ${roomId}...`);
      const ydoc = new Y.Doc();
      const ytext = ydoc.getText('codemirror');

      if (initialState) {
        try {
            const cleanUpdate = fromHex(initialState);
            Y.applyUpdate(ydoc, cleanUpdate);
            console.log(`[NETWORK DEBUG] 💾 Seeded Yjs doc from database.`);
        } catch (e) {
            console.error(`[NETWORK DEBUG] ❌ Failed to parse initial DB state.`, e);
        }
      } else {
        // ONLY insert the template if Supabase confirms this is a brand new project
        console.log(`[NETWORK DEBUG] ✨ Brand new project (no DB state), inserting template.`);
        ytext.insert(0, codeTemplate);
      }
      
      // Connect to the server
      const provider = new WebsocketProvider(
        'wss://p5-collab.duckdns.org', 
        `p5-collab-${roomId}`, 
        ydoc
      );
      
      yjsRef.current = { ydoc, ytext, provider };
    }

    const { ydoc, ytext, provider } = yjsRef.current;

    provider.on('status', (event: { status: string }) => {
      console.log(`[NETWORK DEBUG] 📡 Connection Status: ${event.status.toUpperCase()}`);
    });

    provider.on('connection-error', (error: any) => {
      console.warn(`[NETWORK DEBUG] ❌ Connection Error!`, error);
    });

    const timeoutId = setTimeout(() => {
      if (!provider.wsconnected) {
        console.error(`[NETWORK DEBUG] ⏰ TIMEOUT: 10 seconds passed and the WebSocket never connected.`);
      }
    }, 10000);

    const handleSync = (isSynced: boolean) => {
      console.log(`[NETWORK DEBUG] 🔄 Sync achieved! isSynced: ${isSynced}`);
      // Updates react state
      if (isSynced) {
        setYjsState({ ydoc, ytext, provider, code: ytext.toString() });
      }
    };

    if (provider.synced) {
      handleSync(true);
    } else {
      provider.on('sync', handleSync);
    }

    // Set initial awareness
    const myColor = CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
    provider.awareness.setLocalStateField('user', {
        name: nickname,
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
  }, [roomId, initialState]); 

  // NICKNAME CHANGE EFFECT
  useEffect(() => {
    const provider = yjsRef.current?.provider;
    
    // Once the provider is ready and we have a real name, broadcast it
    if (provider && provider.awareness && nickname !== "Loading...") {
      
      // Grab the existing state so we don't accidentally overwrite their cursor color
      const existingState = provider.awareness.getLocalState();
      const existingUser = existingState?.user || {};

      provider.awareness.setLocalStateField('user', {
        ...existingUser, // Keeps their color
        name: nickname,  // Updates their name
      });
    }
  }, [nickname]);

  // CLEANUP EFFECT (Runs on unmount)
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