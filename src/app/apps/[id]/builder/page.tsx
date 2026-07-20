import { BuilderScreen } from "@/components/builder/builder-screen"
import "../../builder.css"

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <BuilderScreen appId={id} />
}
