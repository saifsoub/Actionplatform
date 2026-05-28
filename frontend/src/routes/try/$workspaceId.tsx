import { createFileRoute } from "@tanstack/react-router"

import TryWorkspace from "@/components/TryWorkspace"

export const Route = createFileRoute("/try/$workspaceId")({
  component: TryWorkspaceRoute,
  head: () => ({
    meta: [
      { title: "Financial operations workspace | DoneAi" },
      {
        name: "description",
        content:
          "Preview the DoneAi financial operations workspace for invoice follow-up, cash visibility, and approval routing.",
      },
    ],
  }),
})

function TryWorkspaceRoute() {
  const { workspaceId } = Route.useParams()

  return <TryWorkspace workspaceId={workspaceId} />
}
