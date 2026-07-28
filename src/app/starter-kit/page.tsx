// ─── UI Starter Kit reference ─────────────────────────────────────────────────
// Original starter-kit landing page, preserved at /starter-kit.
// The hub home page (list of prototypes) now lives at src/app/page.tsx.
// Demo pages live in src/app/(demo)/ — delete that folder when you're ready.

"use client"

import { useState } from "react"
import Link from "next/link"
import { Copy, Check, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SegmentedControl, SegmentedItem } from "@/components/ui/segmented-control"
import { DatabricksLogo } from "@/components/shell/DatabricksLogo"
import { ThemeToggle } from "@/components/theme-toggle"

const AGENT_PROMPT = "git clone https://github.com/gioa/db-starter-kit.git && cd db-starter-kit && pnpm install && pnpm setup && pnpm dev"
const SYNC_CMD = "curl -fsSL https://raw.githubusercontent.com/gioa/db-starter-kit/main/scripts/sync.mjs -o scripts/sync.mjs && node scripts/sync.mjs"

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <Button variant="ghost" size="icon-xs" onClick={handleCopy} aria-label="Copy">
      {copied
        ? <Check className="h-3 w-3 text-[var(--success)]" />
        : <Copy className="h-3 w-3 text-muted-foreground" />}
    </Button>
  )
}

const STEPS = [
  { n: "1", label: "Clone the repo", code: "git clone https://github.com/gioa/db-starter-kit.git && cd db-starter-kit" },
  { n: "2", label: "Install and run setup", code: "pnpm install && pnpm setup" },
  { n: "3", label: "Start building", code: "pnpm dev" },
]

export default function Home() {
  const [audience, setAudience] = useState("human")

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-12 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-2">
          <DatabricksLogo height={16} />
          <span className="text-muted-foreground/40 select-none">|</span>
          <span className="text-sm text-muted-foreground">UI Starter Kit</span>
          <Badge variant="indigo" className="ml-1">DuBois</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Prototypes
            </Link>
          </Button>
          <ThemeToggle />
          <Button variant="default" size="sm" asChild>
            <a href="https://github.com/gioa/db-starter-kit" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center gap-10 px-6 py-16">
        {/* Hero */}
        <div className="flex flex-col items-center gap-3 text-center max-w-lg">
          <h2 className="text-[22px] leading-[28px] font-semibold text-foreground">Welcome to Databricks</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            DuBois design system components, tokens, and page templates. Use this repo as a template,
            delete the <code className="bg-transparent">&#40;demo&#41;</code> folder, and start building your app.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            <Button asChild><Link href="/shell" prefetch={false}>Open shell demo</Link></Button>
            <Button variant="default" asChild><Link href="/design-system" prefetch={false}>Design system</Link></Button>
          </div>
        </div>

        {/* Getting started */}
        <div className="w-full max-w-2xl rounded-md border border-border p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Getting started</p>
            <SegmentedControl value={audience} onValueChange={setAudience}>
              <SegmentedItem value="human">Human</SegmentedItem>
              <SegmentedItem value="agent">Agent</SegmentedItem>
            </SegmentedControl>
          </div>

          {audience === "human" ? (
            <>
              <div className="flex flex-col gap-3">
                {STEPS.map((s) => (
                  <div key={s.n} className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary mt-0.5">
                      {s.n}
                    </span>
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <span className="text-sm text-foreground">{s.label}</span>
                      <div className="flex items-center gap-2 border border-border rounded pl-2.5 pr-1 py-1">
                        <code className="flex-1 text-xs font-mono text-foreground bg-transparent">{s.code}</code>
                        <CopyButton text={s.code} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 border-t border-border" />
                <span className="text-hint text-muted-foreground shrink-0">update existing prototype</span>
                <div className="flex-1 border-t border-border" />
              </div>
              <div className="flex items-center gap-2 border border-border rounded pl-2.5 pr-1 py-1">
                <code className="flex-1 text-xs font-mono text-foreground bg-transparent">{SYNC_CMD}</code>
                <CopyButton text={SYNC_CMD} />
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">New prototype:</p>
                <div className="flex items-center gap-2 border border-border rounded pl-2.5 pr-1 py-1">
                  <code className="flex-1 text-xs font-mono text-foreground bg-transparent">{AGENT_PROMPT}</code>
                  <CopyButton text={AGENT_PROMPT} />
                </div>
              </div>
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 border-t border-border" />
                <span className="text-hint text-muted-foreground shrink-0">update existing prototype</span>
                <div className="flex-1 border-t border-border" />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">Already inside the project:</p>
                <div className="flex items-center gap-2 border border-border rounded pl-2.5 pr-1 py-1">
                  <code className="flex-1 text-xs font-mono text-foreground bg-transparent">{SYNC_CMD}</code>
                  <CopyButton text={SYNC_CMD} />
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-hint text-muted-foreground">Next.js · shadcn/ui · Tailwind v4 · DuBois tokens</p>
      </main>
    </div>
  )
}
