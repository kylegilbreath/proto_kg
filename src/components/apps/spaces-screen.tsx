"use client"

import { useRouter } from "next/navigation"
import { Folders, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SPACES } from "@/lib/apps-data"
import { KitPageHeader } from "./primitives"

export function SpaceCollage({ previews }: { previews: string[] }) {
  const slots = previews.slice(0, 4)
  if (slots.length === 1) return <div style={{ width: "100%", height: "100%", background: slots[0] }} />
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%", height: "100%" }}>
      {slots.map((g, i) => (
        <div key={i} style={{ background: g }} />
      ))}
      {Array.from({ length: Math.max(0, 4 - slots.length) }).map((_, i) => (
        <div key={"e" + i} style={{ background: "var(--n2)" }} />
      ))}
    </div>
  )
}

export function SpacesScreen() {
  const router = useRouter()
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "20px 24px", gap: 20 }}>
      <KitPageHeader
        title="App Spaces"
        actions={
          <Button variant="primary" size="sm" onClick={() => router.push("/apps/spaces/new")}>
            <Plus />
            New space
          </Button>
        }
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {SPACES.map((s) => (
          <div
            key={s.id}
            className="app-card"
            style={{ cursor: "pointer" }}
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/apps/spaces/${s.id}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                router.push(`/apps/spaces/${s.id}`)
              }
            }}
          >
            <div className="preview">
              <SpaceCollage previews={s.previews} />
            </div>
            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Folders className="lucide" style={{ color: "var(--n8)" }} />
                <span style={{ fontSize: 13, color: "var(--n11)" }} className="truncate">
                  {s.name}
                </span>
              </div>
              <span style={{ fontSize: 12, color: "var(--n9)" }} className="truncate">
                {s.description}
              </span>
              <span style={{ fontSize: 12, color: "var(--n8)" }}>
                {s.appCount} apps · {s.updatedAt}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
