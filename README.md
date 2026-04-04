Description:
Web-based collaborative p5 platform, aimed at students for educational purposes
4/4/26

Log:
 - 4/4/26 created repository and folder/file layout, static code/preview page
 - 

Planned layout:
p5-collab/
├── app/
│   ├── layout.tsx       # Root layout (Fonts, Metadata)
│   └── page.tsx         # Main entry point (The Workspace)
├── components/
│   ├── Editor.tsx       # CodeMirror 6 component with Yjs integration
│   ├── Preview.tsx      # The sandboxed iframe for p5.js rendering
│   ├── Toolbar.tsx      # Play/Stop buttons and Room status
│   └── UserList.tsx     # Shows who is currently in the Room
├── hooks/
│   └── useCollab.ts     # Custom hook managing Yjs, Providers, and Awareness
├── lib/
│   ├── p5-template.ts   # Helper to wrap raw JS into a p5.js HTML boilerplate
│   └── utils.ts         # General styling/formatting helpers
├── public/              # Static assets (logos, default p5.js library)
└── tailwind.config.ts   # UI styling configurations


Note: run on http://localhost:3000 with:
npm run dev