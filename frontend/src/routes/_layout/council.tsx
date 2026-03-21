import { createFileRoute } from "@tanstack/react-router"

import LLMCouncil from "@/components/LLMCouncil"

export const Route = createFileRoute("/_layout/council")({
  component: LLMCouncil,
  head: () => ({
    meta: [
      {
        title: "LLM Council - Multi-Agent Deliberation",
      },
    ],
  }),
})
