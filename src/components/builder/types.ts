import type { LucideIcon } from "lucide-react"

/** Answers collected by the preview Questionnaire / inline build QuestionCard. */
export interface QuestionnaireAnswers {
  audiences: string
  sources: string
  features: string
  others: string
}

/** Imperative bridge: PreviewPanel → ChatPanel. */
export interface ChatApi {
  send: (text: string) => void
  fill: (text: string) => void
  review: (answers: QuestionnaireAnswers) => void
  noteDeployed: (url: string, time: string) => void
}

/** Imperative bridge: ChatPanel / top bar → PreviewPanel. */
export interface PreviewApi {
  startSelect: () => void
  openPreview: () => void
  gotoPreview: () => void
}

export type ToolVariant = "file-create" | "file-edit" | "command" | "search"
export interface Tool {
  id: string
  variant: ToolVariant
  label: string
  status?: "running" | "done"
}

export interface SuggestionOption {
  label: string
  action: string
  icon?: LucideIcon
}

export interface AttentionItem {
  name: string
  reason: string
  action: string
  icon: LucideIcon
  object?: string
  exposureDecay?: boolean
  fill: string
}

export interface ConnectReportData {
  count: number
  total: number
  note: string
  confirmed: { name: string; table: string }[]
  attention: AttentionItem[]
}

/**
 * A single chat-log entry. Loosely typed on purpose — the scripted flows push
 * and patch messages generically (mirroring the kit's dynamic JS), so a wide
 * optional shape keyed by `kind` is simpler than a discriminated union here.
 */
export interface ChatMessage {
  id: string
  kind:
    | "user"
    | "genie-input"
    | "thinking"
    | "ai-text"
    | "suggestions"
    | "connect-report"
    | "tool-group"
    | "checkpoint"
    | "deploy-note"
    | "share-card"
    | "policy-block"
  text?: string
  status?: "asking" | "answered"
  answers?: [string, string][]
  active?: boolean
  label?: string
  duration?: number
  reasoning?: string[]
  options?: SuggestionOption[]
  data?: ConnectReportData
  tools?: Tool[]
  url?: string
  time?: string
  cap?: string
  policy?: string
}

export const uid = () => "m" + Math.random().toString(36).slice(2, 9)
