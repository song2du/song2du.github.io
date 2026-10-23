"use client";

import { useState } from "react";

export function Bibtex({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked; the text is still selectable.
    }
  }

  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-lg border border-line bg-surface p-4 pr-16 font-mono text-xs leading-5">
        {value}
      </pre>
      <button
        type="button"
        onClick={copy}
        className="absolute top-2 right-2 rounded-md border border-line bg-bg px-2 py-1 text-xs text-muted hover:text-fg"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
