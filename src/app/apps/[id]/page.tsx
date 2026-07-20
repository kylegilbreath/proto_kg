import { AppDetailScreen } from "@/components/apps/app-detail-screen"

export default async function AppDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <AppDetailScreen appId={id} />
}
