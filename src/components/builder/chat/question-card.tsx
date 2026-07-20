"use client"

import * as React from "react"
import { Check, ChevronLeft, ChevronRight, CornerDownLeft } from "lucide-react"
import { Q_STEPS, type QStep } from "./chat-data"

type Answers = Record<string, string>

export function QuestionCard({
  steps = Q_STEPS,
  finishLabel = "Generate",
  onComplete,
  onSkip,
}: {
  steps?: QStep[]
  finishLabel?: string
  onComplete: (a: Answers) => void
  onSkip: () => void
}) {
  const [step, setStep] = React.useState(0)
  const [picks, setPicks] = React.useState<string[][]>(() => steps.map((s) => [...s.def]))
  const [otherOn, setOtherOn] = React.useState<boolean[]>(() => steps.map(() => false))
  const [otherTxt, setOtherTxt] = React.useState<string[]>(() => steps.map(() => ""))
  const cur = steps[step]
  const last = step === steps.length - 1

  const setAt = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, i: number, v: T) =>
    setter((p) => p.map((x, j) => (j === i ? v : x)))
  const toggle = (opt: string) =>
    setAt(
      setPicks,
      step,
      picks[step].includes(opt) ? picks[step].filter((x) => x !== opt) : [...picks[step], opt],
    )

  const collect = (): Answers => {
    const ans: Answers = {}
    steps.forEach((s, i) => {
      ans[s.key] = picks[i].join(", ") || "—"
    })
    const others = otherTxt.map((t, i) => (otherOn[i] ? t.trim() : "")).filter(Boolean)
    ans.others = others.join("; ") || "—"
    return ans
  }
  const next = () => {
    if (last) onComplete(collect())
    else setStep((s) => s + 1)
  }

  return (
    <div className="q-card">
      <div className="q-card-head">
        <span className="q-card-title">Questions</span>
        <div className="q-pager">
          <button aria-label="Previous question" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
            <ChevronLeft className="lucide" style={{ width: 14, height: 14 }} />
          </button>
          <span>
            {step + 1} of {steps.length}
          </span>
          <button
            aria-label="Next question"
            disabled={last}
            onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
          >
            <ChevronRight className="lucide" style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>
      <div className="q-question">{cur.q}</div>
      <div className="q-opts">
        {cur.opts.map((opt) => {
          const on = picks[step].includes(opt)
          return (
            <button key={opt} type="button" className="q-opt" onClick={() => toggle(opt)}>
              <span className={"q-check" + (on ? " on" : "")}>
                {on && <Check className="lucide" style={{ width: 11, height: 11 }} />}
              </span>
              <span className={"q-opt-label" + (cur.mono ? " mono" : "")}>{opt}</span>
            </button>
          )
        })}
        <div className="q-other">
          <button
            type="button"
            className="q-check-btn"
            aria-label="Toggle other"
            onClick={() => setAt<boolean>(setOtherOn, step, !otherOn[step])}
          >
            <span className={"q-check" + (otherOn[step] ? " on" : "")}>
              {otherOn[step] && <Check className="lucide" style={{ width: 11, height: 11 }} />}
            </span>
          </button>
          <input
            className="q-other-input"
            placeholder="Others"
            value={otherTxt[step]}
            onFocus={() => {
              if (!otherOn[step]) setAt<boolean>(setOtherOn, step, true)
            }}
            onChange={(e) => {
              setAt(setOtherTxt, step, e.target.value)
              if (e.target.value && !otherOn[step]) setAt<boolean>(setOtherOn, step, true)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                next()
              }
            }}
          />
        </div>
      </div>
      <div className="q-card-foot">
        <button className="q-skip" onClick={onSkip}>
          Skip <kbd className="q-kbd">ESC</kbd>
        </button>
        <button className="btn btn-primary q-continue" onClick={next}>
          {last ? finishLabel : "Continue"}
          <CornerDownLeft className="lucide" style={{ width: 13, height: 13 }} />
        </button>
      </div>
    </div>
  )
}
