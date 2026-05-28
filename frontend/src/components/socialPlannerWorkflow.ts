export type ContentTheme =
  | "positioning"
  | "story"
  | "proof"
  | "offer"
  | "community"

export type ContentFormat = "text" | "carousel" | "poll" | "video" | "newsletter"

export type IdeaStatus = "intake" | "prioritized" | "selected" | "drafting" | "published" | "archived"

export interface ContentIdea {
  id: string
  title: string
  angle: string
  source: string
  theme: ContentTheme
  format: ContentFormat
  audienceFit: number
  proofStrength: number
  effort: number
  status: IdeaStatus
  createdAt: string
}

export interface WeeklySlateItem {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday"
  ideaId: string
  title: string
  theme: ContentTheme
  format: ContentFormat
  score: number
}

const WEEKDAYS: WeeklySlateItem["day"][] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
]

const STATUS_PRIORITY: Record<IdeaStatus, number> = {
  selected: 0,
  drafting: 1,
  prioritized: 2,
  intake: 3,
  published: 4,
  archived: 5,
}

export function scoreIdea(idea: Pick<ContentIdea, "audienceFit" | "proofStrength" | "effort">): number {
  const effortPenalty = idea.effort + Math.max(0, idea.effort - 4)
  return idea.audienceFit * 4 + idea.proofStrength * 3 - effortPenalty
}

export function rankIdeasForPlanning(ideas: ContentIdea[]): ContentIdea[] {
  return [...ideas].sort((left, right) => {
    const statusDelta = STATUS_PRIORITY[left.status] - STATUS_PRIORITY[right.status]
    if (statusDelta !== 0) return statusDelta

    const scoreDelta = scoreIdea(right) - scoreIdea(left)
    if (scoreDelta !== 0) return scoreDelta

    const effortDelta = left.effort - right.effort
    if (effortDelta !== 0) return effortDelta

    return left.createdAt.localeCompare(right.createdAt)
  })
}

export function buildWeeklySlate(ideas: ContentIdea[]): WeeklySlateItem[] {
  return rankIdeasForPlanning(ideas)
    .filter((idea) => idea.status === "selected")
    .slice(0, WEEKDAYS.length)
    .map((idea, index) => ({
      day: WEEKDAYS[index],
      ideaId: idea.id,
      title: idea.title,
      theme: idea.theme,
      format: idea.format,
      score: scoreIdea(idea),
    }))
}
