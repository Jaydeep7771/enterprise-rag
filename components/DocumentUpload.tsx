"use client";

import { useState, useRef, useCallback } from "react";
import type { UploadedDocument } from "@/lib/types";

export default function DocumentUpload() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    const tempId = `doc-${Date.now()}`;
    const tempDoc: UploadedDocument = {
      id: tempId,
      filename: file.name,
      size: file.size,
      chunksCount: 0,
      uploadedAt: new Date(),
      status: "processing",
    };
    setDocuments((prev) => [tempDoc, ...prev]);
    setUploadProgress(`Processing ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/ingest", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.details ? `${data.error} (${data.details})` : data.error || "Upload failed");
      }
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === tempId
            ? { ...doc, chunksCount: data.document.totalChunks, status: "ready" as const }
            : doc
        )
      );
      setUploadProgress(`✓ ${file.name} — ${data.document.totalChunks} chunks extracted`);
      setTimeout(() => setUploadProgress(null), 4000);
    } catch (error) {
      console.error("Upload error:", error);
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === tempId ? { ...doc, status: "error" as const } : doc))
      );
      setUploadProgress(`✕ Failed to process ${file.name}`);
      setTimeout(() => setUploadProgress(null), 4000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) Array.from(files).forEach(handleUpload);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) Array.from(e.dataTransfer.files).forEach(handleUpload);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div className="flex flex-col h-full" id="document-upload">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Knowledge Base</h2>
            <p className="text-[11px] text-slate-500">{documents.length} document{documents.length !== 1 ? "s" : ""} indexed</p>
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <div className="px-4 py-4">
        <div
          onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          id="drop-zone"
          className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-all duration-300 ${
            isDragging ? "border-violet-400 bg-violet-500/10 scale-[1.02]" : "border-white/[0.08] bg-white/[0.02] hover:border-violet-500/30 hover:bg-white/[0.04]"
          }`}
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${isDragging ? "bg-violet-500/20 scale-110" : "bg-white/[0.04]"}`}>
            <svg className={`w-5 h-5 transition-colors ${isDragging ? "text-violet-400" : "text-slate-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-300">{isDragging ? "Drop files here" : "Upload Documents"}</p>
            <p className="text-[11px] text-slate-500 mt-1">PDF, TXT, Markdown · Drag & drop or click</p>
          </div>
          <input ref={fileInputRef} type="file" accept=".pdf,.txt,.md,application/pdf,text/plain" onChange={handleFileChange} className="hidden" id="file-input" multiple />
        </div>
      </div>

      {/* Progress Banner */}
      {uploadProgress && (
        <div className="px-4 pb-2">
          <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 px-3 py-2 text-xs text-violet-300">{uploadProgress}</div>
        </div>
      )}

      {/* Document List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2" id="document-list">
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <svg className="w-8 h-8 text-slate-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <p className="text-xs text-slate-500">No documents yet</p>
            <p className="text-[10px] text-slate-600 mt-1">Upload files to build your knowledge base</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="group flex items-start gap-3 rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 hover:bg-white/[0.05] transition-all">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${doc.status === "processing" ? "bg-amber-500/10" : doc.status === "error" ? "bg-red-500/10" : "bg-emerald-500/10"}`}>
                {doc.status === "processing" ? (
                  <svg className="w-4 h-4 text-amber-400 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                ) : doc.status === "error" ? (
                  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
                ) : (
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-300 truncate">{doc.filename}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-[10px] text-slate-500">{formatSize(doc.size)}</span>
                  {doc.chunksCount > 0 && <><span className="text-slate-700">·</span><span className="text-[10px] text-slate-500">{doc.chunksCount} chunks</span></>}
                  <span className="text-slate-700">·</span>
                  <span className={`text-[10px] font-medium ${doc.status === "processing" ? "text-amber-400" : doc.status === "error" ? "text-red-400" : "text-emerald-400"}`}>
                    {doc.status === "processing" ? "Processing..." : doc.status === "error" ? "Failed" : "Indexed"}
                  </span>
                </div>
              </div>
              <button onClick={() => setDocuments((prev) => prev.filter((d) => d.id !== doc.id))} className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Remove">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Mode Indicator */}
      <div className="px-4 py-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </span>
          <span className="text-[10px] text-slate-500">UI-Dev Mode · Embeddings offline</span>
        </div>
      </div>
    </div>
  );
}
