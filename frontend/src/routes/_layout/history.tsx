import { createFileRoute } from "@tanstack/react-router"
import History from "@/components/History"

export const Route = createFileRoute("/_layout/history")({
  component: History,
  head: () => ({
    meta: [{ title: "Decision Journal" }],
  }),
})
