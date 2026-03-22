import { createFileRoute } from "@tanstack/react-router"
import Sage from "@/components/Sage"

export const Route = createFileRoute("/_layout/sage")({
  component: Sage,
  head: () => ({
    meta: [{ title: "Sage — Daily Intelligence Briefing" }],
  }),
})
