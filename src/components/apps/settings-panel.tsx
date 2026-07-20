"use client"

import * as React from "react"
import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tag } from "./primitives"

const SECTIONS = [
  { id: "general", label: "General" },
  { id: "resources", label: "Resources" },
  { id: "user-auth", label: "User authorization" },
  { id: "telemetry", label: "App Telemetry" },
  { id: "advanced", label: "Advanced" },
]

// Hoisted to module scope (defining it inside render would remount children
// on every keystroke and drop input focus).
function Section({
  id,
  title,
  open,
  onToggle,
  chevron = true,
  children,
}: {
  id: string
  title: string
  open: boolean
  onToggle: (id: string) => void
  chevron?: boolean
  children?: React.ReactNode
}) {
  const ChevronIcon = chevron ? (open ? ChevronUp : ChevronDown) : ChevronRight
  return (
    <div className="set-card" data-sec={id}>
      <button type="button" className="set-card-head" onClick={() => onToggle(id)}>
        <span className="set-card-title">{title}</span>
        <ChevronIcon className="lucide" style={{ width: 16, height: 16, color: "var(--n8)" }} />
      </button>
      {open && children && <div className="set-card-body">{children}</div>}
    </div>
  )
}

export function SettingsPanel({ app }: { app: { name: string } }) {
  const [open, setOpen] = React.useState<Record<string, boolean>>({
    general: true,
    resources: false,
    "user-auth": false,
    telemetry: false,
    advanced: true,
  })
  const [active, setActive] = React.useState("general")
  const [fastDeploy, setFastDeploy] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }))

  const jump = (id: string) => {
    setActive(id)
    setOpen((o) => ({ ...o, [id]: true }))
    const el = scrollRef.current?.querySelector<HTMLElement>(`[data-sec="${id}"]`)
    if (el && scrollRef.current) scrollRef.current.scrollTop = el.offsetTop - 8
  }

  return (
    <div className="set-wrap" ref={scrollRef}>
      <div className="set-main">
        <Section id="general" title="General" open={open.general} onToggle={toggle}>
          <div className="set-field">
            <label className="set-label" htmlFor="set-app-name">
              App name
            </label>
            <input id="set-app-name" className="input" defaultValue={app.name} />
          </div>
          <div className="set-row2">
            <div className="set-field">
              <label className="set-label" htmlFor="set-git-url">
                Git repository URL
              </label>
              <input id="set-git-url" className="input" defaultValue="http://github.com/user/repo_name" />
            </div>
            <div className="set-field">
              <span className="set-label">Git provider</span>
              <div className="set-select">
                <span>GitHub</span>
                <ChevronDown className="lucide" style={{ color: "var(--n8)" }} />
              </div>
            </div>
          </div>
          <div className="set-field">
            <label className="set-label" htmlFor="set-root">
              App root folder
            </label>
            <div className="set-inline">
              <input id="set-root" className="input" defaultValue="./" style={{ flex: 1 }} />
              <Button variant="default" size="sm">
                Edit
              </Button>
            </div>
          </div>
        </Section>

        <Section id="resources" title="Resources" open={open.resources} onToggle={toggle} />
        <Section id="user-auth" title="User authorization" open={open["user-auth"]} onToggle={toggle} />
        <Section id="telemetry" title="OpenTelemetry" open={open.telemetry} onToggle={toggle} chevron={false} />

        <Section id="advanced" title="Advanced" open={open.advanced} onToggle={toggle}>
          <div className="set-adv-row">
            <div className="set-adv-head">
              <span className="set-adv-title">Fast and secure deployment without pre-installed packages</span>
              <Tag variant="info" size="sm">
                New
              </Tag>
            </div>
            <button
              type="button"
              className={"set-toggle" + (fastDeploy ? " on" : "")}
              onClick={() => setFastDeploy((v) => !v)}
              role="switch"
              aria-checked={fastDeploy}
              aria-label="Fast and secure deployment"
            >
              <span className="set-toggle-knob" />
            </button>
            <span className="set-adv-state">{fastDeploy ? "Enabled" : "Disabled"}</span>
          </div>
          <p className="set-adv-desc">
            To speed up and secure deployments, new apps created after {"{date}"} and <b>existing apps after {"{date}"}</b>{" "}
            will no longer include pre-installed packages. Enable now and add dependencies explicitly to ensure successful
            deployments.{" "}
            <a className="set-link" href="#" onClick={(e) => e.preventDefault()}>
              Learn more
            </a>
          </p>
        </Section>
      </div>

      <nav className="set-anchors">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={"set-anchor" + (active === s.id ? " active" : "")}
            onClick={() => jump(s.id)}
          >
            {s.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
