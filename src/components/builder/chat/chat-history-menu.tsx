"use client"

import * as React from "react"
import { Check, History, MessageSquare } from "lucide-react"
import { IconButton } from "../icon-button"
import { CHAT_HISTORY } from "./chat-data"

export function ChatHistoryMenu() {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [open])
  return (
    <div style={{ position: "relative" }} ref={ref}>
      <IconButton icon={History} label="Chat history" onClick={() => setOpen((o) => !o)} />
      {open && (
        <div className="dropdown" style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, width: 240, zIndex: 70 }}>
          <div
            className="dropdown-label"
            style={{
              padding: "4px 8px",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--n9)",
            }}
          >
            Chat history
          </div>
          {CHAT_HISTORY.map((c) => (
            <button
              key={c.id}
              className="dropdown-item"
              onClick={() => setOpen(false)}
              style={{ width: "100%", textAlign: "left" }}
            >
              <MessageSquare
                className="lucide"
                style={{ width: 14, height: 14, color: c.current ? "var(--success-fg)" : "var(--n7)", flexShrink: 0 }}
              />
              <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                <span className="truncate" style={{ color: "var(--n11)" }}>
                  {c.title}
                </span>
                <span style={{ fontSize: 12, color: "var(--n9)" }}>{c.when}</span>
              </span>
              {c.current && (
                <Check className="lucide" style={{ width: 13, height: 13, color: "var(--success-fg)", flexShrink: 0 }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
