"use client"

import * as React from "react"
import { pillsToHTML, readEditable } from "./pills"

// Contenteditable chat input that renders object-reference pills inline. Ported
// verbatim from the kit (innerHTML writes + manual caret management) — do NOT
// convert to a textarea or the [Object name] pills are lost.
export function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder,
  inputRef,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  disabled?: boolean
  placeholder?: string
  inputRef?: React.MutableRefObject<HTMLDivElement | null>
}) {
  const localRef = React.useRef<HTMLDivElement | null>(null)
  const ref = inputRef || localRef
  const setRef = (el: HTMLDivElement | null) => {
    ref.current = el
  }

  const caretToEnd = (el: HTMLElement) => {
    const r = document.createRange()
    r.selectNodeContents(el)
    r.collapse(false)
    const sel = window.getSelection()
    if (!sel) return
    sel.removeAllRanges()
    sel.addRange(r)
  }
  const rebuild = (caretEnd: boolean) => {
    const el = ref.current
    if (!el) return
    el.innerHTML = pillsToHTML(value)
    if (caretEnd && document.activeElement === el) caretToEnd(el)
  }
  // Sync DOM when the value changes externally (programmatic fills, clear on send).
  React.useEffect(() => {
    const el = ref.current
    if (el && readEditable(el) !== value) rebuild(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const handleInput = () => {
    const el = ref.current
    if (el) onChange(readEditable(el))
  }
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
      return
    }
    if (e.key === "]") {
      // A reference token just closed — convert it to a pill on the next tick.
      setTimeout(() => {
        const el = ref.current
        if (!el) return
        const t = readEditable(el)
        onChange(t)
        el.innerHTML = pillsToHTML(t)
        if (document.activeElement === el) caretToEnd(el)
      }, 0)
    }
  }

  return (
    <div
      ref={setRef}
      className="chat-ce"
      contentEditable={!disabled}
      role="textbox"
      aria-multiline="true"
      data-ph={placeholder}
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
    />
  )
}
