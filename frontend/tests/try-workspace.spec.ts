import { expect, test } from "@playwright/test"

test.use({ storageState: { cookies: [], origins: [] } })

test("financial operations try workspace presents a credible prospect landing page", async ({
  page,
}) => {
  await page.goto("/try/financial_ops-2940387048")

  await expect(page.getByTestId("not-found")).toHaveCount(0)
  await expect(
    page.getByRole("heading", {
      name: "AI operators for financial operations teams",
    }),
  ).toBeVisible()
  await expect(
    page.getByText("Review invoices, reconcile exceptions, and prepare approvals"),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Guided workspace preview" }),
  ).toBeVisible()
  await expect(page.getByText("Human approval built in")).toBeVisible()
  await expect(page.getByRole("link", { name: "Request a walkthrough" })).toBeVisible()
})
