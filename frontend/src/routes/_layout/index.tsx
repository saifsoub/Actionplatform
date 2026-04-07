import { createFileRoute, Link } from "@tanstack/react-router"
import { type CSSProperties, useEffect, useState } from "react"

import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
  head: () => ({
    meta: [{ title: "Command Center" }],
  }),
})

// ── Daily signal (mirrors Sage content, rotates by day) ─────────────────────
const DAILY_SIGNALS = [
  "The week ahead has more leverage than the week behind.",
  "Energy compounds — how you start Monday determines Thursday's output.",
  "Tuesday is peak cognitive performance day. Use it for your hardest work.",
  "Wednesday is the inflection point. Are you on track for your weekly goal?",
  "Thursday is when most deals close and decisions lock in. Move decisively.",
  "Friday insight unlocks Monday momentum. Reflect before you rush.",
  "Saturday belongs to clarity. Think in months, not hours.",
]

interface SessionRecord {
  id: string
  question: string
  synthesis: string
  outcome: string | null
  created_at: string
}

function UsageRing({ used, limit }: { used: number; limit: number }) {
  const pct = Math.min(used / limit, 1)
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct)
  const color = pct >= 1 ? "#FF5A6A" : pct >= 0.7 ? "#FFA500" : "#00D4FF"

  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#1a1a2e" strokeWidth="6" />
      <circle
        cx="36" cy="36" r={r} fill="none"
        stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text x="36" y="40" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">
        {used}/{limit}
      </text>
    </svg>
  )
}

const AGENTS = [
  { id: "atlas", emoji: "🌐", name: "Atlas", role: "Strategy", color: "#00D4FF" },
  { id: "nova", emoji: "✨", name: "Nova", role: "Vision", color: "#C96FFF" },
  { id: "reza", emoji: "⚡", name: "Reza", role: "Critique", color: "#FF5A6A" },
  { id: "kai", emoji: "🛠️", name: "Kai", role: "Execution", color: "#00FF9C" },
]

function Dashboard() {
  const { user: currentUser } = useAuth()
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null)
  const [onboardingDone, setOnboardingDone] = useState(true)
  const todaySignal = DAILY_SIGNALS[new Date().getDay()]

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) return

    const headers = { Authorization: `Bearer ${token}` }

    // Fetch recent sessions
    fetch("/api/v1/sessions/?limit=5", { headers })
      .then((r) => {
        if (!r.ok) throw new Error(`sessions ${r.status}`)
        return r.json()
      })
      .then((data) => setSessions(data.data ?? []))
      .catch((err) => console.warn("Failed to load sessions:", err))

    // Fetch real subscription usage
    fetch("/api/v1/council/subscription", { headers })
      .then((r) => {
        if (!r.ok) throw new Error(`subscription ${r.status}`)
        return r.json()
      })
      .then((data) => setUsage({ used: data.sessions_used, limit: data.sessions_limit }))
      .catch((err) => console.warn("Failed to load subscription:", err))

    // Fetch profile for onboarding state
    fetch("/api/v1/profile/", { headers })
      .then((r) => {
        if (!r.ok) throw new Error(`profile ${r.status}`)
        return r.json()
      })
      .then((data) => setOnboardingDone(data.onboarding_complete ?? false))
      .catch((err) => console.warn("Failed to load profile:", err))
  }, [])

  const firstName = currentUser?.full_name?.split(" ")[0] || currentUser?.email?.split("@")[0] || "there"

  return (
    <div style={{ padding: "24px 32px", maxWidth: "960px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* ── Onboarding Banner ── */}
      {!onboardingDone && (
        <Link to="/onboarding">
          <div style={{
            background: "linear-gradient(135deg, #1a0a2e 0%, #0d1b3e 100%)",
            border: "1px solid #C96FFF",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
          }}>
            <span style={{ fontSize: "24px" }}>🚀</span>
            <div>
              <div style={{ color: "#C96FFF", fontWeight: "700", fontSize: "14px" }}>Complete your profile (2 min)</div>
              <div style={{ color: "#888", fontSize: "13px" }}>Your agents will speak directly to your situation — not a generic one.</div>
            </div>
            <div style={{ marginLeft: "auto", color: "#C96FFF", fontSize: "20px" }}>→</div>
          </div>
        </Link>
      )}

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "white", margin: 0 }}>
            Good {getTimeOfDay()}, {firstName} 👋
          </h1>
          <p style={{ color: "#888", marginTop: "6px", fontSize: "14px" }}>
            Today is {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* ── Top row: Sage signal + Usage ring ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "20px", marginBottom: "24px" }}>
        {/* Sage signal */}
        <Link to="/sage">
          <div style={{
            background: "linear-gradient(135deg, #0a1628 0%, #12203d 100%)",
            border: "1px solid #00D4FF33",
            borderRadius: "16px",
            padding: "20px 24px",
            cursor: "pointer",
            transition: "border-color 0.2s",
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "#00D4FF")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "#00D4FF33")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <span style={{ fontSize: "18px" }}>📖</span>
              <span style={{ color: "#00D4FF", fontWeight: "700", fontSize: "12px", letterSpacing: "1px" }}>SAGE · TODAY'S SIGNAL</span>
            </div>
            <p style={{ color: "white", fontSize: "15px", lineHeight: "1.6", margin: 0 }}>
              "{todaySignal}"
            </p>
            <div style={{ marginTop: "12px", color: "#00D4FF", fontSize: "12px" }}>Open daily briefing →</div>
          </div>
        </Link>

        {/* Usage ring */}
        {usage && (
          <div style={{
            background: "#0a0a1a",
            border: "1px solid #1a1a3a",
            borderRadius: "16px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            minWidth: "120px",
          }}>
            <UsageRing used={usage.used} limit={usage.limit} />
            <div style={{ color: "#888", fontSize: "11px", textAlign: "center" }}>sessions<br />used</div>
            <Link to="/pricing">
              <span style={{ color: "#00D4FF", fontSize: "11px" }}>Upgrade →</span>
            </Link>
          </div>
        )}
      </div>

      {/* ── Quick actions ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "28px" }}>
        <Link to="/council">
          <div style={quickActionStyle("#00D4FF")}>
            <span style={{ fontSize: "22px" }}>⚖️</span>
            <div>
              <div style={{ color: "white", fontWeight: "700", fontSize: "14px" }}>Ask the Council</div>
              <div style={{ color: "#888", fontSize: "12px" }}>4 advisors, 1 question</div>
            </div>
          </div>
        </Link>
        <Link to="/sage">
          <div style={quickActionStyle("#C96FFF")}>
            <span style={{ fontSize: "22px" }}>📖</span>
            <div>
              <div style={{ color: "white", fontWeight: "700", fontSize: "14px" }}>Today with Sage</div>
              <div style={{ color: "#888", fontSize: "12px" }}>Daily clarity ritual</div>
            </div>
          </div>
        </Link>
        <Link to="/cipher">
          <div style={quickActionStyle("#00FF9C")}>
            <span style={{ fontSize: "22px" }}>₿</span>
            <div>
              <div style={{ color: "white", fontWeight: "700", fontSize: "14px" }}>Cipher Oracle</div>
              <div style={{ color: "#888", fontSize: "12px" }}>Crypto & Web3 intel</div>
            </div>
          </div>
        </Link>
      </div>

      {/* ── Your council ── */}
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ color: "#aaa", fontSize: "12px", fontWeight: "700", letterSpacing: "1.5px", marginBottom: "12px" }}>YOUR COUNCIL</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
          {AGENTS.map((agent) => (
            <Link to="/council" key={agent.id}>
              <div style={{
                background: "#0a0a1a",
                border: `1px solid ${agent.color}33`,
                borderRadius: "12px",
                padding: "14px",
                textAlign: "center",
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = agent.color)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = `${agent.color}33`)}
              >
                <div style={{ fontSize: "24px", marginBottom: "6px" }}>{agent.emoji}</div>
                <div style={{ color: agent.color, fontWeight: "700", fontSize: "13px" }}>{agent.name}</div>
                <div style={{ color: "#666", fontSize: "11px" }}>{agent.role}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent sessions ── */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h2 style={{ color: "#aaa", fontSize: "12px", fontWeight: "700", letterSpacing: "1.5px", margin: 0 }}>RECENT DECISIONS</h2>
          <Link to="/history">
            <span style={{ color: "#00D4FF", fontSize: "12px" }}>View all →</span>
          </Link>
        </div>

        {sessions.length === 0 ? (
          <div style={{
            background: "#0a0a1a",
            border: "1px dashed #1a1a3a",
            borderRadius: "12px",
            padding: "32px",
            textAlign: "center",
            color: "#555",
          }}>
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>⚖️</div>
            <div style={{ fontSize: "14px" }}>No decisions yet.</div>
            <div style={{ fontSize: "13px", marginTop: "4px" }}>
              <Link to="/council"><span style={{ color: "#00D4FF" }}>Ask the Council your first question →</span></Link>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {sessions.map((s) => (
              <div key={s.id} style={{
                background: "#0a0a1a",
                border: "1px solid #1a1a2e",
                borderRadius: "12px",
                padding: "16px 20px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "white", fontWeight: "600", fontSize: "14px", marginBottom: "6px" }}>
                      {s.question.length > 90 ? s.question.slice(0, 90) + "…" : s.question}
                    </div>
                    {s.synthesis && (
                      <div style={{ color: "#888", fontSize: "13px", lineHeight: "1.5" }}>
                        {s.synthesis.length > 120 ? s.synthesis.slice(0, 120) + "…" : s.synthesis}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
                    {s.outcome && (
                      <span style={{
                        padding: "2px 10px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: "700",
                        background: s.outcome === "acted" ? "#00FF9C22" : s.outcome === "skipped" ? "#FF5A6A22" : "#FFA50022",
                        color: s.outcome === "acted" ? "#00FF9C" : s.outcome === "skipped" ? "#FF5A6A" : "#FFA500",
                      }}>
                        {s.outcome.toUpperCase()}
                      </span>
                    )}
                    <span style={{ color: "#555", fontSize: "11px" }}>
                      {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

function getTimeOfDay(): string {
  const h = new Date().getHours()
  if (h < 12) return "morning"
  if (h < 17) return "afternoon"
  return "evening"
}

function quickActionStyle(color: string): CSSProperties {
  return {
    background: `${color}0d`,
    border: `1px solid ${color}33`,
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    transition: "border-color 0.2s, background 0.2s",
  }
}
