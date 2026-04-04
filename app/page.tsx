"use client"; // required for interactive parts like editors
// makes it a client component instead of doing it on the server

import { useState } from "react";
import { generateP5Html } from "@/lib/p5-template";

// create the actual webpage
export default function Home() {
  // state remembers what you type
  const [code, setCode] = useState(`function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
  fill(255, 0, 0);
  ellipse(mouseX, mouseY, 50, 50);
}`);

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-gray-900">
      
      {/* LEFT SIDE: The Code Input */}
      <div className="flex-1 flex flex-col border-r border-gray-700">
        <div className="bg-gray-800 text-white p-2 text-sm font-mono">editor.js</div>
        <textarea
          className="flex-1 p-4 bg-gray-900 text-green-400 font-mono text-sm outline-none resize-none"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck="false"
        />
      </div>

      {/* RIGHT SIDE: The p5.js Canvas */}
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