"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GitHubIcon } from "@/app/home/components/icons";
import type { SkillSourceFile } from "@/lib/skill-detail";

type SkillFilePreviewProps = {
  file: SkillSourceFile | null;
  githubUrl: string | null;
  skillPath: string;
};

export function SkillFilePreview({
  file,
  githubUrl,
  skillPath,
}: SkillFilePreviewProps) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.push(skillPath, { scroll: false });
      }
    };

    if (file) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [file, router, skillPath]);

  if (!file) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-6 lg:p-8 overscroll-none" onPointerDown={(e) => e.stopPropagation()}>
      <div 
        className="absolute inset-0" 
        onClick={() => router.push(skillPath, { scroll: false })} 
      />
      <div className="relative flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl overscroll-none">
        <div className="flex shrink-0 items-center justify-between border-b border-border p-4 sm:px-6">
          <div className="min-w-0 flex-1 pr-4">
            <h2 className="truncate text-lg font-semibold text-text-primary">
              {file.path}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-3">
             <span className="tag hidden sm:inline-flex">{file.language}</span>
             {githubUrl ? (
               <a
                 href={githubUrl}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="btn-secondary whitespace-nowrap !px-3 !py-1.5 text-xs sm:!px-4 sm:!py-2 sm:text-sm"
               >
                 <GitHubIcon className="h-4 w-4" />
                 <span className="hidden sm:inline">Open on GitHub</span>
               </a>
             ) : null}
             <button
               className="btn-secondary shrink-0 !p-2"
               onClick={() => router.push(skillPath, { scroll: false })}
               aria-label="Close modal"
             >
               <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
             </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto bg-surface-elevated p-4 sm:p-6 overscroll-contain">
          {file.isBinary ? (
            <div className="flex h-full min-h-[50vh] items-center justify-center rounded-2xl border border-border bg-surface px-5 py-10 text-center text-sm text-text-secondary">
              This file is binary or not safely previewable in the browser.
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-surface overflow-x-auto">
              <table className="min-w-full border-collapse">
                <tbody>
                  {(file.content ?? "").split(/\r?\n/).map((line, index) => (
                    <tr key={index} className="align-top hover:bg-white/5">
                      <td className="select-none border-r border-border px-4 py-0.5 text-right align-top text-xs text-text-tertiary">
                        <span className="mono leading-6">{index + 1}</span>
                      </td>
                      <td className="px-4 py-0.5">
                        <pre className="mono text-sm leading-6 whitespace-pre text-text-secondary">
                          {line || " "}
                        </pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
