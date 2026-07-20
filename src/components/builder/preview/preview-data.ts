import { BookMarked, Bot, Database, type LucideIcon } from "lucide-react"

export interface TreeNode {
  id: string
  name: string
  type: "folder" | "file"
  open?: boolean
  children?: TreeNode[]
}

export const FILE_TREE: TreeNode[] = [
  {
    id: "src",
    name: "src",
    type: "folder",
    open: true,
    children: [
      {
        id: "src/app",
        name: "app",
        type: "folder",
        open: true,
        children: [
          { id: "src/app/page.tsx", name: "page.tsx", type: "file" },
          { id: "src/app/layout.tsx", name: "layout.tsx", type: "file" },
          { id: "src/app/globals.css", name: "globals.css", type: "file" },
        ],
      },
      {
        id: "src/components",
        name: "components",
        type: "folder",
        open: true,
        children: [
          { id: "src/components/Dashboard.tsx", name: "Dashboard.tsx", type: "file" },
          { id: "src/components/ChartWidget.tsx", name: "ChartWidget.tsx", type: "file" },
        ],
      },
    ],
  },
  { id: "package.json", name: "package.json", type: "file" },
  { id: "tailwind.config.ts", name: "tailwind.config.ts", type: "file" },
]

export const FILE_CONTENTS: Record<string, string> = {
  "src/app/page.tsx": `export default function Page() {\n  return (\n    <main className="p-8">\n      <h1 className="text-2xl font-medium">Dashboard</h1>\n      <Dashboard />\n    </main>\n  )\n}`,
  "src/app/layout.tsx": `export default function Layout({ children }) {\n  return <html><body>{children}</body></html>\n}`,
  "src/app/globals.css": `@tailwind base;\n@tailwind components;\n@tailwind utilities;`,
  "src/components/Dashboard.tsx": `import { DataTable } from "./DataTable"\n\nexport function Dashboard() {\n  return (\n    <div className="grid gap-4">\n      <DataTable />\n    </div>\n  )\n}`,
  "src/components/ChartWidget.tsx": `"use client"\nimport { BarChart, Bar, XAxis } from "recharts"\n\nexport function ChartWidget({ data }) {\n  return <BarChart width={400} height={200} data={data}><Bar dataKey="value" /></BarChart>\n}`,
  "package.json": `{\n  "name": "my-app",\n  "version": "0.1.0",\n  "dependencies": {\n    "next": "15.0.0",\n    "react": "^18",\n    "recharts": "^2.10.0"\n  }\n}`,
  "tailwind.config.ts": `import type { Config } from "tailwindcss"\n\nexport default {\n  content: ["./src/**/*.{ts,tsx}"],\n  theme: { extend: {} },\n} satisfies Config`,
}

export const CATALOG_TREE: TreeNode[] = [
  {
    id: "main",
    name: "main",
    type: "folder",
    open: true,
    children: [
      {
        id: "main/analytics",
        name: "analytics",
        type: "folder",
        open: true,
        children: [
          { id: "main/analytics/users", name: "users", type: "file" },
          { id: "main/analytics/orders", name: "orders", type: "file" },
          { id: "main/analytics/events", name: "events", type: "file" },
        ],
      },
      {
        id: "main/ml_features",
        name: "ml_features",
        type: "folder",
        children: [{ id: "main/ml_features/features", name: "features", type: "file" }],
      },
    ],
  },
]

export const DATABASE_TREE: TreeNode[] = [
  {
    id: "prod",
    name: "prod_db",
    type: "folder",
    open: true,
    children: [
      {
        id: "prod/public",
        name: "public",
        type: "folder",
        open: true,
        children: [
          { id: "prod/public/users", name: "users", type: "file" },
          { id: "prod/public/products", name: "products", type: "file" },
        ],
      },
    ],
  },
]

export const SCHEMAS: Record<string, string[][]> = {
  "main/analytics/users": [
    ["user_id", "BIGINT", "NO", "Primary key"],
    ["email", "STRING", "YES", "User email address"],
    ["name", "STRING", "YES", "Display name"],
    ["created_at", "TIMESTAMP", "NO", "Account creation time"],
    ["is_active", "BOOLEAN", "NO", "Whether account is active"],
  ],
  "main/analytics/orders": [
    ["order_id", "BIGINT", "NO", "Primary key"],
    ["user_id", "BIGINT", "NO", "FK → users.user_id"],
    ["total", "DECIMAL", "NO", "Order total in USD"],
    ["status", "STRING", "NO", "pending | paid | shipped"],
  ],
  "main/analytics/events": [
    ["event_id", "BIGINT", "NO", "Primary key"],
    ["user_id", "BIGINT", "YES", "FK → users.user_id"],
    ["event_type", "STRING", "NO", "Event category"],
    ["ts", "TIMESTAMP", "NO", "Event timestamp"],
  ],
  "main/ml_features/features": [
    ["feature_id", "BIGINT", "NO", "Primary key"],
    ["name", "STRING", "NO", "Feature name"],
    ["value", "DOUBLE", "YES", "Feature value"],
  ],
  "prod/public/users": [
    ["id", "BIGINT", "NO", "Primary key"],
    ["email", "VARCHAR", "NO", "Unique email"],
    ["role", "VARCHAR", "NO", "admin | viewer | editor"],
  ],
  "prod/public/products": [
    ["id", "BIGINT", "NO", "Primary key"],
    ["name", "VARCHAR", "NO", "Product name"],
    ["price", "DECIMAL", "NO", "Price in USD"],
  ],
}

export interface Agent {
  id: string
  name: string
  status: "active" | "idle"
  endpoint: string
  description: string
  capabilities: string[]
}
export const AGENTS: Agent[] = [
  {
    id: "summarizer",
    name: "Data Summarizer",
    status: "active",
    endpoint: "/api/agents/summarizer",
    description: "Generates natural-language summaries of tables and query results.",
    capabilities: ["Summarize table", "Describe schema", "Explain query"],
  },
  {
    id: "explainer",
    name: "Query Explainer",
    status: "active",
    endpoint: "/api/agents/explainer",
    description: "Breaks down complex SQL into plain-language step-by-step explanations.",
    capabilities: ["Explain SQL", "Identify bottlenecks", "Suggest indexes"],
  },
  {
    id: "anomaly",
    name: "Anomaly Detector",
    status: "idle",
    endpoint: "/api/agents/anomaly",
    description: "Scans datasets for statistical outliers and data quality issues.",
    capabilities: ["Detect outliers", "Flag nulls", "Distribution report"],
  },
  {
    id: "validator",
    name: "Data Validator",
    status: "active",
    endpoint: "/api/agents/validator",
    description: "Runs assertion checks against expectations and generates quality reports.",
    capabilities: ["Assert expectations", "Quality report", "Column profiling"],
  },
]

export interface Addable {
  id: string
  label: string
  icon: LucideIcon
}
export const ADDABLE: Addable[] = [
  { id: "catalog", label: "Unity Catalog", icon: BookMarked },
  { id: "agents", label: "Agents", icon: Bot },
  { id: "database", label: "Database", icon: Database },
]
