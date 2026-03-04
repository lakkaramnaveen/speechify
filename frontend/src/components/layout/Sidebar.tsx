import React, { useRef } from "react";
import type { DocumentItem, DocumentId } from "../../types/documents";
import { DocumentList } from "../documents/DocumentList";

interface SidebarProps {
  documents: DocumentItem[];
  activeId: DocumentId | null;
  onSelectDocument(id: DocumentId): void;
  onCreateBlank(): void;
  onFileSelected(file: File): void;
  themeSwitcher: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  documents,
  activeId,
  onSelectDocument,
  onCreateBlank,
  onFileSelected,
  themeSwitcher
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onFileSelected(file);
    if (event.target) {
      event.target.value = "";
    }
  };

  return (
    <aside className="w-72 border-r border-slate-200 bg-white/80 backdrop-blur dark:bg-slate-900/60 dark:border-slate-800 flex flex-col">
      <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-primary-600">
            SpeechifyClone
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Your AI reader
          </div>
        </div>
        {themeSwitcher}
      </div>

      <div className="px-4 py-3 flex gap-2">
        <button
          onClick={onCreateBlank}
          className="flex-1 rounded-md bg-primary-600 text-white text-xs font-medium py-2 px-3 hover:bg-primary-700 transition"
        >
          New text
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 rounded-md border border-dashed border-slate-300 dark:border-slate-700 text-xs font-medium py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          Upload file
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="px-4 pb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        Documents
      </div>

      <DocumentList
        documents={documents}
        activeId={activeId}
        onSelect={onSelectDocument}
      />
    </aside>
  );
};

