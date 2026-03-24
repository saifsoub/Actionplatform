import { createFileRoute } from "@tanstack/react-router"
import Onboarding from "@/components/Onboarding"

export const Route = createFileRoute("/_layout/onboarding")({
  component: Onboarding,
  head: () => ({
    meta: [{ title: "Get Started" }],
  }),
})
