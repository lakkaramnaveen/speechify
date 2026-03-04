import React from "react";

interface TextEditorProps {
  value: string;
  onChange(value: string): void;
}

export const TextEditor: React.FC<TextEditorProps> = ({ value, onChange }) => {
  return (
    <div className="w-1/2 flex flex-col">
      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
        Text input
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your book, article, or notes here..."
        className="flex-1 w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/70"
      />
    </div>
  );
};

