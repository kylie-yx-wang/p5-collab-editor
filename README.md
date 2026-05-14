Description:

Web-based collaborative p5 platform, aimed at students for educational purposes

Started 4/4/26

Log:
 - 4/4/26 created repository and folder/file layout, static code/preview page
 - 4/6/26 start working on collaboration logic (Yjs)
 - 4/7/26 Yjs properly functions
 - 4/10/26 pseudocode for CodeMirror, modularize (editor goes into Editor.tsx) - needs more testing
 - 5/14/26 custom themed object put into CodeMirror


Planned layout:

p5-collab/

├── app/

│   ├── layout.tsx       # Root layout (Fonts, Metadata)

│   └── page.tsx         # Main entry point (The Workspace)

├── components/

│   ├── Editor.tsx       # CodeMirror component with Yjs integration

│   ├── Preview.tsx      # The sandboxed iframe for p5.js rendering

│   ├── Toolbar.tsx      # Play/Stop buttons and Room status

│   └── UserList.tsx     # Shows who is currently in the Room

├── hooks/

│   └── useCollab.ts     # Custom hook managing Yjs and synchronization

├── lib/

│   ├── p5-template.ts   # Helper to wrap raw JS into a p5.js HTML boilerplate

│   └── utils.ts         # General styling/formatting helpers

├── public/              # Static assets (logos, default p5.js library)

└── tailwind.config.ts   # UI styling configurations



Note: run on http://localhost:3000 with:

npm run dev