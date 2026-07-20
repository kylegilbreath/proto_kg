import { Lock, Plug, Sigma, type LucideIcon } from "lucide-react"
import { uid, type ChatMessage, type ConnectReportData, type Tool } from "../types"

/** Multi-step questionnaire step. */
export interface QStep {
  key: string
  q: string
  opts: string[]
  def: string[]
  mono?: boolean
}

export const QUESTIONS_ANSWERED: [string, string][] = [
  ["Target audiences", "Data analysts and business stakeholders"],
  ["Data sources", "main.sales.transactions, main.sales.invoices"],
  ["Key features", "filters, KPI cards, data export"],
  ["Others", "support write back"],
]

export const PREVIEW_MSG =
  "Based on your prompt, attachments, and answers, I drafted an initial preview using mock data — the layout, sections, and structure reflect what you described. What would you like to do next?"
export const CONNECT_MSG =
  "I checked your App Space and what you can access. Here's how much of the draft I can wire to your real data — 6 of 10 metrics are ready, 4 need attention."
export const LAYOUT_MSG =
  "Sure — tell me what to change, or use the select tool in the preview to point at a component and send it here."
export const CLARIFY_MSG = "That's a bigger change — a couple quick questions so I build the right thing."
export const STARTERS = [
  "Build a capacity planning app",
  "Build a sales dashboard from Unity Catalog",
  "Build an AI chatbot over my docs",
  "Build a cost monitoring dashboard",
]
export const ITERATE_STARTERS = [
  "Add an exposure section",
  "Show only stores that need attention",
  "Add a date range filter",
]
export const SPEC_TODOS = [
  "Connect main.gotomarket/data for Use Case Pipeline — access requested",
  "Connect Salesforce for Annual Commit",
  "Connect Salesforce for Days to Renewal",
  "Define the Health Score formula",
]
export const AFTER_REQUEST_MSG =
  "While waiting for the access approval, do you want to remove those charts or show them as empty?"
export const REMOVE_MSG =
  "Done — I removed the mocked charts for the four blocked metrics and added them as TODOs in the app spec. They'll fill in automatically once access is approved."
export const EMPTY_MSG =
  "I switched the four blocked charts to an empty state — each shows a 'No data access yet' note with a link to the pending request."

// Adding low-stock reorder alerts: build the component, then show the data it needs.
export const ADD_ALERTS_MSG =
  "I'll add a low-stock reorder alerts panel that flags SKUs below their reorder point and suggests a reorder quantity."
export const ALERTS_CONNECT_MSG =
  "The alerts panel needs a couple of inputs. Here's what I can wire from your data and what still needs setup."
export const ADD_ALERTS_DONE_MSG =
  "The reorder alerts panel is live in the preview, using current stock and sales velocity. Connect the two inputs above to make the reorder quantities exact."
export const RESTYLE_ALERTS_MSG =
  "I'll switch the reorder alerts panel to the default card style — neutral surface and border, no yellow."
export const RESTYLE_ALERTS_DONE_MSG =
  "Updated — the alerts panel now uses the standard card styling. It's live in the preview."
export const RESTYLE_RE = /(background|border|yellow|colou?r|card style|default style|neutral|plain|restyle)/i
export const ALERTS_LABEL_RE = /low[- ]?stock reorder alerts/i
export const THRESHOLD_RE = /(reorder (point|threshold)|define.*threshold|threshold.*per sku)/i
export const THRESH_DONE = (n: number) =>
  `Done — the reorder alerts now use a ${n}-unit reorder point, and the suggested reorder quantities updated in the preview.`
export const SHARE_PROMPT_MSG = "Your app is live. Want to share it with your team so they can use it?"
export const SHARE_MSG =
  "Add people or groups below. They'll inherit Unity Catalog permissions, so they only see data they already have access to."
export const SHARE_PEOPLE = [
  { name: "You", detail: "owner@databricks.com", role: "Owner", you: true },
  { name: "DAIS Cup ops", detail: "dais-cup-ops (group)", role: "Can manage" },
  { name: "Venue managers", detail: "venue-mgrs (group)", role: "Can use" },
]
export const ALERTS_REPORT: ConnectReportData = {
  count: 2,
  total: 4,
  note: "2 inputs need setup before reorder quantities are exact.",
  confirmed: [
    { name: "Current stock levels", table: "dais_cup.inventory" },
    { name: "Sales velocity (units/day)", table: "dais_cup.sales" },
  ],
  attention: [
    {
      name: "Reorder thresholds",
      reason: "Per-SKU reorder point not defined",
      action: "Define thresholds",
      icon: Sigma,
      fill: "Define reorder thresholds per SKU",
    },
    {
      name: "Supplier lead times",
      reason: "Supplier lead-time table not connected",
      action: "Connect suppliers",
      icon: Plug,
      fill: "Connect the supplier lead-time table",
    },
  ],
}
export const ALERTS_RE = /\b(low[- ]?stock|reorder|restock)\b/i

// Add an Exposure section: build the section, then show the inputs it needs.
export const ADD_EXPOSURE_MSG =
  "I'll add an Exposure section at the end of the app — gross exposure for the next 14 days (lost sales + markdown liability), a recovery waterfall by lever, and how recoverable value decays as options expire. It reads from the same filter scope as the rest of the app."
export const EXPOSURE_CONNECT_MSG =
  "The exposure math needs a couple of financial inputs. Here's what I can wire from your data and what still needs setup."
export const ADD_EXPOSURE_DONE_MSG =
  "The Exposure section is live at the bottom of the app and a new dot was added to the section rail. Four of the five metrics are populated; the recoverable-value-decay chart is gated — it needs a table you don't have access to yet."
export const EXPOSURE_REPORT: ConnectReportData = {
  count: 4,
  total: 5,
  note: "1 metric needs access to another table before it can compute.",
  confirmed: [
    { name: "Gross exposure (lost sales)", table: "dais_cup.inventory" },
    { name: "Markdown liability", table: "dais_cup.returns" },
    { name: "Recoverable value", table: "dais_cup.recommendations" },
    { name: "Recovery by lever", table: "dais_cup.recommendations" },
  ],
  attention: [
    {
      name: "Recoverable value decay",
      reason: "Needs supplier lead times in main.supply_chain.supplier_lead_times",
      action: "Request access",
      icon: Lock,
      object: "main.supply_chain.supplier_lead_times",
      exposureDecay: true,
      fill: "Request access to main.supply_chain.supplier_lead_times",
    },
  ],
}
export const EXPOSURE_RE = /\bexposure\b/i

// After requesting access for the gated decay chart, Genie offers to drop it (and deploy)
// or show it as an empty placeholder while the request is pending.
export const EXPOSURE_AFTER_REQUEST_MSG =
  "Access requested for main.supply_chain.supplier_lead_times — the recoverable-value-decay chart stays empty until it's approved. I can remove that chart and deploy the rest now, or keep the placeholder so the team knows it's coming."
export const REMOVE_DECAY_MSG =
  "I'll remove the recoverable-value-decay chart, widen the recovery waterfall to fill the row, and log a TODO to restore it once the supplier lead-time access is approved — then deploy."
export const REMOVE_DECAY_DONE_MSG =
  "Done — the gated chart is gone, the recovery waterfall now spans the row, and I added a TODO to bring it back when access lands. Opening deploy…"
export const KEEP_DECAY_MSG =
  "I'll keep the recoverable-value-decay chart as a placeholder linked to the pending access request, log a TODO, and deploy the rest."
export const KEEP_DECAY_DONE_MSG =
  "Done — the placeholder stays in place showing the pending request, and I logged a TODO. It'll fill in automatically once main.supply_chain.supplier_lead_times is approved. Opening deploy…"
export const RESTORE_DECAY_TODO =
  "Restore the recoverable-value-decay chart once main.supply_chain.supplier_lead_times access is approved"

// Prior conversations for the chat-history dropdown.
export const CHAT_HISTORY = [
  { id: "h1", title: "BrickSport inventory command center", when: "Active", current: true },
  { id: "h2", title: "Add a recommended actions table", when: "10m ago" },
  { id: "h3", title: "Fan merch sales tracker", when: "Yesterday" },
  { id: "h4", title: "Venue staffing planner", when: "2 days ago" },
  { id: "h5", title: "Ticket scan throughput monitor", when: "Last week" },
]

export const CONFIRMED = [
  { name: "Burn YTD & Monthly Burn", table: "paid_usage_metering" },
  { name: "Monthly Consumption Chart", table: "paid_usage_metering" },
  { name: "SKU Mix", table: "workspace_sku_consumption_daily" },
  { name: "MAU & DAU/MAU Engagement", table: "fct_user_kpis_per_customer" },
  { name: "GTM Sales Intelligence", table: "gtm_sales_intelligence" },
  { name: "GTM Intelligence Agent", table: "gtm_sales_agent" },
]
export const ATTENTION = [
  {
    name: "Use Case Pipeline",
    reason: "Permission denied on main-gotomarket/data",
    action: "Request access",
    icon: Lock,
    object: "main.gotomarket.use_case_pipeline",
    fill: "Request access to main-gotomarket/data",
  },
  {
    name: "Annual Commit",
    reason: "Contract commit value not in consumption table",
    action: "Connect Salesforce",
    icon: Plug,
    fill: "Connect Salesforce to bring in annual commit value",
  },
  {
    name: "Days to Renewal",
    reason: "Renewal date not found",
    action: "Connect Salesforce",
    icon: Plug,
    fill: "Connect Salesforce to bring in renewal dates",
  },
  {
    name: "Health Score",
    reason: "Health score not found",
    action: "Define formula",
    icon: Sigma,
    fill: "Define the health score formula",
  },
]

export const DEFAULT_REPORT: ConnectReportData = {
  count: 6,
  total: 10,
  note: "4 need a connection or a definition before they'll work.",
  confirmed: CONFIRMED,
  attention: ATTENTION,
}

// ── Generic follow-up edits (typed messages) ──
export interface Followup {
  text: string
  tools: { variant: Tool["variant"]; label: string }[]
  summary: string
}
export const FOLLOWUPS: Followup[] = [
  {
    text: "I'll update the color scheme and adjust the spacing.",
    tools: [
      { variant: "file-edit", label: "src/app/globals.css" },
      { variant: "file-edit", label: "src/components/Dashboard.tsx" },
    ],
    summary:
      "Done — I've updated the color tokens and tightened the spacing across the dashboard cards. The changes are live in the preview.",
  },
  {
    text: "I'll add a chart widget and wire it to the dashboard data.",
    tools: [
      { variant: "file-create", label: "src/components/ChartWidget.tsx" },
      { variant: "file-edit", label: "src/components/Dashboard.tsx" },
    ],
    summary: "The chart widget is in — it renders below the stats row using your existing data.",
  },
]

// ── Inline question card steps ──
export const Q_STEPS: QStep[] = [
  {
    key: "audiences",
    q: "Who will use this app?",
    opts: ["Inventory managers", "Venue leads", "Operations", "Executives"],
    def: ["Inventory managers", "Venue leads"],
  },
  {
    key: "sources",
    q: "Which data should it use?",
    opts: ["main.dais_cup.inventory", "main.dais_cup.sales", "main.dais_cup.venues", "Upload a file"],
    def: ["main.dais_cup.inventory", "main.dais_cup.sales"],
    mono: true,
  },
  {
    key: "features",
    q: "What are the key features you need?",
    opts: ["Filters (venue, item)", "KPI summary cards", "Charts and visualizations", "Low-stock alerts"],
    def: ["KPI summary cards", "Charts and visualizations"],
  },
]

// Clarifying questions for a complex change on an EXISTING app.
export const Q_STEPS_ITERATE: QStep[] = [
  {
    key: "scope",
    q: "Where should this live?",
    opts: ["A new section in this app", "Replace the current view", "A new page", "A reusable component"],
    def: ["A new section in this app"],
  },
  {
    key: "sources",
    q: "Which data should it use?",
    opts: ["main.dais_cup.inventory", "main.dais_cup.sales", "Reuse the existing data", "Upload a file"],
    def: ["Reuse the existing data"],
    mono: true,
  },
  {
    key: "priorities",
    q: "What matters most for this change?",
    opts: ["Accuracy", "Performance", "Visual polish", "Interactivity"],
    def: ["Accuracy", "Visual polish"],
  },
]

// Seed history for opening an EXISTING building session — a prior conversation.
export const SEED_HISTORY = (): ChatMessage[] => {
  const a: [string, string][] = [
    ["Target audiences", "Inventory managers and venue leads"],
    ["Data sources", "main.dais_cup.inventory, main.dais_cup.sales"],
    ["Key features", "store map, demand outlook, recommended actions"],
    ["Others", "flag understocked stores ahead of match days"],
  ]
  return [
    { id: uid(), kind: "user", text: "Build an inventory command center for the DAIS Cup" },
    { id: uid(), kind: "genie-input", status: "answered", answers: a },
    { id: uid(), kind: "ai-text", text: PREVIEW_MSG },
    { id: uid(), kind: "checkpoint", label: "Build an inventory command center for the DAIS Cup" },
    { id: uid(), kind: "user", text: "Add a recommended actions table" },
    {
      id: uid(),
      kind: "tool-group",
      tools: [
        { id: uid(), variant: "file-create", label: "src/components/insights/RecommendedActions.tsx", status: "done" },
        { id: uid(), variant: "file-edit", label: "src/pages/InsightsPage.tsx", status: "done" },
      ],
    },
    {
      id: uid(),
      kind: "ai-text",
      text: "Added a recommended actions table under the store map — it reads from [main.dais_cup.sales] and ranks moves by recoverable value.",
    },
    { id: uid(), kind: "checkpoint", label: "Add a recommended actions table" },
  ]
}

// A change is "complex" enough to clarify when it spans multiple things,
// names a structural change, or is just long. Genie then asks before building.
const COMPLEX_RE =
  /\b(redesign|rebuild|overhaul|rework|revamp|restructur|migrat|integrat|multi-?page|new page|workflow|pipeline|end[- ]?to[- ]?end|auth(enticat)?|role|permission|real[- ]?time|forecast|predict|machine learning|ml model)\b/i
export function isComplexChange(text: string) {
  const t = (text || "").trim()
  const words = t.split(/\s+/).filter(Boolean).length
  const ands = (t.match(/\b(and|then|also|plus)\b/gi) || []).length
  return COMPLEX_RE.test(t) || words > 14 || ands >= 2
}

// Actions this App Space's admin has disallowed. A matching request is blocked
// with an explanation instead of being built.
export interface RestrictedRule {
  re: RegExp
  cap: string
  policy: string
}
export const RESTRICTED: RestrictedRule[] = [
  {
    re: /\b(e-?mail|notify (the )?(customers|fans|buyers)|send (a )?(mail|message|sms|text)|sms|text message)\b/i,
    cap: "sending email or messages to customers",
    policy: "Outbound messaging disabled",
  },
  {
    re: /\b(the internet|external (api|service|site)|third[- ]party (api|service)|public api|scrape|web ?hook|fetch from|call an? api)\b/i,
    cap: "calling external or internet services",
    policy: "No outbound network access",
  },
  {
    re: /\b(install|pip install|npm i|add a (package|dependency|library)|import a library)\b/i,
    cap: "installing new packages",
    policy: "Package installs locked",
  },
  {
    re: /\b(pii|personally identifiable|social security|ssn|credit card|payment details|fan (emails|phone)|personal data)\b/i,
    cap: "exposing personal data (PII)",
    policy: "PII access blocked",
  },
  {
    re: /\b((export|download|send|copy).{0,24}(outside|external|off[- ]platform|to my (laptop|computer|drive)|to s3|to a bucket))\b/i,
    cap: "moving data outside the workspace",
    policy: "Data egress restricted",
  },
]
export function restrictedRule(text: string) {
  return RESTRICTED.find((r) => r.re.test(text || ""))
}

export const TOOL_ICON_COLOR: Record<Tool["variant"], string> = {
  "file-create": "var(--success-fg)",
  "file-edit": "var(--warning-fg)",
  command: "var(--n9)",
  search: "var(--n9)",
}

export const ACCESS_DESTINATIONS = [
  "data-governance@databricks.com",
  "gtm-data-admin@databricks.com",
  "workspace-admin@databricks.com",
]

export type { LucideIcon }
