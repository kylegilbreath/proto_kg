// ─── Prototype hub ────────────────────────────────────────────────────────────
// This is your home page: a list of prototypes you're building.
//
// To add a prototype:
//   1. Create a route folder, e.g. src/app/my-prototype/page.tsx
//   2. Add an entry to the PROTOTYPES array below (href must match the route).
//
// The original UI Starter Kit reference page is preserved at /starter-kit
// (linked in the footer).

"use client"

import Link from "next/link"
import { ArrowUpRight, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DatabricksLogo } from "@/components/shell/DatabricksLogo"
import { ThemeToggle } from "@/components/theme-toggle"

// ─── Your prototypes ──────────────────────────────────────────────────────────
// Edit this list as you add prototypes. Each `href` is the route it opens.
// `badge` is optional (e.g. "WIP", "Preview") — omit it to hide the chip.

type Prototype = {
  name: string
  desc: string
  href: string
  badge?: string
}

const PROTOTYPES: Prototype[] = [
  {
    name: "Genie Code Projects",
    desc: "Describe what this prototype explores.",
    href: "/genie-code-projects",
    badge: "WIP",
  },
  // Add more prototypes here — one object per prototype.
  // { name: "Prototype B", desc: "…", href: "/prototype-b" },
]

// ─── Reference pages ──────────────────────────────────────────────────────────
// Built-in demos shipped with the starter kit. Keep or remove as you like.

const REFERENCES: Prototype[] = [
  { name: "Shell demo", desc: "Full app shell: top bar, sidebar, page templates.", href: "/shell" },
  { name: "Design system", desc: "DuBois component reference and tokens.", href: "/design-system" },
]

function PrototypeRow({ p }: { p: Prototype }) {
  return (
    <Link
      href={p.href}
      prefetch={false}
      className="group flex items-center gap-3 rounded px-3 py-3 -mx-3 transition-colors hover:bg-muted"
    >
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-foreground">{p.name}</span>
          {p.badge && <Badge variant="indigo">{p.badge}</Badge>}
        </div>
        <span className="truncate text-hint text-muted-foreground">{p.desc}</span>
      </div>
      <span className="shrink-0 text-hint text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
        Open
      </span>
    </Link>
  )
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-12 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-2">
          <DatabricksLogo height={16} />
          <span className="text-muted-foreground/40 select-none">|</span>
          <span className="text-sm text-muted-foreground">Prototype Hub</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
        {/* Prototypes */}
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h1 className="text-[22px] font-semibold leading-7 text-foreground">Prototypes</h1>
            <span className="text-hint text-muted-foreground">
              {PROTOTYPES.length} {PROTOTYPES.length === 1 ? "prototype" : "prototypes"}
            </span>
          </div>

          {PROTOTYPES.length > 0 ? (
            <div className="flex flex-col divide-y divide-border">
              {PROTOTYPES.map((p) => (
                <PrototypeRow key={p.href} p={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-border px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">No prototypes yet.</p>
              <p className="text-hint text-muted-foreground mt-1">
                Add a route under <code className="bg-transparent">src/app/</code> and an entry in{" "}
                <code className="bg-transparent">PROTOTYPES</code>.
              </p>
            </div>
          )}
        </section>

        {/* Reference */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">Reference</h2>
          <div className="flex flex-col divide-y divide-border">
            {REFERENCES.map((p) => (
              <PrototypeRow key={p.href} p={p} />
            ))}
          </div>
        </section>
      </main>

      <footer className="flex items-center justify-between border-t border-border px-6 py-3">
        <span className="text-hint text-muted-foreground">Next.js · shadcn/ui · Tailwind v4 · DuBois tokens</span>
        <Link
          href="/starter-kit"
          className="flex items-center gap-1 text-hint text-primary hover:underline"
        >
          UI Starter Kit
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </footer>
    </div>
  )
}
