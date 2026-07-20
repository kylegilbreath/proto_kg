"use client"

import { ArrowUp, ChevronDown, ChevronsLeft, MoreVertical, Plus, X } from "lucide-react"
import { GenieIcon } from "./genie-icon"

const GENIE_SUGGESTIONS = [
  "Create automation",
  "What automation is best for my data?",
  "View latest automation",
]

/** Right-docked Genie Code panel (empty state + composer). */
export function GeniePanel({ onClose }: { onClose: () => void }) {
  return (
    <aside className="genie-panel">
      <header className="genie-head">
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <button type="button" className="btn-icon" aria-label="Collapse">
            <ChevronsLeft className="lucide" />
          </button>
          <span className="genie-head-title">Genie Code</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <button type="button" className="btn-icon" aria-label="New chat">
            <Plus className="lucide" />
          </button>
          <button type="button" className="btn-icon" aria-label="More">
            <MoreVertical className="lucide" />
          </button>
          <button type="button" className="btn-icon" aria-label="Close" onClick={onClose}>
            <X className="lucide" />
          </button>
        </div>
      </header>

      <div className="genie-body">
        <div className="genie-empty">
          <GenieIcon size={40} />
          <h2 className="genie-empty-title">Genie Code</h2>
          <p className="genie-empty-sub">Run multi-step data and AI tasks</p>
          <div className="genie-suggestions">
            {GENIE_SUGGESTIONS.map((s) => (
              <button key={s} type="button" className="genie-suggestion">
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="genie-composer">
        <div className="genie-input">
          <input readOnly placeholder="Ask Genie Code..." aria-label="Ask Genie Code" />
          <div className="genie-input-row">
            <button type="button" className="btn-icon" aria-label="Add context">
              <Plus className="lucide" />
            </button>
            <div style={{ flex: 1 }} />
            <button type="button" className="genie-model">
              <span>Mythos 6.7 (max)</span>
              <ChevronDown className="lucide" />
            </button>
            <button type="button" className="genie-send" aria-label="Send">
              <ArrowUp className="lucide" />
            </button>
          </div>
        </div>
        <p className="genie-disclaimer">Only use the agent with code and data you trust</p>
      </div>
    </aside>
  )
}
