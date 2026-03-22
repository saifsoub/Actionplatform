import { createFileRoute } from "@tanstack/react-router"
import AgentBuilder from "@/components/AgentBuilder"

export const Route = createFileRoute("/_layout/agents")({
  component: AgentBuilder,
  head: () => ({
    meta: [{ title: "Agent Studio — Build Your AI Team" }],
  }),
})
