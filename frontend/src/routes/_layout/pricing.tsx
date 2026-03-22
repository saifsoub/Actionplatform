import { createFileRoute } from "@tanstack/react-router"
import Pricing from "@/components/Pricing"

export const Route = createFileRoute("/_layout/pricing")({
  component: Pricing,
  head: () => ({
    meta: [{ title: "Plans & Pricing — AI Advisory Platform" }],
  }),
})
