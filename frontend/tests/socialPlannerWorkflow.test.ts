import assert from "node:assert/strict"
import { describe, test } from "node:test"

import {
  buildWeeklySlate,
  type ContentIdea,
  rankIdeasForPlanning,
  scoreIdea,
} from "../src/components/socialPlannerWorkflow"

const idea = (overrides: Partial<ContentIdea>): ContentIdea => ({
  id: "idea-1",
  title: "Default idea",
  angle: "Default angle",
  source: "Voice note",
  theme: "positioning",
  format: "text",
  audienceFit: 3,
  proofStrength: 3,
  effort: 3,
  status: "intake",
  createdAt: "2026-05-28T00:00:00.000Z",
  ...overrides,
})

describe("social planner workflow", () => {
  test("scores ideas by fit and proof while discounting effort", () => {
    assert.equal(scoreIdea(idea({ audienceFit: 5, proofStrength: 5, effort: 1 })), 34)
    assert.equal(scoreIdea(idea({ audienceFit: 2, proofStrength: 2, effort: 5 })), 8)
  })

  test("ranks ready ideas before intake ideas and uses lower effort as a tie-breaker", () => {
    const ranked = rankIdeasForPlanning([
      idea({ id: "high-effort", title: "High effort", effort: 5, status: "selected" }),
      idea({ id: "intake", title: "Intake", audienceFit: 5, proofStrength: 5, effort: 1, status: "intake" }),
      idea({ id: "low-effort", title: "Low effort", effort: 1, status: "selected" }),
    ])

    assert.deepEqual(ranked.map((item) => item.id), ["low-effort", "high-effort", "intake"])
  })

  test("builds a five-day slate from selected ideas only", () => {
    const slate = buildWeeklySlate([
      idea({ id: "one", title: "One", status: "selected", audienceFit: 5, proofStrength: 5, effort: 1 }),
      idea({ id: "two", title: "Two", status: "selected", audienceFit: 4, proofStrength: 4, effort: 2 }),
      idea({ id: "draft", title: "Draft", status: "drafting", audienceFit: 5, proofStrength: 5, effort: 1 }),
    ])

    assert.deepEqual(
      slate.map(({ day, ideaId, title }) => ({ day, ideaId, title })),
      [
        { day: "Monday", ideaId: "one", title: "One" },
        { day: "Tuesday", ideaId: "two", title: "Two" },
      ],
    )
  })
})
