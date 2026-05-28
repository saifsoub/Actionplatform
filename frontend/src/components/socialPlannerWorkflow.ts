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

const CONTENT_THEMES: ContentTheme[] = ["positioning", "story", "proof", "offer", "community"]
const CONTENT_FORMATS: ContentFormat[] = ["text", "carousel", "poll", "video", "newsletter"]
const IDEA_STATUSES: IdeaStatus[] = ["intake", "prioritized", "selected", "drafting", "published", "archived"]
const WEEKLY_PLAN_STATUSES: IdeaStatus[] = ["selected", "drafting"]

const STATUS_PRIORITY: Record<IdeaStatus, number> = {
  selected: 0,
  drafting: 1,
  prioritized: 2,
  intake: 3,
  published: 4,
  archived: 5,
}

function isRating(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5
}

function isContentTheme(value: unknown): value is ContentTheme {
  return CONTENT_THEMES.some((theme) => theme === value)
}

function isContentFormat(value: unknown): value is ContentFormat {
  return CONTENT_FORMATS.some((format) => format === value)
}

function isIdeaStatus(value: unknown): value is IdeaStatus {
  return IDEA_STATUSES.some((status) => status === value)
}

export function isWeeklyPlanStatus(status: IdeaStatus): boolean {
  return WEEKLY_PLAN_STATUSES.includes(status)
}

export function isContentIdea(value: unknown): value is ContentIdea {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<Record<keyof ContentIdea, unknown>>
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.angle === "string" &&
    typeof candidate.source === "string" &&
    isContentTheme(candidate.theme) &&
    isContentFormat(candidate.format) &&
    isRating(candidate.audienceFit) &&
    isRating(candidate.proofStrength) &&
    isRating(candidate.effort) &&
    isIdeaStatus(candidate.status) &&
    typeof candidate.createdAt === "string"
  )
}

export function parseStoredIdeas(stored: string | null, fallback: ContentIdea[]): ContentIdea[] {
  if (!stored) return fallback

  try {
    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) && parsed.every(isContentIdea) ? parsed : fallback
  } catch {
    return fallback
  }
}

export function countWeeklySelection(ideas: ContentIdea[]): number {
  return ideas.filter((idea) => isWeeklyPlanStatus(idea.status)).length
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
    .filter((idea) => isWeeklyPlanStatus(idea.status))
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
