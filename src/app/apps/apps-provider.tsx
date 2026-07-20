"use client"

import * as React from "react"
import { MOCK_APPS, type DemoApp } from "@/lib/apps-data"

interface AppsContextValue {
  apps: DemoApp[]
  getApp: (id: string) => DemoApp | undefined
  createApp: (prompt: string) => DemoApp
  deleteApp: (id: string) => void
  /** Prompt handed from the Build screen to the builder. */
  pendingPrompt: string
  /** Read + clear the pending prompt (builder consumes it once). */
  consumePendingPrompt: () => string
}

const AppsContext = React.createContext<AppsContextValue | null>(null)

const STORAGE_KEY = "dbx-apps-kit"

interface PersistedState {
  apps?: DemoApp[]
  pendingPrompt?: string
}

export function AppsProvider({ children }: { children: React.ReactNode }) {
  const [apps, setApps] = React.useState<DemoApp[]>(MOCK_APPS)
  const [pendingPrompt, setPendingPrompt] = React.useState("")
  const hydrated = React.useRef(false)

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as PersistedState
        if (Array.isArray(saved.apps) && saved.apps.length > 0) setApps(saved.apps)
        if (typeof saved.pendingPrompt === "string") setPendingPrompt(saved.pendingPrompt)
      }
    } catch {
      // corrupted storage — fall back to seed data
    }
    hydrated.current = true
  }, [])

  React.useEffect(() => {
    if (!hydrated.current) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ apps, pendingPrompt }))
    } catch {
      // storage unavailable — persistence is best-effort
    }
  }, [apps, pendingPrompt])

  const getApp = React.useCallback((id: string) => apps.find((a) => a.id === id), [apps])

  const createApp = React.useCallback((prompt: string) => {
    const id = "app-" + Date.now()
    const newApp: DemoApp = {
      id,
      name: id,
      owner: "user@example.com",
      gradient: "linear-gradient(135deg, var(--n3) 0%, var(--n5) 100%)",
      status: "building",
      updatedAt: "just now",
    }
    setApps((prev) => [newApp, ...prev])
    setPendingPrompt(prompt)
    return newApp
  }, [])

  const deleteApp = React.useCallback((id: string) => {
    setApps((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const consumePendingPrompt = React.useCallback(() => {
    const p = pendingPrompt
    if (p) setPendingPrompt("")
    return p
  }, [pendingPrompt])

  const value = React.useMemo(
    () => ({ apps, getApp, createApp, deleteApp, pendingPrompt, consumePendingPrompt }),
    [apps, getApp, createApp, deleteApp, pendingPrompt, consumePendingPrompt],
  )

  return <AppsContext.Provider value={value}>{children}</AppsContext.Provider>
}

export function useApps(): AppsContextValue {
  const ctx = React.useContext(AppsContext)
  if (!ctx) throw new Error("useApps must be used within AppsProvider")
  return ctx
}
