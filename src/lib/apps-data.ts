// Databricks Apps — mock data (ported from the Claude Design UI kit data.js)

export type AppStatus = "running" | "stopped" | "failed" | "building"

export interface DemoApp {
  id: string
  name: string
  owner: string
  space?: string
  gradient: string
  status: AppStatus
  updatedAt: string
}

export interface AppTemplate {
  id: string
  name: string
  description: string
  category: string
  gradient: string
  prompt: string
}

export const MOCK_APPS: DemoApp[] = [
  { id: "ai-slide-generator-dev", name: "ai-slide-generator-dev", owner: "user@example.com", gradient: "linear-gradient(135deg, var(--n2) 0%, var(--n5) 100%)", status: "running", updatedAt: "2h ago" },
  { id: "cost-insight-app", name: "cost-insight-app", owner: "user@example.com", space: "Finance Team", gradient: "linear-gradient(135deg, var(--n3) 0%, var(--n6) 100%)", status: "running", updatedAt: "3h ago" },
  { id: "db-chatbot-dev-joy", name: "db-chatbot-dev-joy", owner: "user@example.com", gradient: "linear-gradient(135deg, var(--n2) 0%, var(--n4) 100%)", status: "stopped", updatedAt: "1d ago" },
  { id: "e2e-obs-app", name: "e2e-obs-app", owner: "user@example.com", gradient: "linear-gradient(135deg, var(--n4) 0%, var(--n7) 100%)", status: "failed", updatedAt: "2d ago" },
  { id: "fiscal-overview", name: "fiscal-overview", owner: "user@example.com", space: "Finance Team", gradient: "linear-gradient(135deg, var(--n2) 0%, var(--n5) 100%)", status: "running", updatedAt: "5h ago" },
  { id: "dais-cup-inventory", name: "bricksport-command-center", owner: "user@example.com", space: "DAIS Cup", gradient: "linear-gradient(135deg, var(--n3) 0%, var(--n5) 100%)", status: "building", updatedAt: "30m ago" },
  { id: "mlflow-otel-zero", name: "20251024-mlflow-otel-zero", owner: "team@example.com", space: "ML Platform", gradient: "linear-gradient(135deg, var(--n2) 0%, var(--n4) 100%)", status: "stopped", updatedAt: "3d ago" },
  { id: "aaa", name: "aaa", owner: "team@example.com", gradient: "linear-gradient(135deg, var(--n4) 0%, var(--n6) 100%)", status: "stopped", updatedAt: "1w ago" },
]

export const TEMPLATES: AppTemplate[] = [
  { id: "ai-chatbot", name: "AI Chatbot", description: "Conversational assistant powered by a model endpoint", category: "AI / ML", gradient: "linear-gradient(135deg, var(--n2) 0%, var(--n4) 100%)", prompt: "Build an AI chatbot that answers questions using a Databricks model endpoint" },
  { id: "data-dashboard", name: "Data Dashboard", description: "Interactive charts and KPIs from a SQL warehouse", category: "Analytics", gradient: "linear-gradient(135deg, var(--n3) 0%, var(--n5) 100%)", prompt: "Build a data dashboard with charts and KPIs connected to a SQL warehouse" },
  { id: "sql-explorer", name: "SQL Explorer", description: "Natural language to SQL query builder and runner", category: "Data", gradient: "linear-gradient(135deg, var(--n2) 0%, var(--n5) 100%)", prompt: "Build a SQL explorer where users write natural language queries" },
  { id: "file-analyzer", name: "File Analyzer", description: "Upload and analyze documents with AI", category: "AI / ML", gradient: "linear-gradient(135deg, var(--n3) 0%, var(--n4) 100%)", prompt: "Build a file analyzer where users upload documents and get AI insights" },
  { id: "cost-monitor", name: "Cost Monitor", description: "Track and visualize Databricks spend over time", category: "Analytics", gradient: "linear-gradient(135deg, var(--n2) 0%, var(--n3) 100%)", prompt: "Build a cost monitoring dashboard tracking Databricks compute and storage spend" },
  { id: "model-play", name: "Model Playground", description: "Compare outputs from multiple model endpoints", category: "AI / ML", gradient: "linear-gradient(135deg, var(--n4) 0%, var(--n6) 100%)", prompt: "Build a model playground to compare responses from multiple endpoints" },
  { id: "report-gen", name: "Report Generator", description: "Generate and export scheduled data reports", category: "Data", gradient: "linear-gradient(135deg, var(--n3) 0%, var(--n6) 100%)", prompt: "Build a report generator that queries a warehouse and exports reports" },
  { id: "feature-browser", name: "Feature Browser", description: "Browse and search the Unity Catalog feature store", category: "ML Ops", gradient: "linear-gradient(135deg, var(--n2) 0%, var(--n4) 100%)", prompt: "Build a feature store browser for searching Unity Catalog features" },
]

export const EXAMPLE_PROMPTS = [
  "Build a sales dashboard that reads from Unity Catalog and shows weekly trends",
  "Create a chatbot that answers questions about my product documentation",
  "Build a tool to compare model outputs across different endpoints",
  "Make a file upload app that extracts and summarizes key information",
]

export const USE_CASES = ["All", "AI / ML", "Analytics", "Data", "ML Ops"]

export interface AppSpaceOption {
  id: string
  name: string
  desc: string
  apps: number
}

export const APP_SPACES: AppSpaceOption[] = [
  { id: "finance-team", name: "Finance Team", desc: "Finance & analytics apps", apps: 4 },
  { id: "ml-platform", name: "ML Platform", desc: "ML tooling & model serving", apps: 3 },
  { id: "events-ops", name: "Events & Ops", desc: "Tournament operations apps", apps: 6 },
  { id: "default", name: "Default App Space", desc: "Personal workspace", apps: 1 },
]

export interface AppSpace {
  id: string
  name: string
  description: string
  appCount: number
  updatedAt: string
  previews: string[]
}

export const SPACES: AppSpace[] = [
  {
    id: "dais-cup",
    name: "DAIS Cup",
    description: "Tournament ops, merch, and analytics apps",
    appCount: 8,
    updatedAt: "2h ago",
    previews: [
      "linear-gradient(135deg,var(--n3),var(--n5))",
      "linear-gradient(135deg,var(--n2),var(--n5))",
      "linear-gradient(135deg,var(--n3),var(--n4))",
      "linear-gradient(135deg,var(--n4),var(--n6))",
    ],
  },
  {
    id: "finance-team",
    name: "Finance Team",
    description: "Apps for the finance and analytics team",
    appCount: 4,
    updatedAt: "1d ago",
    previews: [
      "linear-gradient(135deg,var(--n3),var(--n5))",
      "linear-gradient(135deg,var(--n2),var(--n5))",
      "linear-gradient(135deg,var(--n3),var(--n4))",
      "linear-gradient(135deg,var(--n4),var(--n6))",
    ],
  },
  {
    id: "ml-platform",
    name: "ML Platform",
    description: "Machine learning tooling and model serving apps",
    appCount: 3,
    updatedAt: "3d ago",
    previews: [
      "linear-gradient(135deg,var(--n3),var(--n5))",
      "linear-gradient(135deg,var(--n2),var(--n5))",
      "linear-gradient(135deg,var(--n3),var(--n4))",
    ],
  },
]

/** Gradients for the app thumbnails in the space detail grid. */
export const APP_GRADS = [
  "linear-gradient(160deg,var(--n2),var(--n4))",
  "linear-gradient(160deg,var(--n3),var(--n5))",
  "linear-gradient(160deg,var(--n2),var(--n5))",
  "linear-gradient(160deg,var(--n3),var(--n4))",
  "linear-gradient(160deg,var(--n2),var(--n4))",
  "linear-gradient(160deg,var(--n3),var(--n5))",
  "linear-gradient(160deg,var(--n3),var(--n4))",
  "linear-gradient(160deg,var(--n2),var(--n5))",
]

export type TagVariant = "success" | "warning" | "danger" | "default" | "info" | "secondary"

export function statusTag(status: AppStatus): { label: string; variant: TagVariant } {
  if (status === "running") return { label: "Running", variant: "success" }
  if (status === "stopped") return { label: "Stopped", variant: "warning" }
  if (status === "failed") return { label: "Failed", variant: "danger" }
  return { label: "Building", variant: "default" }
}
