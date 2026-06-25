export default function AllProjects() {
  return (
    <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#333]">Public Gallery</h1>
          <p className="text-[#999] mt-2">Explore and fork canvases created by the community.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="h-48 border border-[#f0f0f0] rounded-lg bg-white p-4 flex flex-col justify-between hover:shadow-sm transition cursor-pointer">
          <div className="h-24 bg-[#f0f0f0] rounded animate-pulse"></div>
          <div>
            <h3 className="font-semibold text-[#333]">Generative Art V1</h3>
            <p className="text-xs text-[#999]">By user_123 • 2 days ago</p>
          </div>
        </div>

        <div className="h-48 border border-[#f0f0f0] rounded-lg bg-white p-4 flex flex-col justify-between hover:shadow-sm transition cursor-pointer">
          <div className="h-24 bg-[#f0f0f0] rounded animate-pulse"></div>
          <div>
            <h3 className="font-semibold text-[#333]">Bouncing Balls</h3>
            <p className="text-xs text-[#999]">By user_456 • 5 hrs ago</p>
          </div>
        </div>
      </div>
    </main>
  );
}