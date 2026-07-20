"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { BrickstoreApp } from "@/components/brickstore"

// Standalone full-screen preview of the generated app — this is what the
// builder's "Open app" opens in a new tab. Extras come from ?extras=a,b
// (e.g. ?extras=exposure,exposure-access-requested).
function PreviewInner() {
  const params = useSearchParams()
  const raw = params.get("extras")
  const extras = raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : []
  return <BrickstoreApp extras={extras} />
}

export default function AppPreviewPage() {
  return (
    <div className="h-dvh w-full overflow-hidden">
      <Suspense fallback={null}>
        <PreviewInner />
      </Suspense>
    </div>
  )
}
