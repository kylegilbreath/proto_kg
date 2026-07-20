"use client"

import * as React from "react"
import { TreeRows } from "./tree-rows"
import { AGENTS, SCHEMAS, type TreeNode } from "./preview-data"

function SchemaView({ tableId }: { tableId: string }) {
  const schema = SCHEMAS[tableId]
  if (!schema)
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--n9)", fontSize: 13 }}>
        Select a table to view its schema
      </div>
    )
  const parts = tableId.split("/")
  const name = parts.pop()
  return (
    <div className="schema-view">
      <div style={{ marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--n11)" }}>{name}</p>
        <p style={{ margin: 0, fontSize: 13, color: "var(--n9)" }}>{parts.join(".")}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Column</th>
            <th>Type</th>
            <th>Nullable</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {schema.map((c) => (
            <tr key={c[0]}>
              <td className="mono" style={{ color: "var(--n11)" }}>
                {c[0]}
              </td>
              <td className="mono" style={{ color: "var(--n9)" }}>
                {c[1]}
              </td>
              <td style={{ color: "var(--n7)" }}>{c[2]}</td>
              <td style={{ color: "var(--n9)" }}>{c[3]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function DataPanel({
  tree,
  activeId,
  onSelect,
}: {
  tree: TreeNode[]
  activeId: string
  onSelect: (id: string) => void
}) {
  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      <div className="tree-pane">
        <TreeRows nodes={tree} depth={0} activeId={activeId} onSelect={onSelect} />
      </div>
      <SchemaView tableId={activeId} />
    </div>
  )
}

export function AgentsPanel({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  const agent = AGENTS.find((a) => a.id === activeId)
  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      <div className="tree-pane" style={{ padding: "4px 0" }}>
        {AGENTS.map((a) => (
          <button key={a.id} className={`tree-row${activeId === a.id ? " active" : ""}`} onClick={() => onSelect(a.id)}>
            <span className="dot" style={{ background: a.status === "active" ? "var(--success-fg)" : "var(--n7)" }} />
            <span className="truncate">{a.name}</span>
          </button>
        ))}
      </div>
      {agent ? (
        <div className="schema-view" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--n11)" }}>{agent.name}</p>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--n9)" }}>{agent.description}</p>
            </div>
            <span
              style={{
                marginLeft: "auto",
                borderRadius: "var(--radius-full)",
                padding: "2px 8px",
                fontSize: 12,
                background: agent.status === "active" ? "rgba(48,160,80,0.12)" : "rgba(var(--overlay),0.08)",
                color: agent.status === "active" ? "var(--success-fg)" : "var(--n7)",
              }}
            >
              {agent.status}
            </span>
          </div>
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 13, color: "var(--n9)" }}>Endpoint</p>
            <code className="inline">{agent.endpoint}</code>
          </div>
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 13, color: "var(--n9)" }}>Capabilities</p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
              {agent.capabilities.map((c) => (
                <li key={c} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--n11)" }}>
                  <span className="dot" style={{ background: "var(--n7)", width: 4, height: 4 }} />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--n9)", fontSize: 13 }}>
          Select an agent to view details
        </div>
      )}
    </div>
  )
}
