import { useState } from 'react';
import { p5BasicDocs } from '@/lib/p5Docs';

export const DocsPanel = () => {
  const [search, setSearch] = useState("");

  // Filter our cheat sheet based on the search string
  const filteredDocs = p5BasicDocs.filter(doc => 
    doc.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-64 bg-white border-t border-gray-200 p-4 overflow-y-auto">
      <input 
        type="text" 
        placeholder="Search p5.js functions (e.g., 'color', 'rect')..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-4 text-gray-700"
      />
      
      <div className="grid grid-cols-2 gap-4">
        {filteredDocs.map(doc => (
          <div key={doc.label} className="border border-gray-100 p-3 rounded shadow-sm bg-gray-50">
            <h3 className="font-bold text-pink-500 font-mono">
              {doc.label} <span className="text-gray-500 font-normal">{doc.detail}</span>
            </h3>
            <p className="text-sm text-gray-700 mt-1">{doc.info}</p>
          </div>
        ))}
        
        {filteredDocs.length === 0 && (
            <div className="text-gray-400 italic">No functions found matching "{search}"</div>
        )}
      </div>
    </div>
  );
};