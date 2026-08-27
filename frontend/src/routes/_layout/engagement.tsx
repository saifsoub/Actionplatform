import { createFileRoute } from "@tanstack/react-router"
import Engagement from "@/components/Engagement"

export const Route = createFileRoute("/_layout/engagement")({
  component: Engagement,
  head: () => ({
    meta: [{ title: "Engagement Monitor" }],
  }),
})
