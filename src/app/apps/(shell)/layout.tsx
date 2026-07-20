import { AppsShell } from "@/components/shell"

export default function AppsShellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppsShell>{children}</AppsShell>
}
