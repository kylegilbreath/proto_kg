"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  AppWindow,
  ChevronDown,
  Clock,
  ExternalLink,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { statusTag } from "@/lib/apps-data"
import { useApps } from "@/app/apps/apps-provider"
import { AppCard } from "./app-card"
import { KitDropdown, KitDropdownItem, KitDropdownSep, KitPageHeader, Segmented, Tag } from "./primitives"

function AppOverflow({ onOpen, onDelete }: { onOpen: () => void; onDelete: () => void }) {
  return (
    <KitDropdown
      align="end"
      width={170}
      trigger={
        <button type="button" className="btn-icon" aria-label="More options">
          <MoreHorizontal className="lucide" />
        </button>
      }
    >
      <KitDropdownItem icon={ExternalLink} onClick={onOpen}>
        Open detail
      </KitDropdownItem>
      <KitDropdownSep />
      <KitDropdownItem icon={Trash2} danger onClick={onDelete}>
        Delete
      </KitDropdownItem>
    </KitDropdown>
  )
}

export function AppsScreen() {
  const router = useRouter()
  const { apps, deleteApp } = useApps()
  const [search, setSearch] = React.useState("")
  const [creator, setCreator] = React.useState<string | null>("user@example.com")
  const [view, setView] = React.useState("card")

  const onOpen = (id: string) => router.push(`/apps/${id}`)
  const onCreate = () => router.push("/apps")

  const filtered = apps.filter((a) => {
    const ms = !search || a.name.toLowerCase().includes(search.toLowerCase())
    const mc = !creator || a.owner === creator
    return ms && mc
  })
  const hasFilters = !!search || !!creator
  const clear = () => {
    setSearch("")
    setCreator(null)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "20px 24px", gap: 20 }}>
      <KitPageHeader
        title="Apps"
        actions={
          <Button variant="primary" size="sm" onClick={onCreate}>
            <Plus />
            New app
          </Button>
        }
      />

      {/* Filter bar */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <div className="search-input" style={{ width: 240 }}>
          <Search className="lucide" />
          <input
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by keyword"
            aria-label="Filter apps"
          />
        </div>
        {creator ? (
          <div className="filter-chip">
            <span>Creator: {creator}</span>
            <button type="button" onClick={() => setCreator(null)} aria-label="Clear creator filter">
              <X className="lucide" style={{ width: 12, height: 12 }} />
            </button>
          </div>
        ) : (
          <Button variant="default" size="sm" onClick={() => setCreator("user@example.com")}>
            Creator
            <ChevronDown />
          </Button>
        )}
        <Button variant="default" size="sm">
          Status
          <ChevronDown />
        </Button>
        <span style={{ fontSize: 13, color: "var(--n9)" }}>{filtered.length} apps</span>
        {hasFilters && (
          <Button variant="link" size="sm" onClick={clear} className="text-[13px] font-normal" style={{ color: "var(--n9)" }}>
            Clear filter
          </Button>
        )}
        <div style={{ flex: 1 }} />
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: "card", icon: LayoutGrid, label: "Card view" },
            { value: "table", icon: List, label: "Table view" },
          ]}
        />
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "80px 0",
            gap: 8,
            color: "var(--n9)",
          }}
        >
          <p style={{ fontSize: 13, margin: 0 }}>No apps match your filters</p>
          <Button
            variant="link"
            size="sm"
            onClick={clear}
            className="text-[13px] font-normal underline"
            style={{ color: "var(--n9)" }}
          >
            Clear filter
          </Button>
        </div>
      ) : view === "card" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 12 }}>
          {filtered.map((app) => {
            const s = statusTag(app.status)
            return (
              <AppCard
                key={app.id}
                gradient={app.gradient}
                tag={
                  <Tag variant={s.variant} size="sm">
                    {s.label}
                  </Tag>
                }
                icon={<AppWindow className="lucide" />}
                name={app.name}
                sub={app.owner}
                actions={
                  <div onClick={(e) => e.stopPropagation()}>
                    <AppOverflow onOpen={() => onOpen(app.id)} onDelete={() => deleteApp(app.id)} />
                  </div>
                }
                onClick={() => onOpen(app.id)}
              />
            )
          })}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Creator</th>
                <th>Last updated</th>
                <th style={{ width: 32 }} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => {
                const s = statusTag(app.status)
                return (
                  <tr key={app.id} onClick={() => onOpen(app.id)} style={{ cursor: "pointer" }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--n11)" }}>
                        <div className="table-thumb">
                          <div style={{ height: "100%", width: "100%", background: app.gradient }} />
                        </div>
                        {app.name}
                      </div>
                    </td>
                    <td>
                      <Tag variant={s.variant} size="sm">
                        {s.label}
                      </Tag>
                    </td>
                    <td style={{ color: "var(--n9)" }}>{app.owner}</td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--n9)" }}>
                        <Clock className="lucide" style={{ width: 12, height: 12 }} />
                        {app.updatedAt}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()} style={{ textAlign: "right" }}>
                      <AppOverflow onOpen={() => onOpen(app.id)} onDelete={() => deleteApp(app.id)} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
