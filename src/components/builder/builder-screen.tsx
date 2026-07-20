"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Check,
  ChevronDown,
  CircleCheckBig,
  ExternalLink,
  GitBranch,
  MoreVertical,
  Rocket,
  Trash2,
  X,
} from "lucide-react"
import { GenieIcon, BrickworkMark, GlobalControls, KitBreadcrumb, KitDropdown, KitDropdownItem, type CrumbDef } from "@/components/apps"
import { useApps } from "@/app/apps/apps-provider"
import type { ChatApi, PreviewApi, QuestionnaireAnswers } from "./types"
import { IconButton } from "./icon-button"
import { ChatPanel } from "./chat/chat-panel"
import { PreviewPanel } from "./preview/preview-panel"

const BOOT_STEPS = [
  {
    key: "setup",
    label: "Setup",
    title: "Setting up a dedicated home for your app…",
    caption: "Provisioning workspace, compute, and a private URL.",
  },
  {
    key: "app",
    label: "Your app",
    title: "Bringing your app to life…",
    caption: "Wiring up the editor, preview, and assistant.",
  },
]

function BuilderBootstrap({ step }: { step: number }) {
  const current = BOOT_STEPS[Math.min(step, BOOT_STEPS.length - 1)]
  const pct = step >= BOOT_STEPS.length - 1 ? 100 : 48
  return (
    <div className="boot">
      <div className="boot-card">
        <div className="boot-mark">
          <GenieIcon size={30} />
        </div>
        <p className="boot-title">{current.title}</p>
        <p className="boot-caption">{current.caption}</p>
        <div className="boot-steps">
          <div className="boot-track">
            <div className="boot-fill" style={{ width: pct + "%" }} />
          </div>
          <div className="boot-labels">
            {BOOT_STEPS.map((s, i) => (
              <span key={s.key} className={"boot-step" + (i === step ? " active" : "") + (i < step ? " done" : "")}>
                <span className="boot-step-mark">
                  {i < step ? (
                    <Check className="lucide" style={{ width: 10, height: 10 }} />
                  ) : i === step ? (
                    <span className="boot-step-spin" />
                  ) : (
                    <span className="boot-step-dot" />
                  )}
                </span>
                {s.label}
              </span>
            ))}
          </div>
        </div>
        <div className="boot-tip">
          <span className="boot-tip-kbd">TIP</span>Describe the goal, not the code.
        </div>
      </div>
    </div>
  )
}

function WorkspaceTopBar({
  appName,
  onCrumbApps,
  onCrumbApp,
  deployOpen,
  onToggleDeploy,
  deploying,
  lastDeployed,
  justDeployed,
  appUrl,
  onConfirmDeploy,
  onOpenApp,
}: {
  appName: string
  onCrumbApps: () => void
  onCrumbApp: () => void
  deployOpen: boolean
  onToggleDeploy: () => void
  deploying: boolean
  lastDeployed: string | null
  justDeployed: boolean
  appUrl: string
  onConfirmDeploy: () => void
  onOpenApp: () => void
}) {
  const deployed = !!lastDeployed
  const crumbs: CrumbDef[] = [
    { label: "Apps", onClick: onCrumbApps },
    { label: appName, paren: "DAIS Cup", onClick: onCrumbApp },
  ]
  return (
    <header className="topbar ws-topbar">
      <div className="tb-left">
        <BrickworkMark height={18} />
        <span className="tb-product">Genie App Builder</span>
        <span className="tb-divider" />
        <KitBreadcrumb crumbs={crumbs} />
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <IconButton icon={GitBranch} label="GitHub" />
        <KitDropdown
          align="end"
          width={160}
          trigger={
            <button type="button" className="btn-icon" aria-label="More options">
              <MoreVertical className="lucide" />
            </button>
          }
        >
          <KitDropdownItem icon={Trash2} danger onClick={onCrumbApps}>
            Delete app
          </KitDropdownItem>
        </KitDropdown>
        <button type="button" className="btn btn-secondary">
          Share
        </button>
        <div style={{ position: "relative" }}>
          <div className={"ws-deploy" + (deployOpen ? " open" : "")}>
            <button className="lbl" onClick={onToggleDeploy}>
              {deploying ? "Deploying…" : deployed ? "Redeploy" : "Deploy"}
            </button>
            <span className="sep" />
            <button className="chev" aria-label="Deploy options" onClick={onToggleDeploy}>
              <ChevronDown className="lucide" />
            </button>
          </div>
          {deployOpen && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 60 }} onClick={onToggleDeploy} />
              <div className="deploy-pop">
                <div className="deploy-pop-head">
                  <span className="deploy-pop-title">Deploy {appName}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span className={"deploy-pop-status" + (deployed ? " live" : "")}>
                      {deploying ? "Deploying" : deployed ? "Live" : "Not deployed"}
                    </span>
                    <button className="btn-icon" aria-label="Close" onClick={onToggleDeploy}>
                      <X className="lucide" style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>
                {justDeployed && (
                  <div className="deploy-pop-success">
                    <CircleCheckBig className="lucide" style={{ width: 14, height: 14, color: "var(--success-fg)" }} />
                    <span>Deployed just now. Your app is live.</span>
                  </div>
                )}
                <div className="deploy-pop-row">
                  <span className="deploy-pop-label">App URL</span>
                  <a
                    className="deploy-pop-url"
                    href={appUrl}
                    onClick={(e) => {
                      e.preventDefault()
                      onOpenApp()
                    }}
                  >
                    <span className="truncate">{appUrl.replace(/^https?:\/\//, "")}</span>
                    <ExternalLink className="lucide" style={{ width: 12, height: 12 }} />
                  </a>
                </div>
                <div className="deploy-pop-row">
                  <span className="deploy-pop-label">Last deployed</span>
                  <span className="deploy-pop-val">{lastDeployed || "—"}</span>
                </div>
                {justDeployed ? (
                  <div className="deploy-pop-actions">
                    <a
                      className="btn btn-primary deploy-pop-open"
                      href={appUrl}
                      onClick={(e) => {
                        e.preventDefault()
                        onOpenApp()
                      }}
                    >
                      <ExternalLink className="lucide" style={{ width: 13, height: 13 }} />
                      Open app
                    </a>
                    <button className="btn btn-secondary deploy-pop-close" onClick={onToggleDeploy}>
                      Close
                    </button>
                  </div>
                ) : (
                  <button className="btn btn-primary deploy-pop-confirm" disabled={deploying} onClick={onConfirmDeploy}>
                    {deploying ? (
                      <>
                        <span
                          className="spinner"
                          style={{ width: 13, height: 13, borderColor: "var(--n1)", borderTopColor: "transparent" }}
                        />
                        Deploying…
                      </>
                    ) : (
                      <>
                        <Rocket className="lucide" style={{ width: 13, height: 13 }} />
                        {deployed ? "Redeploy to production" : "Deploy to production"}
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
        <GlobalControls env={false} />
      </div>
    </header>
  )
}

export function BuilderScreen({ appId }: { appId: string }) {
  const router = useRouter()
  const { getApp, pendingPrompt, consumePendingPrompt } = useApps()
  const app = getApp(appId)

  // Consume the pending prompt exactly once — read synchronously for the first
  // render (so `existing` is correct) and clear it in an effect (idempotent, so
  // React 19 StrictMode's double-mount is safe).
  const promptRef = React.useRef<string>("")
  const inited = React.useRef(false)
  if (!inited.current) {
    inited.current = true
    promptRef.current = pendingPrompt
  }
  const prompt = promptRef.current
  const existing = !prompt

  React.useEffect(() => {
    if (prompt) consumePendingPrompt()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    if (!app) router.push("/apps/list")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app])

  const [initializing, setInitializing] = React.useState(true)
  const [loadStep, setLoadStep] = React.useState(0)
  const [isDone, setIsDone] = React.useState(false)
  const [needsInput, setNeedsInput] = React.useState(false)
  const [spec, setSpec] = React.useState<QuestionnaireAnswers | null>(null)
  const [todos, setTodos] = React.useState<string[]>([])
  const [extras, setExtras] = React.useState<string[]>([])
  const [threshold, setThreshold] = React.useState<number | null>(null)
  const [deployOpen, setDeployOpen] = React.useState(false)
  const [deploying, setDeploying] = React.useState(false)
  const [justDeployed, setJustDeployed] = React.useState(false)
  const [lastDeployed, setLastDeployed] = React.useState<string | null>(existing ? "30m ago" : null)

  const chatApi = React.useRef<ChatApi | null>(null)
  const previewApi = React.useRef<PreviewApi | null>(null)
  const appName = app?.name ?? ""
  const appUrl = "https://" + appName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-7f3a9.cloud.databricksapps.com"

  React.useEffect(() => {
    const t1 = setTimeout(() => setLoadStep(1), 1500)
    const t2 = setTimeout(() => setInitializing(false), 3000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  if (!app) return null

  const toggleDeploy = () =>
    setDeployOpen((v) => {
      const n = !v
      if (!n) setJustDeployed(false)
      return n
    })
  const confirmDeploy = () => {
    if (deploying) return
    setJustDeployed(false)
    setDeploying(true)
    setTimeout(() => {
      setDeploying(false)
      setLastDeployed("just now")
      setJustDeployed(true)
      chatApi.current?.noteDeployed?.(appUrl, "just now")
    }, 1700)
  }

  const onBackToApps = () => router.push("/apps/list")
  const onBackToApp = () => router.push(`/apps/${appId}`)

  return (
    <div className="builder">
      <WorkspaceTopBar
        appName={appName}
        onCrumbApps={onBackToApps}
        onCrumbApp={onBackToApp}
        deployOpen={deployOpen}
        onToggleDeploy={toggleDeploy}
        deploying={deploying}
        lastDeployed={lastDeployed}
        justDeployed={justDeployed}
        appUrl={appUrl}
        onConfirmDeploy={confirmDeploy}
        onOpenApp={() => previewApi.current?.openPreview?.()}
      />
      {initializing ? (
        <BuilderBootstrap step={loadStep} />
      ) : (
        <div className="builder-body">
          <ChatPanel
            prompt={prompt}
            existing={existing}
            onDone={() => setIsDone(true)}
            onRequestInput={() => setNeedsInput(true)}
            onRequestDeploy={() => setDeployOpen(true)}
            onStartSelect={() => previewApi.current?.startSelect?.()}
            onAddComponent={(k) => {
              setExtras((p) => (p.includes(k) ? p : [...p, k]))
              previewApi.current?.gotoPreview?.()
            }}
            onDefineThreshold={(n) => {
              setThreshold(n)
              previewApi.current?.gotoPreview?.()
            }}
            onAddTodos={(t) => setTodos(t)}
            onAnswers={(a) => setSpec(a)}
            onOpenApp={() => previewApi.current?.openPreview?.()}
            apiRef={chatApi}
          />
          <PreviewPanel
            appId={appId}
            isDone={isDone}
            needsInput={needsInput}
            spec={spec}
            todos={todos}
            extras={extras}
            threshold={threshold}
            apiRef={previewApi}
            onSubmitInput={(answers) => {
              setSpec(answers)
              setNeedsInput(false)
              chatApi.current?.review?.(answers)
            }}
            onSendToChat={(label, text) => {
              chatApi.current?.send?.("[" + label + "] " + (text || ""))
            }}
            onTip={(t) => {
              chatApi.current?.fill?.(t)
            }}
          />
        </div>
      )}
    </div>
  )
}
