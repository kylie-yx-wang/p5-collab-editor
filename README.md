# Collaborative p5.js Platform

[in development]

**Description:** Web-based collaborative p5 platform, aimed at students for educational purposes.  
*Started: 4/4/26*

## Log:
- **4/4/26**: Created repository and file layout, static code/preview page
- **4/6/26**: Start working on collaboration logic (Yjs)
- **4/7/26**: Yjs properly functions
- **4/10/26**: Pseudocode for CodeMirror, editor goes into `Editor.tsx`
- **5/14/26**: Custom themed object put into CodeMirror
- **5/21/26**: Interview with Code/Art, received feedback on features
- **5/25/26**: Room capabilities based on link
- **5/26/26**: Create, join rooms page (no checks)
- **5/26/26**: Number slider. Contains bugs: does not recognize negative numbers, does not turn off on key (like arrow keys or esc key)
- **5/27/26**: Number slider bugs fixed, but questionable with floats
- **5/28/26**: Color picker
- **5/29/26**: Toggle button for auto-run
- **5/31/26**: Custom error messages code skeleton
- **6/1/26**: Switch Websocket to local hosting
- **6/10/26**: Finished custom error message display
- **6/11/26**: Started cursor display (required moving input sync logic into Ydoc)
- **6/13/26**: Debugged cursor display race condition
- **6/13/26**: Started documentation (need more controls, possibly --> snippet instead of signature)
- **6/16/26**: Added to documentation



## Planned layout:
```text
p5-collab/
    app/
        layout.tsx       # Root layout (Fonts, Metadata)
        page.tsx         # Main entry point (The Workspace)
    components/
        Editor.tsx       # CodeMirror component with Yjs integration
        Preview.tsx      # The sandboxed iframe for p5.js rendering
        Toolbar.tsx      # Play/Stop buttons and Room status
        UserList.tsx     # Shows who is currently in the Room
    hooks/
        useCollab.ts     # Custom hook managing Yjs and synchronization
    lib/
        p5-template.ts   # Helper to wrap raw JS into a p5.js HTML boilerplate
        utils.ts         # General styling/formatting helpers
    public/              # Static assets (logos, default p5.js library)
    tailwind.config.ts   # UI styling configurations
```

Run on http://localhost:3000 with ```npm run dev```