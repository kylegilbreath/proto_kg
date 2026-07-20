"use client"

import * as React from "react"
import { Check, CircleHelp } from "lucide-react"
import { GenieIcon } from "@/components/apps"
import type { QuestionnaireAnswers } from "../types"

export function Questionnaire({ onSubmit }: { onSubmit: (a: QuestionnaireAnswers) => void }) {
  const AUD = ["Data analysts", "Business stakeholders", "Executives", "Engineers"]
  const FEAT = ["Filters", "KPI cards", "Data export", "Write back"]
  const [aud, setAud] = React.useState(["Data analysts", "Business stakeholders"])
  const [sources, setSources] = React.useState("main.sales.transactions, main.sales.invoices")
  const [feat, setFeat] = React.useState(["Filters", "KPI cards", "Data export"])
  const [others, setOthers] = React.useState("Support write back.")
  const toggle = (arr: string[], set: React.Dispatch<React.SetStateAction<string[]>>, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
  const submit = () =>
    onSubmit({
      audiences: aud.join(", ") || "—",
      sources: sources.trim() || "—",
      features: feat.join(", ") || "—",
      others: others.trim() || "—",
    })
  return (
    <div className="pv-quest-wrap">
      <div className="pv-quest">
        <div className="pv-quest-head">
          <div className="pv-empty-icon">
            <CircleHelp className="lucide" style={{ width: 20, height: 20 }} />
          </div>
          <div>
            <div className="pv-quest-title">A few questions to tailor your app</div>
            <div className="pv-quest-sub">Genie uses these to draft the right layout and wire the data.</div>
          </div>
        </div>
        <div className="pv-field">
          <label>Who is this for?</label>
          <div className="pv-chips">
            {AUD.map((o) => (
              <button key={o} className={"pv-chip" + (aud.includes(o) ? " on" : "")} onClick={() => toggle(aud, setAud, o)}>
                {aud.includes(o) && <Check className="lucide" style={{ width: 11, height: 11 }} />}
                {o}
              </button>
            ))}
          </div>
        </div>
        <div className="pv-field">
          <label>Data sources</label>
          <input className="pv-qinput" value={sources} onChange={(e) => setSources(e.target.value)} />
        </div>
        <div className="pv-field">
          <label>Key features</label>
          <div className="pv-chips">
            {FEAT.map((o) => (
              <button key={o} className={"pv-chip" + (feat.includes(o) ? " on" : "")} onClick={() => toggle(feat, setFeat, o)}>
                {feat.includes(o) && <Check className="lucide" style={{ width: 11, height: 11 }} />}
                {o}
              </button>
            ))}
          </div>
        </div>
        <div className="pv-field">
          <label>Anything else?</label>
          <textarea className="pv-qtextarea" rows={2} value={others} onChange={(e) => setOthers(e.target.value)} />
        </div>
        <button className="btn btn-primary" style={{ height: 28, width: "fit-content" }} onClick={submit}>
          <GenieIcon size={14} />
          Generate preview with mock data
        </button>
      </div>
    </div>
  )
}
