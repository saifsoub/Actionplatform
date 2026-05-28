import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

interface EngagementPost {
  id: string
  title: string
  linkedin_url: string
  published_at: string
  monitor_until: string | null
  check_interval_hours: number
  status: "monitoring" | "paused" | "completed"
  next_check_at: string | null
  last_checked_at: string | null
  notes: string | null
}

interface FollowUpOpportunity {
  id: string
  post_id: string
  source: string
  contact_name: string | null
  profile_url: string | null
  prompt: string
  priority: "low" | "medium" | "high"
  status: "open" | "done" | "dismissed"
  outcome_note: string | null
  created_at: string | null
}

interface EngagementWorkflow {
  totals: {
    monitored_posts: number
    posts_to_check: number
    open_follow_ups: number
  }
  posts_to_check: EngagementPost[]
  open_follow_ups: FollowUpOpportunity[]
}

interface EngagementPostsResponse {
  data: EngagementPost[]
  count: number
}

interface PostForm {
  title: string
  linkedin_url: string
  published_at: string
  monitor_until: string
  check_interval_hours: string
  notes: string
}

interface CheckForm {
  post_id: string
  comments_count: string
  reactions_count: string
  reposts_count: string
  impressions_count: string
  notes: string
  contact_name: string
  profile_url: string
  prompt: string
  priority: "low" | "medium" | "high"
}

const EMPTY_WORKFLOW: EngagementWorkflow = {
  totals: { monitored_posts: 0, posts_to_check: 0, open_follow_ups: 0 },
  posts_to_check: [],
  open_follow_ups: [],
}

function apiUrl() {
  return import.meta.env.VITE_API_URL ?? ""
}

function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    "Content-Type": "application/json",
  }
}

function toLocalInputValue(date: Date) {
  return date.toISOString().slice(0, 16)
}

function parseCount(value: string) {
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? 0 : parsed
}

function defaultPostForm(): PostForm {
  const now = new Date()
  const monitorUntil = new Date(now.getTime() + 72 * 60 * 60 * 1000)
  return {
    title: "",
    linkedin_url: "",
    published_at: toLocalInputValue(now),
    monitor_until: toLocalInputValue(monitorUntil),
    check_interval_hours: "12",
    notes: "",
  }
}

function defaultCheckForm(postId = ""): CheckForm {
  return {
    post_id: postId,
    comments_count: "0",
    reactions_count: "0",
    reposts_count: "0",
    impressions_count: "0",
    notes: "",
    contact_name: "",
    profile_url: "",
    prompt: "",
    priority: "medium",
  }
}

function formatDate(value: string | null) {
  if (!value) return "Not scheduled"
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function priorityColor(priority: FollowUpOpportunity["priority"]) {
  if (priority === "high") return "#FF5A6A"
  if (priority === "medium") return "#FFD166"
  return "#00FF9C"
}

function isPriority(value: string): value is CheckForm["priority"] {
  return value === "low" || value === "medium" || value === "high"
}

export default function Engagement() {
  const [posts, setPosts] = useState<EngagementPost[]>([])
  const [workflow, setWorkflow] = useState<EngagementWorkflow>(EMPTY_WORKFLOW)
  const [postForm, setPostForm] = useState<PostForm>(defaultPostForm)
  const [checkForm, setCheckForm] = useState<CheckForm>(defaultCheckForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedPost = useMemo(
    () => posts.find((post) => post.id === checkForm.post_id),
    [posts, checkForm.post_id],
  )

  const loadEngagement = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [postsResponse, workflowResponse] = await Promise.all([
        fetch(`${apiUrl()}/api/v1/engagement/posts/`, {
          headers: authHeaders(),
        }),
        fetch(`${apiUrl()}/api/v1/engagement/workflow`, {
          headers: authHeaders(),
        }),
      ])

      if (!postsResponse.ok || !workflowResponse.ok) {
        setError("Could not load engagement workflow.")
        return
      }

      const postsBody: EngagementPostsResponse = await postsResponse.json()
      const workflowBody: EngagementWorkflow = await workflowResponse.json()
      setPosts(postsBody.data ?? [])
      setWorkflow(workflowBody)
      setCheckForm((current) => {
        if (current.post_id || postsBody.data.length === 0) return current
        return { ...current, post_id: postsBody.data[0].id }
      })
    } catch {
      setError("Could not reach the server. Check your connection.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadEngagement()
  }, [loadEngagement])

  async function createPost() {
    if (!postForm.title.trim() || !postForm.linkedin_url.trim()) {
      setError("Add a title and LinkedIn URL before tracking a post.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      const response = await fetch(`${apiUrl()}/api/v1/engagement/posts/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          title: postForm.title,
          linkedin_url: postForm.linkedin_url,
          published_at: new Date(postForm.published_at).toISOString(),
          monitor_until: postForm.monitor_until
            ? new Date(postForm.monitor_until).toISOString()
            : null,
          check_interval_hours: parseCount(postForm.check_interval_hours) || 12,
          notes: postForm.notes || null,
        }),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        setError(body?.detail ?? `Failed to save post (${response.status}).`)
        return
      }
      setPostForm(defaultPostForm())
      await loadEngagement()
    } catch {
      setError("Could not reach the server. Check your connection.")
    } finally {
      setSaving(false)
    }
  }

  async function recordCheck() {
    if (!checkForm.post_id) {
      setError("Choose a post before logging engagement.")
      return
    }
    setSaving(true)
    setError(null)
    const followUps = checkForm.prompt.trim()
      ? [
          {
            source: "comment",
            contact_name: checkForm.contact_name || null,
            profile_url: checkForm.profile_url || null,
            prompt: checkForm.prompt,
            priority: checkForm.priority,
          },
        ]
      : []
    try {
      const response = await fetch(
        `${apiUrl()}/api/v1/engagement/posts/${checkForm.post_id}/checks`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            comments_count: parseCount(checkForm.comments_count),
            reactions_count: parseCount(checkForm.reactions_count),
            reposts_count: parseCount(checkForm.reposts_count),
            impressions_count: parseCount(checkForm.impressions_count),
            notes: checkForm.notes || null,
            follow_up_opportunities: followUps,
          }),
        },
      )
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        setError(body?.detail ?? `Failed to record check (${response.status}).`)
        return
      }
      setCheckForm(defaultCheckForm(checkForm.post_id))
      await loadEngagement()
    } catch {
      setError("Could not reach the server. Check your connection.")
    } finally {
      setSaving(false)
    }
  }

  async function closeFollowUp(
    followUp: FollowUpOpportunity,
    status: "done" | "dismissed",
  ) {
    setSaving(true)
    setError(null)
    try {
      const response = await fetch(
        `${apiUrl()}/api/v1/engagement/follow-ups/${followUp.id}`,
        {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ status }),
        },
      )
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        setError(
          body?.detail ?? `Failed to update follow-up (${response.status}).`,
        )
        return
      }
      await loadEngagement()
    } catch {
      setError("Could not reach the server. Check your connection.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        padding: "24px 32px",
        maxWidth: "1120px",
        margin: "0 auto",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "20px",
          alignItems: "flex-start",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              color: "white",
              fontSize: "28px",
              fontWeight: "800",
              margin: "0 0 6px",
            }}
          >
            Engagement Monitor
          </h1>
          <p
            style={{
              color: "#888",
              fontSize: "14px",
              margin: 0,
              maxWidth: "680px",
              lineHeight: 1.6,
            }}
          >
            Track comments, reactions, and follow-up opportunities after
            LinkedIn posts go live.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadEngagement()}
          style={{
            border: "1px solid #1a1a3a",
            background: "#0a0a1a",
            color: "#ccc",
            borderRadius: "10px",
            padding: "10px 14px",
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "#3a1018",
            color: "#FF9AA8",
            border: "1px solid #FF5A6A55",
            borderRadius: "12px",
            padding: "12px 14px",
            marginBottom: "18px",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
          marginBottom: "22px",
        }}
      >
        <MetricCard
          label="Monitored posts"
          value={workflow.totals.monitored_posts}
          color="#00D4FF"
        />
        <MetricCard
          label="Posts to check"
          value={workflow.totals.posts_to_check}
          color="#FFD166"
        />
        <MetricCard
          label="Open follow-ups"
          value={workflow.totals.open_follow_ups}
          color="#00FF9C"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "18px",
          alignItems: "start",
        }}
      >
        <section style={panelStyle}>
          <h2 style={sectionTitleStyle}>Track a new post</h2>
          <Field label="Title">
            <input
              value={postForm.title}
              onChange={(event) =>
                setPostForm({ ...postForm, title: event.target.value })
              }
              placeholder="What did you post?"
              style={inputStyle}
            />
          </Field>
          <Field label="LinkedIn URL">
            <input
              value={postForm.linkedin_url}
              onChange={(event) =>
                setPostForm({ ...postForm, linkedin_url: event.target.value })
              }
              placeholder="https://www.linkedin.com/posts/..."
              style={inputStyle}
            />
          </Field>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <Field label="Published">
              <input
                type="datetime-local"
                value={postForm.published_at}
                onChange={(event) =>
                  setPostForm({ ...postForm, published_at: event.target.value })
                }
                style={inputStyle}
              />
            </Field>
            <Field label="Monitor until">
              <input
                type="datetime-local"
                value={postForm.monitor_until}
                onChange={(event) =>
                  setPostForm({
                    ...postForm,
                    monitor_until: event.target.value,
                  })
                }
                style={inputStyle}
              />
            </Field>
          </div>
          <Field label="Check every N hours">
            <input
              value={postForm.check_interval_hours}
              onChange={(event) =>
                setPostForm({
                  ...postForm,
                  check_interval_hours: event.target.value,
                })
              }
              style={inputStyle}
            />
          </Field>
          <Field label="Notes">
            <textarea
              value={postForm.notes}
              onChange={(event) =>
                setPostForm({ ...postForm, notes: event.target.value })
              }
              placeholder="Audience, goal, or comments to watch for."
              style={{ ...inputStyle, minHeight: "76px", resize: "vertical" }}
            />
          </Field>
          <button
            type="button"
            disabled={saving}
            onClick={() => void createPost()}
            style={primaryButtonStyle}
          >
            Save post
          </button>
        </section>

        <section style={panelStyle}>
          <h2 style={sectionTitleStyle}>Log an engagement check</h2>
          <Field label="Post">
            <select
              value={checkForm.post_id}
              onChange={(event) =>
                setCheckForm({ ...checkForm, post_id: event.target.value })
              }
              style={inputStyle}
            >
              <option value="">Choose a post</option>
              {posts.map((post) => (
                <option key={post.id} value={post.id}>
                  {post.title}
                </option>
              ))}
            </select>
          </Field>
          {selectedPost && (
            <div
              style={{ color: "#777", fontSize: "12px", marginBottom: "12px" }}
            >
              Next check: {formatDate(selectedPost.next_check_at)}
            </div>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <Field label="Comments">
              <input
                value={checkForm.comments_count}
                onChange={(event) =>
                  setCheckForm({
                    ...checkForm,
                    comments_count: event.target.value,
                  })
                }
                style={inputStyle}
              />
            </Field>
            <Field label="Reactions">
              <input
                value={checkForm.reactions_count}
                onChange={(event) =>
                  setCheckForm({
                    ...checkForm,
                    reactions_count: event.target.value,
                  })
                }
                style={inputStyle}
              />
            </Field>
            <Field label="Reposts">
              <input
                value={checkForm.reposts_count}
                onChange={(event) =>
                  setCheckForm({
                    ...checkForm,
                    reposts_count: event.target.value,
                  })
                }
                style={inputStyle}
              />
            </Field>
            <Field label="Impressions">
              <input
                value={checkForm.impressions_count}
                onChange={(event) =>
                  setCheckForm({
                    ...checkForm,
                    impressions_count: event.target.value,
                  })
                }
                style={inputStyle}
              />
            </Field>
          </div>
          <Field label="Check notes">
            <textarea
              value={checkForm.notes}
              onChange={(event) =>
                setCheckForm({ ...checkForm, notes: event.target.value })
              }
              style={{ ...inputStyle, minHeight: "70px", resize: "vertical" }}
            />
          </Field>
          <div
            style={{
              borderTop: "1px solid #1a1a3a",
              paddingTop: "14px",
              marginTop: "14px",
            }}
          >
            <div
              style={{
                color: "#aaa",
                fontWeight: 700,
                fontSize: "12px",
                marginBottom: "10px",
              }}
            >
              Optional follow-up
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <Field label="Contact">
                <input
                  value={checkForm.contact_name}
                  onChange={(event) =>
                    setCheckForm({
                      ...checkForm,
                      contact_name: event.target.value,
                    })
                  }
                  style={inputStyle}
                />
              </Field>
              <Field label="Priority">
                <select
                  value={checkForm.priority}
                  onChange={(event) => {
                    const value = event.target.value
                    setCheckForm({
                      ...checkForm,
                      priority: isPriority(value) ? value : "medium",
                    })
                  }}
                  style={inputStyle}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </Field>
            </div>
            <Field label="Profile URL">
              <input
                value={checkForm.profile_url}
                onChange={(event) =>
                  setCheckForm({
                    ...checkForm,
                    profile_url: event.target.value,
                  })
                }
                style={inputStyle}
              />
            </Field>
            <Field label="Prompt">
              <textarea
                value={checkForm.prompt}
                onChange={(event) =>
                  setCheckForm({ ...checkForm, prompt: event.target.value })
                }
                placeholder="What should you reply with or send next?"
                style={{ ...inputStyle, minHeight: "70px", resize: "vertical" }}
              />
            </Field>
          </div>
          <button
            type="button"
            disabled={saving || posts.length === 0}
            onClick={() => void recordCheck()}
            style={primaryButtonStyle}
          >
            Record check
          </button>
        </section>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "18px",
          marginTop: "18px",
        }}
      >
        <section style={panelStyle}>
          <h2 style={sectionTitleStyle}>Due checks</h2>
          {loading && <EmptyState text="Loading posts..." />}
          {!loading && workflow.posts_to_check.length === 0 && (
            <EmptyState text="No posts need a check right now." />
          )}
          {workflow.posts_to_check.map((post) => (
            <article key={post.id} style={rowStyle}>
              <div>
                <div style={{ color: "white", fontWeight: 700 }}>
                  {post.title}
                </div>
                <a
                  href={post.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#00D4FF", fontSize: "12px" }}
                >
                  Open on LinkedIn
                </a>
              </div>
              <div style={{ color: "#777", fontSize: "12px" }}>
                Due {formatDate(post.next_check_at)}
              </div>
            </article>
          ))}
        </section>

        <section style={panelStyle}>
          <h2 style={sectionTitleStyle}>Open follow-ups</h2>
          {!loading && workflow.open_follow_ups.length === 0 && (
            <EmptyState text="No open follow-ups yet." />
          )}
          {workflow.open_follow_ups.map((followUp) => (
            <article key={followUp.id} style={rowStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginBottom: "8px",
                }}
              >
                <div style={{ color: "white", fontWeight: 700 }}>
                  {followUp.contact_name || "LinkedIn contact"}
                </div>
                <span
                  style={{
                    color: priorityColor(followUp.priority),
                    fontSize: "11px",
                    fontWeight: 800,
                  }}
                >
                  {followUp.priority.toUpperCase()}
                </span>
              </div>
              <div
                style={{
                  color: "#bbb",
                  fontSize: "13px",
                  lineHeight: 1.5,
                  marginBottom: "10px",
                }}
              >
                {followUp.prompt}
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {followUp.profile_url && (
                  <a
                    href={followUp.profile_url}
                    target="_blank"
                    rel="noreferrer"
                    style={secondaryButtonStyle}
                  >
                    Profile
                  </a>
                )}
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void closeFollowUp(followUp, "done")}
                  style={secondaryButtonStyle}
                >
                  Mark done
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void closeFollowUp(followUp, "dismissed")}
                  style={secondaryButtonStyle}
                >
                  Dismiss
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div style={{ ...panelStyle, borderColor: `${color}33` }}>
      <div
        style={{
          color: "#777",
          fontSize: "11px",
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{ color, fontSize: "30px", fontWeight: 900, marginTop: "6px" }}
      >
        {value}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      style={{
        display: "block",
        color: "#aaa",
        fontSize: "12px",
        fontWeight: 700,
        marginBottom: "10px",
      }}
    >
      <span style={{ display: "block", marginBottom: "6px" }}>{label}</span>
      {children}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div
      style={{
        color: "#666",
        padding: "28px 0",
        textAlign: "center",
        fontSize: "13px",
      }}
    >
      {text}
    </div>
  )
}

const panelStyle = {
  background: "#0a0a1a",
  border: "1px solid #1a1a2e",
  borderRadius: "16px",
  padding: "18px",
} satisfies CSSProperties

const sectionTitleStyle = {
  color: "white",
  fontSize: "16px",
  fontWeight: 800,
  margin: "0 0 16px",
} satisfies CSSProperties

const inputStyle = {
  width: "100%",
  background: "#070714",
  border: "1px solid #1a1a3a",
  borderRadius: "10px",
  color: "white",
  padding: "10px 12px",
  outline: "none",
  boxSizing: "border-box",
} satisfies CSSProperties

const primaryButtonStyle = {
  width: "100%",
  background: "linear-gradient(135deg, #00D4FF, #7C3AED)",
  border: "none",
  borderRadius: "10px",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
  padding: "12px 14px",
} satisfies CSSProperties

const secondaryButtonStyle = {
  background: "#0d0d1f",
  border: "1px solid #1a1a3a",
  borderRadius: "999px",
  color: "#ddd",
  cursor: "pointer",
  fontSize: "12px",
  padding: "7px 12px",
  textDecoration: "none",
} satisfies CSSProperties

const rowStyle = {
  background: "#070714",
  border: "1px solid #15152a",
  borderRadius: "12px",
  padding: "14px",
  marginBottom: "10px",
} satisfies CSSProperties
