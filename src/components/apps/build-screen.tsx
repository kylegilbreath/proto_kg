"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  AppWindow,
  ArrowRight,
  Check,
  ChevronDown,
  Folders,
  GitBranch,
  Paperclip,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { APP_SPACES, TEMPLATES, USE_CASES, statusTag, type AppSpaceOption, type DemoApp } from "@/lib/apps-data"
import { useApps } from "@/app/apps/apps-provider"
import { GenieIcon } from "./genie-icon"
import { AppCard } from "./app-card"
import { KitModal, Segmented, Tag } from "./primitives"

/** Compact screenshot-style render of the inventory app for building-card thumbnails. */
export function ThumbPreview() {
  const bars = [60, 80, 45, 95, 70, 88, 38]
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "var(--n1)",
        padding: "22px 10px 9px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div style={{ display: "flex", gap: 5 }}>
        {["var(--n4)", "rgba(232,184,74,0.30)", "rgba(235,107,107,0.30)", "rgba(76,217,100,0.30)"].map((b, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 20,
              borderRadius: 3,
              background: b,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 3,
              padding: "0 4px",
            }}
          >
            <div style={{ height: 3, width: "70%", borderRadius: 1, background: "var(--n7)" }} />
            <div style={{ height: 4, width: "45%", borderRadius: 1, background: "var(--n9)" }} />
          </div>
        ))}
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 4, padding: "4px 2px 0" }}>
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: h + "%",
              borderRadius: "2px 2px 0 0",
              background: "linear-gradient(180deg, var(--n7), var(--n5))",
            }}
          />
        ))}
      </div>
    </div>
  )
}

function SpaceModal({
  space,
  onSelect,
  onClose,
}: {
  space: AppSpaceOption
  onSelect: (s: AppSpaceOption) => void
  onClose: () => void
}) {
  return (
    <KitModal onClose={onClose}>
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h2 style={{ fontSize: 16, fontWeight: 500, color: "var(--n12)", margin: 0 }}>Select App Space</h2>
          <button type="button" className="btn-icon" aria-label="Close" onClick={onClose}>
            <X className="lucide" />
          </button>
        </div>
        <p style={{ fontSize: 13, color: "var(--n9)", margin: "0 0 14px" }}>
          Your app is created in this space. Its data access and governance policies apply.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {APP_SPACES.map((sp) => {
            const active = sp.id === space.id
            return (
              <button
                key={sp.id}
                type="button"
                onClick={() => {
                  onSelect(sp)
                  onClose()
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid " + (active ? "rgba(var(--overlay),0.18)" : "rgba(var(--overlay),0.08)"),
                  background: active ? "rgba(var(--overlay),0.04)" : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "var(--font-sans)",
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "var(--radius-sm)",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(var(--overlay),0.08)",
                  }}
                >
                  <Folders className="lucide" style={{ width: 15, height: 15, color: "var(--n9)" }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--n12)" }}>{sp.name}</div>
                  <div className="truncate" style={{ fontSize: 12, color: "var(--n9)" }}>
                    {sp.desc} · {sp.apps} {sp.apps === 1 ? "app" : "apps"}
                  </div>
                </div>
                {active && <Check className="lucide" style={{ width: 16, height: 16, color: "var(--n11)", flexShrink: 0 }} />}
              </button>
            )
          })}
        </div>
      </div>
    </KitModal>
  )
}

export function BuildScreen() {
  const router = useRouter()
  const { apps, createApp } = useApps()
  const [prompt, setPrompt] = React.useState("")
  const [useCase, setUseCase] = React.useState("All")
  const [tab, setTab] = React.useState("recents")
  const [space, setSpace] = React.useState<AppSpaceOption>(APP_SPACES[2])
  const [spaceModal, setSpaceModal] = React.useState(false)

  const filtered = useCase === "All" ? TEMPLATES : TEMPLATES.filter((t) => t.category === useCase)
  const recents = apps.filter((a) => a.status === "building").slice(0, 8)

  const openApp = (app: DemoApp) => {
    if (app.status === "building") router.push(`/apps/${app.id}/builder`)
    else router.push(`/apps/${app.id}`)
  }

  const submit = (text?: string) => {
    const p = (text ?? prompt).trim()
    if (!p) return
    const app = createApp(p)
    router.push(`/apps/${app.id}/builder`)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px", gap: 40 }}>
      {/* Hero */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          width: "100%",
          maxWidth: 620,
        }}
      >
        <h1
          style={{
            position: "relative",
            fontSize: 17,
            fontWeight: 500,
            color: "var(--n11)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            margin: 0,
          }}
        >
          <span>Build your app with</span>
          <GenieIcon size={18} style={{ marginLeft: 2 }} />
          <span>Genie App Builder</span>
        </h1>

        {/* Prompt box (gradient border) */}
        <div
          style={{
            position: "relative",
            width: "100%",
            padding: 1,
            borderRadius: "calc(var(--radius-lg) + 1px)",
            background:
              "linear-gradient(120deg, rgba(66,153,224,0.5) 18%, rgba(202,66,224,0.45) 50%, rgba(255,95,70,0.5) 84%)",
          }}
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                submit()
              }
            }}
            placeholder="Describe the app you want to build…"
            rows={4}
            style={{
              display: "block",
              width: "100%",
              padding: "12px 16px",
              fontSize: 13,
              lineHeight: "18px",
              color: "var(--n11)",
              background: "var(--n1)",
              border: "none",
              borderRadius: "var(--radius-lg)",
              outline: "none",
              resize: "none",
              fontFamily: "var(--font-sans)",
              paddingBottom: 52,
            }}
          />
          <div style={{ position: "absolute", bottom: 12, left: 12, display: "flex", alignItems: "center", gap: 4 }}>
            <button type="button" className="btn-icon" aria-label="Attach content">
              <Paperclip className="lucide" />
            </button>
            <button
              type="button"
              onClick={() => setSpaceModal(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                height: 32,
                padding: "0 8px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: "transparent",
                color: "var(--n10)",
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "var(--font-sans)",
                cursor: "pointer",
              }}
            >
              <Folders className="lucide" style={{ width: 13, height: 13, color: "var(--n8)" }} />
              <span className="truncate" style={{ maxWidth: 160 }}>
                {space.name}
              </span>
              <ChevronDown className="lucide" style={{ width: 12, height: 12, color: "var(--n8)" }} />
            </button>
          </div>
          <div style={{ position: "absolute", bottom: 12, right: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "var(--n8)" }}>⌘↵</span>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: 24, padding: 0 }}
              disabled={!prompt.trim()}
              onClick={() => submit()}
              aria-label="Build app"
            >
              <ArrowRight className="lucide" />
            </button>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <Button variant="default" size="sm">
            <GitBranch />
            Import from Git
          </Button>
          <Button variant="default" size="sm">
            <GenieIcon size={14} />
            Need ideas?
          </Button>
        </div>
      </div>

      {/* Recents / Templates */}
      <div style={{ width: "100%", maxWidth: 900, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { value: "recents", label: "Recents" },
              { value: "templates", label: "Templates" },
            ]}
          />
          <span style={{ fontSize: 13, color: "var(--n9)", cursor: "pointer" }}>See all</span>
        </div>

        {tab === "templates" ? (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {USE_CASES.map((uc) => (
                <button
                  key={uc}
                  type="button"
                  onClick={() => setUseCase(uc)}
                  style={{
                    height: 32,
                    padding: "0 12px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 12,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    background: useCase === uc ? "rgba(var(--overlay),0.10)" : "transparent",
                    color: useCase === uc ? "var(--n11)" : "var(--n9)",
                    fontWeight: useCase === uc ? 500 : 400,
                  }}
                >
                  {uc}
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {filtered.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPrompt(t.prompt)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    textAlign: "left",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid rgba(var(--overlay),0.08)",
                    overflow: "hidden",
                    background: "transparent",
                    padding: 0,
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(var(--overlay),0.12)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(var(--overlay),0.08)")}
                >
                  <div style={{ aspectRatio: "16/9", width: "100%", background: t.gradient }} />
                  <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 2 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--n11)", margin: 0 }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: "var(--n9)", lineHeight: "14px", margin: 0 }}>{t.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : recents.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "48px 0",
              border: "1px dashed rgba(var(--overlay),0.12)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <AppWindow className="lucide" style={{ width: 22, height: 22, color: "var(--n8)" }} />
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--n11)", margin: 0 }}>No recent apps yet</p>
            <p style={{ fontSize: 13, color: "var(--n9)", margin: 0, textAlign: "center", maxWidth: 320 }}>
              Describe an app above or start from a template, and it&rsquo;ll show up here.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {recents.map((app) => {
              const s = statusTag(app.status)
              return (
                <AppCard
                  key={app.id}
                  gradient={app.gradient}
                  previewContent={app.status === "building" ? <ThumbPreview /> : undefined}
                  tag={
                    <Tag variant={s.variant} size="sm">
                      {s.label}
                    </Tag>
                  }
                  icon={app.status === "building" ? <GenieIcon size={14} /> : <AppWindow className="lucide" />}
                  name={app.name}
                  sub={app.status === "building" ? "Building · " + app.updatedAt : app.updatedAt}
                  trailing={
                    app.status === "building" ? (
                      <ArrowRight className="lucide" style={{ color: "var(--n9)" }} />
                    ) : undefined
                  }
                  onClick={() => openApp(app)}
                />
              )
            })}
          </div>
        )}
      </div>

      {spaceModal && <SpaceModal space={space} onSelect={setSpace} onClose={() => setSpaceModal(false)} />}
    </div>
  )
}
