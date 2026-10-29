"use client";

import React from "react";

interface MarkdownMessageProps {
  content: string;
}

/**
 * Parses inline formatting:
 * - **bold** or *bold* -> <strong>
 * - `code` -> <code>
 */
function parseInlineFormatting(text: string): React.ReactNode[] {
  // Regex matches:
  // 1) **bold**
  // 2) *bold* (if not inside word, or single asterisks)
  // 3) `code`
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={index} className="font-bold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 3) {
      return (
        <strong key={index} className="font-semibold text-foreground">
          {part.slice(1, -1)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 3) {
      return (
        <code
          key={index}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  if (!content) return null;

  const lines = content.split("\n");
  const renderedElements: React.ReactNode[] = [];
  let currentListItems: React.ReactNode[] = [];

  const flushList = () => {
    if (currentListItems.length > 0) {
      renderedElements.push(
        <ul key={`list-${renderedElements.length}`} className="my-1.5 space-y-1 pl-4 list-disc marker:text-health-primary">
          {currentListItems}
        </ul>
      );
      currentListItems = [];
    }
  };

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();

    // Check for unordered bullet list: "* ", "- ", "• "
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      const itemText = trimmed.substring(2).trim();
      currentListItems.push(
        <li key={`item-${lineIndex}`} className="text-sm leading-relaxed">
          {parseInlineFormatting(itemText)}
        </li>
      );
      return;
    }

    // Check for ordered list: "1. ", "2. ", etc.
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      flushList();
      renderedElements.push(
        <div key={`num-${lineIndex}`} className="my-1 flex items-start space-x-2 text-sm">
          <span className="font-bold text-health-primary shrink-0">{numberedMatch[1]}.</span>
          <div className="leading-relaxed">{parseInlineFormatting(numberedMatch[2])}</div>
        </div>
      );
      return;
    }

    // Any normal line or empty line flushes active list
    flushList();

    if (trimmed === "") {
      renderedElements.push(<div key={`blank-${lineIndex}`} className="h-2" />);
      return;
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      renderedElements.push(
        <h5 key={`h5-${lineIndex}`} className="mt-2 mb-1 text-xs font-bold uppercase tracking-wider text-health-primary">
          {parseInlineFormatting(trimmed.substring(4))}
        </h5>
      );
      return;
    }

    if (trimmed.startsWith("## ")) {
      renderedElements.push(
        <h4 key={`h4-${lineIndex}`} className="mt-2.5 mb-1 text-sm font-bold text-foreground">
          {parseInlineFormatting(trimmed.substring(3))}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith("# ")) {
      renderedElements.push(
        <h3 key={`h3-${lineIndex}`} className="mt-3 mb-1 text-base font-bold text-foreground">
          {parseInlineFormatting(trimmed.substring(2))}
        </h3>
      );
      return;
    }

    // Regular paragraph line
    renderedElements.push(
      <p key={`p-${lineIndex}`} className="text-sm leading-relaxed">
        {parseInlineFormatting(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-1">{renderedElements}</div>;
}
