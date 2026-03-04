import React from "react";
import type { DocumentItem, DocumentId } from "../../types/documents";

interface DocumentListProps {
  documents: DocumentItem[];
  activeId: DocumentId | null;
  onSelect(id: DocumentId): void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  activeId,
  onSelect
}) => {
  if (documents.length === 0) {
    return (
      <div className="text-xs text-slate-400 px-2 py-2">
        No documents yet. Create a new text or upload a file.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
      {documents.map((doc) => {
        const active = doc.id === activeId;
        return (
          <button
            key={doc.id}
            onClick={() => onSelect(doc.id)}
            className={`w-full text-left px-3 py-2 rounded-md text-xs transition border ${
              active
                ? "bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-600/20 dark:border-primary-500 dark:text-primary-100"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <div className="font-medium truncate">{doc.name}</div>
            <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
              {doc.text.slice(0, 80) || "Empty"}
            </div>
          </button>
        );
      })}
    </div>
  );
};

