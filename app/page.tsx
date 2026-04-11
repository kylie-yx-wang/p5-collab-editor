"use client";

import { useCollab } from "@/hooks/useCollab"; // Import our new hook
import { generateP5Html } from "@/lib/p5-template";
import { Editor } from "@/components/Editor";

export default function Home() {
  // We call our hook. We'll give this room a name like "summer-camp-1"
  const { code, handleUpdate } = useCollab("summer-camp-1");

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-gray-900">
      {/* Editor Side */}
      {/* <div className="flex-1 flex flex-col border-r border-gray-700">
        <div className="bg-gray-800 text-white p-2 text-sm font-mono flex justify-between">
          <span>editor.js</span>
          <span className="text-green-500 text-xs">● Connected</span>
        </div>
        <textarea
          className="flex-1 p-4 bg-gray-900 text-green-400 font-mono text-sm outline-none resize-none"
          value={code}
          onChange={(e) => handleUpdate(e.target.value)}
          spellCheck="false"
          placeholder="Start coding together..."
        />
      </div> */}
      {/* 3. Drop the component in! */}
      {/* We pass the shared state down into the editor as "Props" */}
      <Editor 
        code={code} 
        onUpdate={handleUpdate} 
      />


      {/* Preview Side */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="bg-gray-200 text-gray-700 p-2 text-sm font-sans font-bold">Preview</div>
        <iframe
          srcDoc={generateP5Html(code)}
          className="flex-1 border-none"
          title="p5-preview"
          sandbox="allow-scripts"
        />
      </div>
    </main>
  );
}