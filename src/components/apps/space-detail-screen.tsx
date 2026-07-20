"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  AppWindow,
  Check,
  ChevronDown,
  Cloud,
  Copy,
  ExternalLink,
  Folders,
  Info,
  LayoutDashboard,
  Lock,
  MoreHorizontal,
  MoreVertical,
  Search,
  Settings,
  Trash2,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { APP_GRADS, MOCK_APPS, SPACES, statusTag } from "@/lib/apps-data"
import { AppTopBar } from "./app-top-bar"
import { AppCard } from "./app-card"
import { GenieIcon } from "./genie-icon"
import { GeniePanel } from "./genie-panel"
import { KitDropdown, KitDropdownItem, KitDropdownSep, Tag } from "./primitives"
import { SettingsPanel } from "./settings-panel"

const SPACE_NAV: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "settings", label: "Settings", icon: Settings },
]

function SpaceMeta() {
  const [copied, setCopied] = React.useState(false)
  return (
    <aside className="space-meta">
      <section>
        <p className="space-meta-h">About the App Space</p>
        <div className="space-kv">
          <span className="space-kv-k">Creator</span>
          <span className="space-kv-v truncate">user@example.com</span>
          <span className="space-kv-k">Created on</span>
          <span className="space-kv-v">Just now</span>
          <span className="space-kv-k">Last updated</span>
          <span className="space-kv-v">Just now</span>
          <span className="space-kv-k">App Space ID</span>
          <span className="space-kv-v" style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
            <span className="mono truncate" style={{ fontSize: 12 }}>
              5e9b9b9b-6b1a-4b1…
            </span>
            <button
              type="button"
              className="btn-icon"
              aria-label="Copy App Space ID"
              onClick={() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 1500)
              }}
            >
              {copied ? <Check className="lucide" /> : <Copy className="lucide" />}
            </button>
          </span>
        </div>
      </section>
      <div className="space-meta-sep" />
      <section>
        <p className="space-meta-h">Description</p>
        <button type="button" className="btn btn-outline" style={{ marginTop: 6 }}>
          Add description
        </button>
      </section>
      <div className="space-meta-sep" />
      <section>
        <p className="space-meta-h">Compute</p>
        <p className="space-meta-p">Serverless</p>
      </section>
      <div className="space-meta-sep" />
      <section>
        <p className="space-meta-h" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          Serverless usage policy <Info className="lucide" style={{ width: 12, height: 12, color: "var(--n8)" }} />
        </p>
        <p className="space-meta-p">databricks-unrestricted-policy</p>
        <div className="space-tags">
          <Tag variant="default" size="sm">
            key: value
          </Tag>
          <Tag variant="default" size="sm">
            tag
          </Tag>
          <Tag variant="default" size="sm">
            tag
          </Tag>
          <Tag variant="default" size="sm">
            tag
          </Tag>
        </div>
      </section>
      <div className="space-meta-sep" />
      <section>
        <p className="space-meta-h" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          App resources <Info className="lucide" style={{ width: 12, height: 12, color: "var(--n8)" }} />
        </p>
        <div className="space-res">
          <Cloud className="lucide" style={{ color: "var(--n8)", marginTop: 1 }} />
          <div>
            <div className="space-meta-p" style={{ color: "var(--n11)" }}>
              sql-warehouse
            </div>
            <div className="asp-prev-accent">Serverless (2X-Small)</div>
          </div>
        </div>
        <div className="space-res">
          <Cloud className="lucide" style={{ color: "var(--n8)", marginTop: 1 }} />
          <div>
            <div className="space-meta-p" style={{ color: "var(--n11)" }}>
              model-serving-endpoint
            </div>
            <div className="asp-prev-accent">Llama-405b-instruct</div>
          </div>
        </div>
        <button type="button" className="btn btn-outline" style={{ marginTop: 8 }}>
          Edit resources
        </button>
      </section>
      <div className="space-meta-sep" />
      <section>
        <p className="space-meta-h">Tags</p>
        <div className="space-tags">
          <Tag variant="default" size="sm">
            key: value
          </Tag>
          <Tag variant="default" size="sm">
            tag
          </Tag>
          <Tag variant="default" size="sm">
            tag
          </Tag>
          <Tag variant="default" size="sm">
            tag
          </Tag>
        </div>
        <button type="button" className="btn btn-outline" style={{ marginTop: 8 }}>
          Edit details
        </button>
      </section>
    </aside>
  )
}

export function SpaceDetailScreen({ spaceId }: { spaceId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = React.useState("overview")
  const [navOpen, setNavOpen] = React.useState(true)
  const [genieOpen, setGenieOpen] = React.useState(false)

  const space =
    SPACES.find((s) => s.id === spaceId) ??
    ({ id: spaceId, name: searchParams.get("name") || "App Space name", appCount: 0 } as { id: string; name: string })
  const gridApps = MOCK_APPS.slice(0, 8)

  const onBack = () => router.push("/apps/spaces")
  const onOpenApp = (id: string) => router.push(`/apps/${id}`)

  return (
    <div className="shell">
      <AppTopBar
        onToggleSidebar={() => setNavOpen((v) => !v)}
        crumbs={[
          { label: "App Spaces", onClick: onBack },
          {
            label: space.name,
            leaf: true,
            switcher: {
              placeholder: "Find an app space",
              items: SPACES.map((s) => ({ id: s.id, name: s.name, sub: s.appCount + " apps", icon: Folders })),
              currentId: space.id,
              onSelect: (id) => router.push(`/apps/spaces/${id}`),
            },
          },
        ]}
        env
        genie
        genieOpen={genieOpen}
        onToggleGenie={() => setGenieOpen((v) => !v)}
      />

      <div className="shell-body">
        {navOpen && (
          <aside className="detail-nav">
            <nav role="tablist">
              {SPACE_NAV.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  className={`nav-item${tab === item.id ? " active" : ""}`}
                  onClick={() => setTab(item.id)}
                >
                  <item.icon className="lucide" />
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>
        )}
        <main
          className="shell-main"
          style={{ marginLeft: navOpen ? 0 : 8, display: "flex", flexDirection: "column", overflow: "hidden" }}
        >
          {tab === "overview" ? (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", minHeight: 0 }}>
              <div className="space-titlerow" style={{ padding: "20px 24px 0", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <h1 className="space-h1">Overview</h1>
                  <span style={{ fontSize: 13, color: "var(--n9)" }}>{gridApps.length} apps</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button type="button" className="btn-icon" aria-label="More">
                    <MoreVertical className="lucide" />
                  </button>
                  <Button variant="default" size="sm">
                    <Lock />
                    Share
                  </Button>
                  <Button variant="default" size="sm">
                    Edit
                  </Button>
                  <button type="button" className="btn" style={{ background: "rgba(var(--overlay),0.08)", color: "var(--n11)" }}>
                    <GenieIcon size={14} />
                    Build app with AI
                    <Tag variant="info" size="sm" style={{ marginLeft: 2 }}>
                      New
                    </Tag>
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
                <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
                  <div className="space-filters">
                    <div className="search-input" style={{ width: 240 }}>
                      <Search className="lucide" />
                      <input className="input" placeholder="Filter by keyword" />
                    </div>
                    <button type="button" className="btn btn-outline">
                      Creator
                      <ChevronDown className="lucide" />
                    </button>
                    <button type="button" className="btn btn-outline">
                      Status
                      <ChevronDown className="lucide" />
                    </button>
                    <button type="button" className="btn btn-outline">
                      Last updated
                      <ChevronDown className="lucide" />
                    </button>
                  </div>

                  <div className="space-grid">
                    {gridApps.map((a, i) => {
                      const s = statusTag(a.status)
                      return (
                        <AppCard
                          key={a.id}
                          gradient={APP_GRADS[i % APP_GRADS.length]}
                          tag={
                            <Tag variant={s.variant} size="sm">
                              {s.label}
                            </Tag>
                          }
                          icon={<AppWindow className="lucide" />}
                          name={a.name}
                          sub={a.owner}
                          actions={
                            <div onClick={(e) => e.stopPropagation()}>
                              <KitDropdown
                                align="end"
                                width={160}
                                trigger={
                                  <button type="button" className="btn-icon" aria-label="More options">
                                    <MoreHorizontal className="lucide" />
                                  </button>
                                }
                              >
                                <KitDropdownItem icon={ExternalLink}>Open</KitDropdownItem>
                                <KitDropdownItem icon={Copy}>Duplicate</KitDropdownItem>
                                <KitDropdownSep />
                                <KitDropdownItem icon={Trash2} danger>
                                  Remove
                                </KitDropdownItem>
                              </KitDropdown>
                            </div>
                          }
                          onClick={() => onOpenApp(a.id)}
                        />
                      )
                    })}
                  </div>
                </div>
                <SpaceMeta />
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: "auto", padding: 0 }}>
              <SettingsPanel app={{ name: space.name }} />
            </div>
          )}
        </main>
        {genieOpen && <GeniePanel onClose={() => setGenieOpen(false)} />}
      </div>
    </div>
  )
}
