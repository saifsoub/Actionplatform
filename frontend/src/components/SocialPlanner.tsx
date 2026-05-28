import { type CSSProperties, type FormEvent, useEffect, useMemo, useState } from "react"

import {
  buildWeeklySlate,
  type ContentFormat,
  type ContentIdea,
  type ContentTheme,
  type IdeaStatus,
  rankIdeasForPlanning,
  scoreIdea,
} from "./socialPlannerWorkflow"

const STORAGE_KEY = "social-planner-workflow-v1"
const MAX_WEEKLY_SELECTION = 5

type DraftIdea = Omit<ContentIdea, "id" | "createdAt" | "status">

const THEME_OPTIONS: { value: ContentTheme; label: string }[] = [
  { value: "positioning", label: "Positioning" },
  { value: "story", label: "Founder story" },
  { value: "proof", label: "Proof" },
  { value: "offer", label: "Offer" },
  { value: "community", label: "Community" },
]

const FORMAT_OPTIONS: { value: ContentFormat; label: string }[] = [
  { value: "text", label: "Text post" },
  { value: "carousel", label: "Carousel" },
  { value: "poll", label: "Poll" },
  { value: "video", label: "Short video" },
  { value: "newsletter", label: "Newsletter" },
]

const STATUS_LABELS: Record<IdeaStatus, string> = {
  intake: "Intake",
  prioritized: "Prioritized",
  selected: "Selected",
  drafting: "Drafting",
  published: "Published",
  archived: "Archived",
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

const EMPTY_DRAFT: DraftIdea = {
  title: "",
  angle: "",
  source: "",
  theme: "positioning",
  format: "text",
  audienceFit: 3,
  proofStrength: 3,
  effort: 3,
}

const SEED_IDEAS: ContentIdea[] = [
  {
    id: "seed-positioning",
    title: "The hidden cost of vague positioning",
    angle: "Show how unclear category language slows trust and sales calls.",
    source: "Customer call",
    theme: "positioning",
    format: "text",
    audienceFit: 5,
    proofStrength: 4,
    effort: 2,
    status: "selected",
    createdAt: "2026-05-20T09:00:00.000Z",
  },
  {
    id: "seed-story",
    title: "A small failure that changed the operating cadence",
    angle: "Tell a specific lesson from a missed launch and the review ritual it created.",
    source: "Founder journal",
    theme: "story",
    format: "carousel",
    audienceFit: 4,
    proofStrength: 4,
    effort: 3,
    status: "prioritized",
    createdAt: "2026-05-21T09:00:00.000Z",
  },
  {
    id: "seed-proof",
    title: "Before and after: onboarding response quality",
    angle: "Turn a customer result into a concise proof post with one screenshot or quote.",
    source: "Support thread",
    theme: "proof",
    format: "text",
    audienceFit: 5,
    proofStrength: 5,
    effort: 2,
    status: "selected",
    createdAt: "2026-05-22T09:00:00.000Z",
  },
  {
    id: "seed-community",
    title: "Ask operators how they plan content when the week explodes",
    angle: "Use a poll to surface real constraints and collect future idea inputs.",
    source: "Audience question",
    theme: "community",
    format: "poll",
    audienceFit: 4,
    proofStrength: 3,
    effort: 1,
    status: "intake",
    createdAt: "2026-05-23T09:00:00.000Z",
  },
]

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `idea-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function isContentIdea(value: unknown): value is ContentIdea {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<Record<keyof ContentIdea, unknown>>
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.angle === "string" &&
    typeof candidate.source === "string" &&
    typeof candidate.theme === "string" &&
    typeof candidate.format === "string" &&
    typeof candidate.audienceFit === "number" &&
    typeof candidate.proofStrength === "number" &&
    typeof candidate.effort === "number" &&
    typeof candidate.status === "string" &&
    typeof candidate.createdAt === "string"
  )
}

function loadIdeas(): ContentIdea[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return SEED_IDEAS

  try {
    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) && parsed.every(isContentIdea) ? parsed : SEED_IDEAS
  } catch {
    return SEED_IDEAS
  }
}

function labelFor<T extends string>(options: { value: T; label: string }[], value: T): string {
  return options.find((option) => option.value === value)?.label ?? value
}

export default function SocialPlanner() {
  const [ideas, setIdeas] = useState<ContentIdea[]>(loadIdeas)
  const [draft, setDraft] = useState<DraftIdea>(EMPTY_DRAFT)
  const selectedCount = ideas.filter((idea) => idea.status === "selected").length
  const rankedIdeas = useMemo(
    () => rankIdeasForPlanning(ideas).filter((idea) => !["published", "archived"].includes(idea.status)),
    [ideas],
  )
  const weeklySlate = useMemo(() => buildWeeklySlate(ideas), [ideas])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas))
  }, [ideas])

  function updateStatus(id: string, status: IdeaStatus) {
    setIdeas((current) => current.map((idea) => (idea.id === id ? { ...idea, status } : idea)))
  }

  function resetWeek() {
    setIdeas((current) =>
      current.map((idea) => {
        if (idea.status === "published") return idea
        if (idea.status === "selected" || idea.status === "drafting") {
          return { ...idea, status: "prioritized" }
        }
        return idea
      }),
    )
  }

  function addIdea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.title.trim()) return

    setIdeas((current) => [
      {
        ...draft,
        id: createId(),
        title: draft.title.trim(),
        angle: draft.angle.trim(),
        source: draft.source.trim() || "Manual intake",
        status: "intake",
        createdAt: new Date().toISOString(),
      },
      ...current,
    ])
    setDraft(EMPTY_DRAFT)
  }

  const metrics = [
    { label: "Ideas in intake", value: ideas.filter((idea) => idea.status === "intake").length },
    { label: "Ranked backlog", value: ideas.filter((idea) => idea.status === "prioritized").length },
    { label: "Selected this week", value: selectedCount },
    { label: "Published", value: ideas.filter((idea) => idea.status === "published").length },
  ]

  return (
    <div style={S.page}>
      <section style={S.hero}>
        <div>
          <div style={S.eyebrow}>LinkedIn growth engine</div>
          <h1 style={S.title}>Weekly social media planner</h1>
          <p style={S.subtitle}>
            Capture raw post ideas, rank them by likely impact, pick the week&apos;s strongest five,
            and move each one from selection to draft to published.
          </p>
        </div>
        <button type="button" onClick={resetWeek} style={S.secondaryButton}>
          Start next weekly cycle
        </button>
      </section>

      <section style={S.metricGrid}>
        {metrics.map((metric) => (
          <div key={metric.label} style={S.metricCard}>
            <div style={S.metricValue}>{metric.value}</div>
            <div style={S.metricLabel}>{metric.label}</div>
          </div>
        ))}
      </section>

      <section style={S.workflowGrid}>
        {[
          ["1", "Idea intake", "Drop in voice notes, customer questions, proofs, and founder stories."],
          ["2", "Prioritization", "Score audience fit and proof strength against the effort needed to ship."],
          ["3", "Weekly planning", "Select up to five posts for Monday through Friday."],
          ["4", "Content selection", "Move chosen ideas into drafting, then publish and review the week."],
        ].map(([step, title, body]) => (
          <div key={step} style={S.workflowCard}>
            <div style={S.step}>{step}</div>
            <div style={S.workflowTitle}>{title}</div>
            <div style={S.workflowBody}>{body}</div>
          </div>
        ))}
      </section>

      <div style={S.mainGrid}>
        <form onSubmit={addIdea} style={S.card}>
          <h2 style={S.sectionTitle}>Idea intake</h2>
          <label style={S.label}>
            Working title
            <input
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              placeholder="What should this post be about?"
              style={S.input}
            />
          </label>
          <label style={S.label}>
            Angle
            <textarea
              value={draft.angle}
              onChange={(event) => setDraft({ ...draft, angle: event.target.value })}
              placeholder="The contrarian take, story beat, proof point, or question."
              style={{ ...S.input, minHeight: 88, resize: "vertical" }}
            />
          </label>
          <label style={S.label}>
            Source
            <input
              value={draft.source}
              onChange={(event) => setDraft({ ...draft, source: event.target.value })}
              placeholder="Call, comment, metric, note, or customer story"
              style={S.input}
            />
          </label>
          <div style={S.twoColumns}>
            <SelectField
              label="Theme"
              value={draft.theme}
              options={THEME_OPTIONS}
              onChange={(theme) => setDraft({ ...draft, theme })}
            />
            <SelectField
              label="Format"
              value={draft.format}
              options={FORMAT_OPTIONS}
              onChange={(format) => setDraft({ ...draft, format })}
            />
          </div>
          <SliderField
            label="Audience fit"
            value={draft.audienceFit}
            onChange={(audienceFit) => setDraft({ ...draft, audienceFit })}
          />
          <SliderField
            label="Proof strength"
            value={draft.proofStrength}
            onChange={(proofStrength) => setDraft({ ...draft, proofStrength })}
          />
          <SliderField
            label="Effort"
            value={draft.effort}
            onChange={(effort) => setDraft({ ...draft, effort })}
          />
          <button type="submit" style={S.primaryButton}>
            Add to intake
          </button>
        </form>

        <section style={S.card}>
          <h2 style={S.sectionTitle}>Weekly slate</h2>
          <div style={S.slateGrid}>
            {WEEKDAYS.map((day) => {
              const item = weeklySlate.find((slateItem) => slateItem.day === day)
              return (
                <div key={day} style={S.slateCard}>
                  <div style={S.slateDay}>{day}</div>
                  {item ? (
                    <>
                      <div style={S.slateTitle}>{item.title}</div>
                      <div style={S.slateMeta}>
                        {labelFor(THEME_OPTIONS, item.theme)} · {labelFor(FORMAT_OPTIONS, item.format)}
                      </div>
                      <div style={S.scorePill}>Score {item.score}</div>
                    </>
                  ) : (
                    <div style={S.emptySlot}>No selected idea yet</div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <section style={S.card}>
        <div style={S.queueHeader}>
          <div>
            <h2 style={S.sectionTitle}>Prioritized idea queue</h2>
            <p style={S.muted}>Selected and prioritized ideas rise to the top. Intake stays visible below them.</p>
          </div>
          <div style={S.capacity}>{selectedCount}/{MAX_WEEKLY_SELECTION} selected</div>
        </div>
        <div style={S.ideaList}>
          {rankedIdeas.map((idea) => (
            <article key={idea.id} style={S.ideaCard}>
              <div style={S.ideaTopLine}>
                <span style={S.statusPill}>{STATUS_LABELS[idea.status]}</span>
                <span style={S.scorePill}>Score {scoreIdea(idea)}</span>
              </div>
              <h3 style={S.ideaTitle}>{idea.title}</h3>
              <p style={S.ideaAngle}>{idea.angle || "No angle written yet."}</p>
              <div style={S.ideaMeta}>
                {labelFor(THEME_OPTIONS, idea.theme)} · {labelFor(FORMAT_OPTIONS, idea.format)} · {idea.source}
              </div>
              <div style={S.ideaActions}>
                {idea.status === "intake" && (
                  <button type="button" onClick={() => updateStatus(idea.id, "prioritized")} style={S.smallButton}>
                    Prioritize
                  </button>
                )}
                {idea.status !== "selected" && idea.status !== "drafting" && (
                  <button
                    type="button"
                    disabled={selectedCount >= MAX_WEEKLY_SELECTION}
                    onClick={() => updateStatus(idea.id, "selected")}
                    style={selectedCount >= MAX_WEEKLY_SELECTION ? S.disabledButton : S.smallButton}
                  >
                    Select for week
                  </button>
                )}
                {idea.status === "selected" && (
                  <button type="button" onClick={() => updateStatus(idea.id, "drafting")} style={S.smallButton}>
                    Move to drafting
                  </button>
                )}
                {idea.status === "drafting" && (
                  <button type="button" onClick={() => updateStatus(idea.id, "published")} style={S.smallButton}>
                    Mark published
                  </button>
                )}
                {(idea.status === "selected" || idea.status === "drafting") && (
                  <button type="button" onClick={() => updateStatus(idea.id, "prioritized")} style={S.ghostButton}>
                    Return to backlog
                  </button>
                )}
                <button type="button" onClick={() => updateStatus(idea.id, "archived")} style={S.ghostButton}>
                  Archive
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <label style={S.label}>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value as T)} style={S.input}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function SliderField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label style={S.label}>
      <span style={S.sliderLabel}>
        {label}
        <span>{value}/5</span>
      </span>
      <input
        type="range"
        min={1}
        max={5}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={S.slider}
      />
    </label>
  )
}

const S: Record<string, CSSProperties> = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
    maxWidth: 1180,
    margin: "0 auto",
    fontFamily: "system-ui, sans-serif",
    color: "#E8EAF0",
  },
  hero: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "flex-start",
    padding: 24,
    borderRadius: 18,
    background: "linear-gradient(135deg, rgba(0,212,255,.12), rgba(201,111,255,.08))",
    border: "1px solid rgba(0,212,255,.22)",
  },
  eyebrow: { color: "#00D4FF", fontSize: 11, fontWeight: 800, letterSpacing: "1.4px", textTransform: "uppercase" },
  title: { margin: "6px 0 8px", color: "white", fontSize: 32, lineHeight: 1.1 },
  subtitle: { margin: 0, color: "#A7ADBE", fontSize: 15, lineHeight: 1.6, maxWidth: 720 },
  metricGrid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 },
  metricCard: { background: "#0A0D18", border: "1px solid #1A2138", borderRadius: 14, padding: 18 },
  metricValue: { color: "white", fontSize: 28, fontWeight: 800 },
  metricLabel: { color: "#727A90", fontSize: 12, marginTop: 4 },
  workflowGrid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 },
  workflowCard: { background: "#080A14", border: "1px solid #1A1E32", borderRadius: 14, padding: 16 },
  step: { color: "#00D4FF", fontSize: 12, fontWeight: 800, marginBottom: 10 },
  workflowTitle: { color: "white", fontSize: 14, fontWeight: 750, marginBottom: 8 },
  workflowBody: { color: "#848CA0", fontSize: 12, lineHeight: 1.5 },
  mainGrid: { display: "grid", gridTemplateColumns: "minmax(320px, 420px) 1fr", gap: 18, alignItems: "start" },
  card: { background: "#0A0D18", border: "1px solid #1A2138", borderRadius: 16, padding: 20 },
  sectionTitle: { color: "white", fontSize: 18, margin: "0 0 12px", fontWeight: 800 },
  label: { display: "flex", flexDirection: "column", gap: 7, color: "#8B93A8", fontSize: 11, fontWeight: 750, marginBottom: 14 },
  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "#070A13",
    border: "1px solid #20283E",
    borderRadius: 10,
    color: "#E8EAF0",
    padding: "10px 12px",
    outline: "none",
    fontFamily: "inherit",
    fontSize: 13,
  },
  twoColumns: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  sliderLabel: { display: "flex", justifyContent: "space-between", color: "#A7ADBE" },
  slider: { accentColor: "#00D4FF" },
  primaryButton: {
    width: "100%",
    border: "none",
    borderRadius: 10,
    padding: "12px 16px",
    color: "#041016",
    background: "linear-gradient(135deg,#00D4FF,#C96FFF)",
    fontWeight: 800,
    cursor: "pointer",
  },
  secondaryButton: {
    border: "1px solid rgba(0,212,255,.35)",
    borderRadius: 10,
    padding: "10px 14px",
    color: "#00D4FF",
    background: "rgba(0,212,255,.08)",
    fontWeight: 750,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  slateGrid: { display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 10 },
  slateCard: { minHeight: 124, background: "#070A13", border: "1px solid #20283E", borderRadius: 12, padding: 12 },
  slateDay: { color: "#00D4FF", fontSize: 11, fontWeight: 800, marginBottom: 10 },
  slateTitle: { color: "white", fontSize: 13, fontWeight: 750, lineHeight: 1.4 },
  slateMeta: { color: "#737B90", fontSize: 11, lineHeight: 1.5, marginTop: 8 },
  emptySlot: { color: "#4D5568", fontSize: 12, lineHeight: 1.5 },
  queueHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 },
  muted: { margin: 0, color: "#788196", fontSize: 13 },
  capacity: { color: "#00D4FF", fontSize: 12, fontWeight: 800, whiteSpace: "nowrap" },
  ideaList: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginTop: 16 },
  ideaCard: { background: "#070A13", border: "1px solid #20283E", borderRadius: 14, padding: 16 },
  ideaTopLine: { display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 10 },
  statusPill: { color: "#C96FFF", background: "rgba(201,111,255,.1)", borderRadius: 999, padding: "4px 9px", fontSize: 10, fontWeight: 800 },
  scorePill: { color: "#00FF9C", background: "rgba(0,255,156,.08)", borderRadius: 999, padding: "4px 9px", fontSize: 10, fontWeight: 800 },
  ideaTitle: { color: "white", margin: "0 0 8px", fontSize: 15 },
  ideaAngle: { color: "#A7ADBE", fontSize: 13, lineHeight: 1.5, margin: "0 0 10px" },
  ideaMeta: { color: "#697187", fontSize: 11, marginBottom: 12 },
  ideaActions: { display: "flex", gap: 8, flexWrap: "wrap" },
  smallButton: { border: "none", borderRadius: 8, padding: "8px 10px", background: "#00D4FF", color: "#061018", fontSize: 11, fontWeight: 800, cursor: "pointer" },
  ghostButton: { border: "1px solid #29324C", borderRadius: 8, padding: "8px 10px", background: "transparent", color: "#9BA4B8", fontSize: 11, cursor: "pointer" },
  disabledButton: { border: "1px solid #29324C", borderRadius: 8, padding: "8px 10px", background: "#111827", color: "#4B5563", fontSize: 11, cursor: "not-allowed" },
}
