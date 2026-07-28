"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowRightIcon,
  ArrowUpIcon,
  AtIcon,
  ChevronDownIcon,
  CloseSmallIcon,
  ColumnIcon,
  DagHorizontalIcon,
  FolderIcon,
  NotebookIcon,
  PlusIcon,
  SearchIcon,
} from "@/components/icons";

// ─── Types ────────────────────────────────────────────────────────────────────

export type GenieMode = "ask" | "search";

export type GenieVariant =
  | "toggle"   // Initial state: mode selector + submit. Search toggle or Ask toggle.
  | "chat"     // Full chat: stacked input + action bar
  | "compact"; // Inline row: input flex-1 + model + submit

export type GenieSize = "default" | "small";

export type GenieTagKind = "node" | "column" | "notebook";

export interface GenieTag {
  id: string;
  label: string;
  kind?: GenieTagKind;
}

export interface GeniePromptProps {
  /** Ask or Search mode */
  mode?: GenieMode;
  onModeChange?: (mode: GenieMode) => void;
  /** Layout variant */
  variant?: GenieVariant;
  /** Size scale */
  size?: GenieSize;
  /** Controlled textarea value */
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string, tags: GenieTag[]) => void;
  /** Context chips in the input */
  tags?: GenieTag[];
  onTagRemove?: (id: string) => void;
  /** Model name shown in model selector */
  modelName?: string;
  /** Show an "@" mention button next to "+" in the chat action bar */
  showAtButton?: boolean;
  /** Show a "Choose project" folder selector in the chat action bar. Pass a
   *  string to show the selected project name, or true for the default label. */
  projectLabel?: string | boolean;
  onChooseProject?: () => void;
  placeholder?: string;
  className?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const tagIcons: Record<GenieTagKind, React.ComponentType<{ size?: number; className?: string }>> = {
  node: DagHorizontalIcon,
  column: ColumnIcon,
  notebook: NotebookIcon,
};

function TagChip({
  tag,
  onRemove,
  size = "default",
}: {
  tag: GenieTag;
  onRemove?: (id: string) => void;
  size?: GenieSize;
}) {
  const Icon = tag.kind ? tagIcons[tag.kind] : null;
  return (
    <span className="inline-flex h-5 items-center overflow-clip rounded bg-foreground/5 shrink-0">
      <span className="flex items-center gap-1 pl-1 pr-0.5 text-foreground">
        {Icon && <Icon size={12} className="shrink-0" />}
        <span className="text-xs leading-5 whitespace-nowrap">{tag.label}</span>
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(tag.id)}
          className="flex items-start p-[3px] rounded-br rounded-tr transition-colors hover:bg-foreground/10"
          aria-label={`Remove ${tag.label}`}
        >
          <CloseSmallIcon size={14} className="text-muted-foreground" />
        </button>
      )}
    </span>
  );
}

function ModelSelector({ modelName = "Mythos 6.7 (max)" }: { modelName?: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground shrink-0"
    >
      <span className="whitespace-nowrap">{modelName}</span>
      <ChevronDownIcon size={16} className="shrink-0" />
    </button>
  );
}

function SegmentedControl({
  mode,
  onChange,
}: {
  mode: GenieMode;
  onChange: (m: GenieMode) => void;
}) {
  return (
    <div className="flex items-center gap-px rounded-full bg-secondary p-px shrink-0">
      {(["ask", "search"] as GenieMode[]).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm leading-5 transition-colors capitalize",
            mode === m
              ? "bg-background border border-border text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {m === "ask" ? "Ask" : "Search"}
        </button>
      ))}
    </div>
  );
}

function SubmitButton({
  mode,
  size = "default",
  onClick,
}: {
  mode: GenieMode;
  size?: GenieSize;
  onClick?: () => void;
}) {
  const Icon = mode === "search" ? ArrowRightIcon : ArrowUpIcon;
  const isSmall = size === "small";
  return (
    <button
      type="submit"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center bg-secondary transition-colors hover:bg-border shrink-0",
        isSmall
          ? "h-6 w-6 rounded"
          : "h-8 w-8 rounded-full"
      )}
      aria-label="Submit"
    >
      <Icon size={16} className="text-foreground" />
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function GeniePrompt({
  mode = "ask",
  onModeChange,
  variant = "chat",
  size = "default",
  value = "",
  onChange,
  onSubmit,
  tags = [],
  onTagRemove,
  modelName,
  showAtButton = false,
  projectLabel = false,
  onChooseProject,
  placeholder,
  className,
}: GeniePromptProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSmall = size === "small";

  const defaultPlaceholder =
    mode === "search"
      ? "Search Dashboards, Genie spaces, and Apps..."
      : "Ask a question...";

  const handleSubmit = useCallback(() => {
    onSubmit?.(value, tags);
  }, [onSubmit, value, tags]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  // ── Outer container radius & shadow ──────────────────────────────────────

  const outerCn = cn(
    "bg-background border border-border overflow-clip w-full",
    // All default-size variants → 24px (Figma spec). Small → 8px.
    isSmall ? "rounded-md" : "rounded-[24px]",
    // shadow
    isSmall
      ? "shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.05),0px_1px_0px_0px_rgba(0,0,0,0.02)]"
      : "shadow-[0px_3px_6px_0px_rgba(0,0,0,0.05)]",
    className
  );

  // ── Input row ─────────────────────────────────────────────────────────────

  const inputRow = (
    <div
      className="flex items-center gap-1.5 w-full"
      onClick={() => textareaRef.current?.focus()}
    >
      {mode === "search" && variant !== "toggle" && (
        <SearchIcon size={16} className="text-muted-foreground shrink-0" />
      )}
      {tags.map((tag) => (
        <TagChip key={tag.id} tag={tag} onRemove={onTagRemove} size={size} />
      ))}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? defaultPlaceholder}
        rows={1}
        className={cn(
          "flex-1 min-w-0 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none leading-5",
          "field-sizing-content max-h-32"
        )}
      />
    </div>
  );

  // ── Action bar ─────────────────────────────────────────────────────────────

  const plusButton = (
    <button
      type="button"
      className={cn(
        "flex items-center justify-center text-muted-foreground transition-colors hover:text-foreground shrink-0",
        isSmall ? "h-6 w-6" : "h-8 w-8"
      )}
      aria-label="Add context"
    >
      <PlusIcon size={16} />
    </button>
  );

  const atButton = (
    <button
      type="button"
      className={cn(
        "flex items-center justify-center text-muted-foreground transition-colors hover:text-foreground shrink-0",
        isSmall ? "h-6 w-6" : "h-8 w-8"
      )}
      aria-label="Mention an object"
    >
      <AtIcon size={16} />
    </button>
  );

  const projectButton = (
    <button
      type="button"
      onClick={onChooseProject}
      className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground shrink-0"
    >
      <FolderIcon size={16} className="text-[var(--warning)]" />
      <span className="whitespace-nowrap text-foreground">
        {typeof projectLabel === "string" ? projectLabel : "Choose project"}
      </span>
      <ChevronDownIcon size={16} className="shrink-0" />
    </button>
  );

  // ── Variant: toggle ───────────────────────────────────────────────────────

  if (variant === "toggle") {
    return (
      <form
        className={outerCn}
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
      >
        <div className={cn("flex flex-col gap-4", isSmall ? "p-2" : "p-4")}>
          {/* input */}
          <div className="h-6">{inputRow}</div>
          {/* action bar */}
          <div className="flex items-center gap-2 h-8">
            <SegmentedControl
              mode={mode}
              onChange={(m) => onModeChange?.(m)}
            />
            {mode === "ask" && plusButton}
            <div className="flex-1" />
            <ModelSelector modelName={modelName} />
            <SubmitButton mode={mode} size={size} />
          </div>
        </div>
      </form>
    );
  }

  // ── Variant: compact ──────────────────────────────────────────────────────

  if (variant === "compact") {
    return (
      <form
        className={outerCn}
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
      >
        <div className={cn("flex items-center gap-4", isSmall ? "px-3 py-2" : "pl-4 pr-2 py-2")}>
          <div className="flex-1 min-w-0">{inputRow}</div>
          <div className="flex items-center gap-2 shrink-0">
            <ModelSelector modelName={modelName} />
            <SubmitButton mode={mode} size={size} />
          </div>
        </div>
      </form>
    );
  }

  // ── Variant: chat (default) ───────────────────────────────────────────────

  return (
    <form
      className={outerCn}
      onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
    >
      <div className={cn("flex flex-col gap-4", isSmall ? "p-2" : "p-4")}>
        {/* input */}
        <div className={cn("min-h-6", isSmall && "min-h-5")}>{inputRow}</div>
        {/* action bar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {plusButton}
            {showAtButton && atButton}
            {projectLabel && projectButton}
          </div>
          <div className="flex-1" />
          <ModelSelector modelName={modelName} />
          <SubmitButton mode={mode} size={size} />
        </div>
      </div>
    </form>
  );
}
