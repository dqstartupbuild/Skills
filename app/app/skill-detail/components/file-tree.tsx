"use client";

import { useState } from "react";
import Link from "next/link";
import { FileIcon, FolderIcon } from "@/app/home/components/icons";
import type { SkillFileTreeNode } from "@/lib/skill-detail";

type SkillFileTreeProps = {
  nodes: SkillFileTreeNode[];
  selectedPath: string | null;
  skillPath: string;
};

export function SkillFileTree({
  nodes,
  selectedPath,
  skillPath,
}: SkillFileTreeProps) {
  return (
    <ul className="space-y-1">
      {nodes.map((node) => (
        <SkillFileTreeNodeItem
          key={node.path}
          node={node}
          selectedPath={selectedPath}
          skillPath={skillPath}
        />
      ))}
    </ul>
  );
}

type SkillFileTreeNodeItemProps = {
  depth?: number;
  node: SkillFileTreeNode;
  selectedPath: string | null;
  skillPath: string;
};

function SkillFileTreeNodeItem({
  depth = 0,
  node,
  selectedPath,
  skillPath,
}: SkillFileTreeNodeItemProps) {
  // Directories are collapsed by default, unless they contain the selected file
  const [isOpen, setIsOpen] = useState(() => {
    if (node.type !== "directory" || !selectedPath) return false;
    return selectedPath.startsWith(`${node.path}/`);
  });
  const indentation = `${depth * 0.9}rem`;

  if (node.type === "directory") {
    return (
      <li>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm text-text-secondary transition-colors hover:bg-white/3 hover:text-text-primary focus:outline-none"
          style={{ paddingLeft: `calc(${indentation} + 0.5rem)` }}
        >
          <svg
            className={`h-3 w-3 shrink-0 text-text-tertiary transition-transform ${
              isOpen ? "rotate-90" : ""
            }`}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 12L10 8L6 4" />
          </svg>
          <FolderIcon
            className="h-4 w-4 shrink-0"
            fill="rgba(56, 189, 248, 0.12)"
            stroke="var(--accent)"
          />
          <span className="font-medium text-text-primary">{node.name}</span>
        </button>
        {isOpen && node.children?.length ? (
          <ul className="mt-1 space-y-1">
            {node.children.map((child) => (
              <SkillFileTreeNodeItem
                key={child.path}
                depth={depth + 1}
                node={child}
                selectedPath={selectedPath}
                skillPath={skillPath}
              />
            ))}
          </ul>
        ) : null}
      </li>
    );
  }

  const isSelected = node.path === selectedPath;

  return (
    <li>
      <Link
        href={{
          pathname: skillPath,
          query: { path: node.path },
        }}
        scroll={false}
        className={`flex items-center gap-2 rounded-xl px-2 py-2 text-sm transition-colors ${
          isSelected
            ? "border border-border-hover bg-accent/10 text-accent-light"
            : "text-text-secondary hover:bg-white/3 hover:text-text-primary"
        }`}
        style={{ paddingLeft: `calc(${indentation} + 1.6rem)` }}
      >
        <FileIcon className="h-4 w-4 shrink-0" stroke="currentColor" />
        <span className="truncate">{node.name}</span>
      </Link>
    </li>
  );
}
