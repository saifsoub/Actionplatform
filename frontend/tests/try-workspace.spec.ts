import { expect, test } from "@playwright/test"

test.use({ storageState: { cookies: [], origins: [] } })

test("financial operations try workspace presents a credible public preview", async ({
  page,
}) => {
  await page.goto("/try/financial_ops-2940387048")

  await expect(
    page.getByRole("heading", {
      name: "Financial operations workspace for owner-led teams",
    }),
  ).toBeVisible()
  await expect(page.getByText("No login required")).toBeVisible()
  await expect(
    page.getByText("Invoice follow-up", { exact: true }),
  ).toBeVisible()
  await expect(page.getByText("Request a guided pilot")).toBeVisible()
  await expect(page.getByText("DoneAi uses your current process")).toBeVisible()
  await expect(page.getByText("TanStack")).toHaveCount(0)
})

test("unknown try workspace IDs do not show mismatched prospect content", async ({
  page,
}) => {
  await page.goto("/try/not-a-real-workspace")

  await expect(page.getByTestId("not-found")).toBeVisible()
  await expect(
    page.getByRole("heading", {
      name: "Financial operations workspace for owner-led teams",
    }),
  ).toHaveCount(0)
})
