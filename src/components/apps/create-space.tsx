"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronRight, ChevronUp, Cloud, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tag } from "./primitives"

function CollapseCard({
  title,
  action,
  open,
  onToggle,
  chevron,
  children,
}: {
  title: string
  action?: React.ReactNode
  open: boolean
  onToggle: () => void
  chevron?: "right"
  children?: React.ReactNode
}) {
  const ChevronIcon = chevron === "right" ? ChevronRight : open ? ChevronUp : ChevronDown
  return (
    <div className="asp-card">
      <div className="asp-card-head">
        <button type="button" className="asp-card-titlebtn" onClick={onToggle}>
          <span className="asp-card-title">{title}</span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {action}
          <button type="button" className="btn-icon" onClick={onToggle} aria-label="Toggle">
            <ChevronIcon className="lucide" style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
      {open && children && <div className="asp-card-body">{children}</div>}
    </div>
  )
}

function ResourceRow({ onRemove }: { onRemove: () => void }) {
  return (
    <div className="asp-res-row">
      <div className="asp-select asp-select-lg">
        <span>SQL warehouse</span>
        <ChevronDown className="lucide" style={{ color: "var(--n8)" }} />
      </div>
      <div className="asp-select asp-select-lg">
        <span>Can read</span>
        <ChevronDown className="lucide" style={{ color: "var(--n8)" }} />
      </div>
      <input className="input" defaultValue="sql-warehouse" />
      <button type="button" className="btn-icon" onClick={onRemove} aria-label="Remove resource">
        <Trash2 className="lucide" />
      </button>
    </div>
  )
}

export function CreateAppSpace() {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [open, setOpen] = React.useState<Record<string, boolean>>({
    data: false,
    resources: true,
    userauth: false,
    permissions: false,
  })
  const [resources, setResources] = React.useState<number[]>([1, 2])
  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }))

  const onCancel = () => router.push("/apps/spaces")
  const onCreate = () => {
    const n = name || "Team App Space"
    router.push(`/apps/spaces/new-space?name=${encodeURIComponent(n)}`)
  }

  return (
    <div className="asp-create">
      <div className="asp-create-main">
        <div className="asp-breadcrumb">
          <button type="button" className="asp-link" onClick={onCancel}>
            App Spaces
          </button>
          <ChevronRight className="lucide" style={{ color: "var(--n8)" }} />
        </div>
        <div className="asp-title-row">
          <h1 className="asp-h1">Create App Space</h1>
          <Tag variant="info" size="sm">
            Preview
          </Tag>
        </div>

        <div className="asp-field">
          <label className="asp-label" htmlFor="asp-name">
            Name
          </label>
          <input
            id="asp-name"
            className="input"
            placeholder="Team App Space"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="asp-field">
          <label className="asp-label" htmlFor="asp-desc">
            Description (optional)
          </label>
          <textarea id="asp-desc" className="asp-textarea" rows={4} />
        </div>

        <div className="asp-field">
          <span className="asp-label">Serverless usage policy</span>
          <div className="asp-select asp-select-lg">
            <span style={{ color: "var(--n7)" }}>Select option…</span>
            <ChevronDown className="lucide" style={{ color: "var(--n8)" }} />
          </div>
        </div>

        <CollapseCard
          title="Data"
          open={open.data}
          onToggle={() => toggle("data")}
          chevron="right"
          action={
            <button type="button" className="btn btn-outline" onClick={(e) => e.stopPropagation()}>
              <Plus className="lucide" />
              Add data
            </button>
          }
        />

        <CollapseCard
          title="Resources"
          open={open.resources}
          onToggle={() => toggle("resources")}
          action={
            <button
              type="button"
              className="btn btn-outline"
              onClick={(e) => {
                e.stopPropagation()
                setResources((r) => [...r, Date.now()])
              }}
            >
              <Plus className="lucide" />
              Add Resources
            </button>
          }
        >
          <div className="asp-res-head">
            <span>Select resource</span>
            <span>Permissions</span>
            <span>Resource key</span>
            <span />
          </div>
          {resources.map((r) => (
            <ResourceRow key={r} onRemove={() => setResources((p) => p.filter((x) => x !== r))} />
          ))}
        </CollapseCard>

        <CollapseCard
          title="User Authorization"
          open={open.userauth}
          onToggle={() => toggle("userauth")}
          chevron="right"
          action={
            <button type="button" className="btn btn-outline" onClick={(e) => e.stopPropagation()}>
              <Plus className="lucide" />
              Add scope
            </button>
          }
        />

        <CollapseCard title="Permissions" open={open.permissions} onToggle={() => toggle("permissions")} chevron="right" />

        <div className="asp-actions">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={onCreate}>
            Create
          </Button>
        </div>
      </div>

      {/* Live preview panel */}
      <aside className="asp-preview">
        <div className="asp-prev-title">{name || "Untitled Space"}</div>
        <div className="asp-prev-sub">A ready-to-use space with sensible defaults.</div>

        <div className="asp-prev-card">
          <div className="asp-prev-h">Serverless usage policy</div>
          <div className="asp-prev-strong">databricks-unrestricted-policy</div>
          <div className="asp-prev-muted">$10 / day</div>
        </div>

        <div className="asp-prev-card">
          <div className="asp-prev-h">Data (0)</div>
          <div className="asp-prev-muted">No data added</div>
        </div>

        <div className="asp-prev-card">
          <div className="asp-prev-h">Resources (2)</div>
          <div className="asp-prev-res">
            <Cloud className="lucide" style={{ color: "var(--n8)", marginTop: 1 }} />
            <div>
              <div className="asp-prev-strong">sql-warehouse</div>
              <div className="asp-prev-accent">Serverless (2X-Small)</div>
            </div>
          </div>
          <div className="asp-prev-res">
            <Cloud className="lucide" style={{ color: "var(--n8)", marginTop: 1 }} />
            <div>
              <div className="asp-prev-strong">model-serving-endpoint</div>
              <div className="asp-prev-accent">Llama-405b-instruct</div>
            </div>
          </div>
        </div>

        <div className="asp-prev-card">
          <div className="asp-prev-h">User authorization (0)</div>
          <div className="asp-prev-muted">No API scopes added</div>
        </div>

        <div className="asp-prev-card">
          <div className="asp-prev-h">Permissions</div>
          <div className="asp-avatars">
            <span className="asp-avatar">D</span>
            <span className="asp-avatar">C</span>
            <span className="asp-avatar">T</span>
            <span className="asp-avatar-more">+5</span>
          </div>
        </div>
      </aside>
    </div>
  )
}
