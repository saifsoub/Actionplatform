export type TrialWorkspace = {
  slug: string
  displayName: string
  signupHref: string
  loginHref: string
  postLoginHref: string
}

export const trialWorkspaces: Record<string, TrialWorkspace> = {
  "financial_ops-2940387048": {
    slug: "financial_ops-2940387048",
    displayName: "Financial Ops",
    signupHref: "/signup?workspace=financial_ops-2940387048",
    loginHref: "/login?workspace=financial_ops-2940387048",
    postLoginHref: "/onboarding?workspace=financial_ops-2940387048",
  },
}

export function getTrialWorkspace(
  slug: string | null,
): TrialWorkspace | undefined {
  return slug ? trialWorkspaces[slug] : undefined
}

export function getTrialWorkspaceFromSearch(
  search: string,
): TrialWorkspace | undefined {
  const params = new URLSearchParams(search)
  return getTrialWorkspace(params.get("workspace"))
}
