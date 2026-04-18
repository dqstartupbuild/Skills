"use client";

import type { MouseEvent } from "react";
import { useState } from "react";
import { CheckIcon, CopyIcon } from "@/app/home/components/icons";

type CopyButtonProps = {
  textToCopy: string;
};

export function CopyButton({ textToCopy }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="text-text-tertiary hover:text-text-primary transition-colors flex items-center justify-center p-1 rounded"
      aria-label="Copy command"
      title="Copy to clipboard"
    >
      {copied ? (
        <CheckIcon className="w-3.5 h-3.5" stroke="var(--success)" />
      ) : (
        <CopyIcon className="w-3.5 h-3.5" />
      )}
    </button>
  );
}
