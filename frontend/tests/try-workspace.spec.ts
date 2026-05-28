import { expect, test } from "@playwright/test"

test.use({ storageState: { cookies: [], origins: [] } })

test("financial operations trial workspace makes a credible first impression", async ({
  page,
}) => {
  await page.goto("/try/financial_ops-2940387048")

  await expect(
    page.getByRole("heading", {
      name: "See how DoneAi clears finance operations bottlenecks",
    }),
  ).toBeVisible()
  await expect(
    page.getByText(
      "A guided workspace preview for AP, AR, close, and cash operations teams.",
    ),
  ).toBeVisible()
  await expect(page.getByText("Trusted workflow preview")).toBeVisible()
  await expect(page.getByText("Approval-first operating posture")).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Start guided workspace" }).first(),
  ).toBeVisible()
})

test("trial workspace CTA preserves the workspace context", async ({
  page,
}) => {
  await page.goto("/try/financial_ops-2940387048")

  await expect(page.getByRole("link", { name: "Sign in" })).toHaveAttribute(
    "href",
    "/login?workspace=financial_ops-2940387048",
  )
  await expect(
    page.getByRole("link", { name: "Start guided workspace" }).first(),
  ).toHaveAttribute("href", "/signup?workspace=financial_ops-2940387048")
})

test("trial workspace does not expose template branding or devtools", async ({
  page,
}) => {
  await page.goto("/try/financial_ops-2940387048")

  await expect(page).toHaveTitle("DoneAi Financial Operations Workspace")
  await expect(page.locator('link[rel="icon"][href="/vite.svg"]')).toHaveCount(
    0,
  )
  await expect(
    page.getByRole("button", { name: "Open TanStack Router Devtools" }),
  ).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: "Open Tanstack query devtools" }),
  ).toHaveCount(0)
})

test("signup page acknowledges the selected trial workspace", async ({
  page,
}) => {
  await page.goto("/try/financial_ops-2940387048")
  await page
    .getByRole("link", { name: "Start guided workspace" })
    .first()
    .click()

  await expect(page).toHaveURL("/signup?workspace=financial_ops-2940387048")
  await expect(
    page.getByText("Continue into the Financial Ops guided workspace."),
  ).toBeVisible()
  await expect(page.getByText("Full Stack FastAPI Template")).toHaveCount(0)
  await expect(page.getByText("DoneAi").first()).toBeVisible()
  await expect(page.getByRole("link", { name: "Log in" })).toHaveAttribute(
    "href",
    "/login?workspace=financial_ops-2940387048",
  )

  await page.getByRole("link", { name: "Log in" }).click()
  await expect(page).toHaveURL("/login?workspace=financial_ops-2940387048")
  await expect(
    page.getByText("Continue into the Financial Ops guided workspace."),
  ).toBeVisible()
  await expect(page.getByText("Full Stack FastAPI Template")).toHaveCount(0)
  await expect(page.getByRole("link", { name: "Sign up" })).toHaveAttribute(
    "href",
    "/signup?workspace=financial_ops-2940387048",
  )
})

test("trial onboarding stays specific to the financial ops workspace", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("access_token", "trial-test-token")
  })

  await page.goto("/onboarding?workspace=financial_ops-2940387048")

  await expect(
    page.getByRole("heading", { name: "Set up your Financial Ops workspace" }),
  ).toBeVisible()
  await expect(
    page.getByText("Tune DoneAi around the finance operations queues"),
  ).toBeVisible()
  await expect(page.getByRole("button", { name: /^Continue/ })).toBeVisible()
})

test("unknown trial workspace slugs do not render an official preview", async ({
  page,
}) => {
  await page.goto("/try/unknown_customer-123")

  await expect(page.getByTestId("not-found")).toBeVisible()
})
