// ─── Genie Code Projects ──────────────────────────────────────────────────────
// Prototype route, wrapped in the full app shell (top bar + sidebar).
// Build your prototype in the content area.
// Linked from the hub home page (src/app/page.tsx).

"use client"

import Link from "next/link"
import { AppShell, PageHeader } from "@/components/shell"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"

export default function GenieCodeProjects() {
  return (
    <AppShell activeItem="" workspace="Production" userInitial="K">
      <div className="flex h-full flex-col overflow-y-auto p-6">
        <PageHeader
          breadcrumbs={
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">Prototypes</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Genie Code Projects</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          }
          title="Genie Code Projects"
          badge={<Badge variant="indigo">WIP</Badge>}
          description="Describe what this prototype explores."
        />

        <p className="text-sm text-muted-foreground leading-relaxed">
          Start building here. This file is{" "}
          <code className="bg-transparent">src/app/genie-code-projects/page.tsx</code>. Use DuBois
          components from <code className="bg-transparent">@/components/ui</code> and{" "}
          <code className="bg-transparent">@/components/shell</code>.
        </p>
      </div>
    </AppShell>
  )
}
