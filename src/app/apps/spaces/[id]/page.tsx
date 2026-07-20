import { Suspense } from "react"
import { SpaceDetailScreen } from "@/components/apps/space-detail-screen"

export default async function SpaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <Suspense>
      <SpaceDetailScreen spaceId={id} />
    </Suspense>
  )
}
