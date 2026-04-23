import ChatInterface from "@/components/ChatInterface";
import DocumentUpload from "@/components/DocumentUpload";

export default function Home() {
  return (
    <div className="flex flex-col h-full bg-[#080b14]" id="app-root">
      {/* ── Top Navigation Bar ── */}
      <header
        className="flex-none flex items-center justify-between px-6 py-3.5 border-b border-white/[0.06] bg-[#0e1120]/80 backdrop-blur-md z-20"
        id="top-nav"
        style={{ height: "60px" }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-500/30 animate-pulse-glow">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-100 leading-none">Enterprise RAG</h1>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-none">Document Intelligence Platform</p>
          </div>
        </div>

        {/* Center status badge */}
        <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/[0.03] border border-white/[0.06] px-4 py-1.5" id="status-badge">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </span>
          <span className="text-[11px] text-slate-400">UI-Development Mode</span>
          <span className="text-slate-600 text-[11px]">·</span>
          <span className="text-[11px] text-slate-500">AI offline — inject <code className="text-violet-400 font-mono">GOOGLE_API_KEY</code> to activate</span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px] text-slate-400">Supabase Connected</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-1.5">
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[11px] text-slate-400">Settings</span>
          </div>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex flex-1 overflow-hidden" id="main-layout">
        {/* Sidebar — Document Upload */}
        <aside
          className="w-72 flex-none border-r border-white/[0.06] bg-[#0e1120]/60 overflow-hidden animate-slide-in"
          id="sidebar"
          style={{ minWidth: "288px" }}
        >
          <DocumentUpload />
        </aside>

        {/* Main — Chat Interface */}
        <main className="flex-1 flex flex-col overflow-hidden" id="chat-main">
          {/* Chat header */}
          <div className="flex-none flex items-center justify-between px-6 py-3 border-b border-white/[0.06] bg-[#080b14]/40">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-violet-400" />
              <span className="text-sm font-medium text-slate-300">Chat</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-500">Powered by Google Gemini + pgvector RAG</span>
              <div className="h-4 w-px bg-white/[0.08]" />
              <span
                id="clear-chat-btn"
                className="text-[11px] text-slate-500"
              >
                Clear chat
              </span>
            </div>
          </div>

          {/* Chat body */}
          <div className="flex-1 overflow-hidden">
            <ChatInterface />
          </div>
        </main>
      </div>
    </div>
  );
}
