import ChatInterface from "@/components/ChatInterface";
import DocumentUpload from "@/components/DocumentUpload";

export default function Home() {
  return (
    <div className="flex flex-col h-full bg-onyx-900 selection:bg-champagne/20" id="app-root">
      {/* ── Top Navigation Bar ── */}
      <header
        className="flex-none flex items-center justify-between px-6 py-3.5 glass-header z-20"
        id="top-nav"
        style={{ height: "64px" }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-onyx-700 to-onyx-800 border border-onyx-600 flex items-center justify-center shadow-lg shadow-black/50">
            <svg className="w-4 h-4 text-champagne drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div>
            <h1 className="text-[15px] font-medium text-onyx-100 tracking-wide leading-none">Enterprise RAG</h1>
            <p className="text-[11px] text-onyx-400 mt-1 uppercase tracking-widest leading-none font-medium">Document Intelligence</p>
          </div>
        </div>

        {/* Center status badge */}
        <div className="hidden sm:flex items-center gap-2 rounded-full bg-onyx-800/50 border border-onyx-700/50 px-4 py-1.5 shadow-inner" id="status-badge">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-champagne opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-champagne" />
          </span>
          <span className="text-[11px] font-medium tracking-wide text-onyx-300">Development Mode</span>
          <span className="text-onyx-600 text-[11px]">·</span>
          <span className="text-[11px] text-onyx-400">Offline Fallback Active</span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-lg bg-onyx-800/50 border border-onyx-700/50 px-3 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[11px] font-medium text-onyx-300 tracking-wide">Connected</span>
          </div>
          <button className="flex items-center justify-center w-8 h-8 rounded-lg bg-onyx-800/50 border border-onyx-700/50 text-onyx-400 hover:text-onyx-200 hover:bg-onyx-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex flex-1 overflow-hidden p-4 gap-4" id="main-layout">
        {/* Sidebar — Document Upload */}
        <aside
          className="w-80 flex-none glass-panel rounded-2xl overflow-hidden flex flex-col"
          id="sidebar"
          style={{ minWidth: "320px" }}
        >
          <DocumentUpload />
        </aside>

        {/* Main — Chat Interface */}
        <main className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden relative" id="chat-main">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-champagne/5 blur-[100px] pointer-events-none rounded-full" />
          
          {/* Chat header */}
          <div className="flex-none flex items-center justify-between px-8 py-4 border-b border-onyx-700/50 bg-onyx-900/40 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-champagne shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
              <span className="text-sm font-medium tracking-wide text-onyx-200">Active Session</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-mono text-onyx-500 uppercase tracking-wider">Powered by Gemini 2.5</span>
            </div>
          </div>

          {/* Chat body */}
          <div className="flex-1 overflow-hidden relative z-10">
            <ChatInterface />
          </div>
        </main>
      </div>
    </div>
  );
}
