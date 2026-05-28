import { createFileRoute } from "@tanstack/react-router"

import SocialPlanner from "@/components/SocialPlanner"

export const Route = createFileRoute("/_layout/social-planner")({
  component: SocialPlanner,
  head: () => ({
    meta: [{ title: "Weekly Social Planner" }],
  }),
})
