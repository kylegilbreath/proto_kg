"use client"

import * as React from "react"
import { Check, ClipboardList } from "lucide-react"
import type { QuestionnaireAnswers } from "../types"

function TodoRow({ text }: { text: string }) {
  const [done, setDone] = React.useState(false)
  return (
    <div className={"spec-todo" + (done ? " done" : "")} onClick={() => setDone((d) => !d)}>
      <span className="spec-cbox">
        {done && <Check className="lucide" style={{ width: 11, height: 11, color: "var(--n1)" }} />}
      </span>
      <span className="txt">{text}</span>
    </div>
  )
}

export function SpecSummary({ spec, todos }: { spec: QuestionnaireAnswers; todos: string[] }) {
  const rows: [string, string][] = [
    ["Audience", spec.audiences],
    ["Data sources", spec.sources],
    ["Key features", spec.features],
    ["Notes", spec.others],
  ]
  const f = (spec.features || "").toLowerCase()
  const reqs: string[] = []
  if (f.includes("kpi")) reqs.push("Show key metrics as KPI cards with period-over-period change")
  if (f.includes("filter")) reqs.push("Filter data by date range and segment")
  if (f.includes("export")) reqs.push("Export the detail table to CSV")
  if (f.includes("write")) reqs.push("Write edits back to the source, enforced by Unity Catalog")
  if (reqs.length === 0) reqs.push("Surface the requested data in a clear, filterable layout")
  const impl: [string, string][] = [
    ["Framework", "Streamlit on Databricks Apps"],
    ["Data access", "Spark SQL over " + spec.sources],
    ["Identity", "Inherits Unity Catalog permissions"],
    ["Compute", "Serverless"],
  ]
  const sections = [
    "Header — title, date range, and segment filter",
    "KPI row — four metric cards with deltas",
    "Trend — monthly bar chart",
    "Detail — sortable table with CSV export",
  ]
  return (
    <div className="pv-quest-wrap">
      <div className="pv-spec">
        <div className="pv-quest-head">
          <div className="pv-empty-icon">
            <ClipboardList className="lucide" style={{ width: 20, height: 20 }} />
          </div>
          <div>
            <div className="pv-quest-title">App spec</div>
            <div className="pv-quest-sub">Genie keeps this in sync as you build.</div>
          </div>
        </div>
        <div className="spec-section">
          <div className="spec-label">Overview</div>
          <dl className="spec-dl">
            {rows.map(([k, v]) => (
              <React.Fragment key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </React.Fragment>
            ))}
          </dl>
        </div>
        <div className="spec-section">
          <div className="spec-label">Requirements</div>
          <ul className="spec-list">
            {reqs.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
        <div className="spec-section">
          <div className="spec-label">Implementation</div>
          <dl className="spec-dl">
            {impl.map(([k, v]) => (
              <React.Fragment key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </React.Fragment>
            ))}
          </dl>
        </div>
        <div className="spec-section">
          <div className="spec-label">App sections</div>
          <ul className="spec-list">
            {sections.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="spec-section">
          <div className="spec-label">
            TODOs{" "}
            {todos.length > 0 && (
              <span className="count-pill" style={{ background: "rgba(var(--overlay),0.08)", color: "var(--n9)" }}>
                {todos.length}
              </span>
            )}
          </div>
          {todos.length === 0 ? (
            <div className="spec-empty">No todos yet. Genie adds follow-ups here as you connect data.</div>
          ) : (
            <div className="spec-todos">
              {todos.map((t, i) => (
                <TodoRow key={i} text={t} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
