import { useState, useEffect } from "react"

interface Session {
  id: string
  question: string
  atlas_response: string
  nova_response: string
  reza_response: string
  kai_response: string
  synthesis: string
  outcome: string | null
  outcome_note: string | null
  created_at: string
}

const OUTCOME_OPTIONS = [
  { value: "acted", label: "✅ Acted on it", color: "#00FF9C" },
  { value: "skipped", label: "⛔ Didn't act", color: "#FF5A6A" },
  { value: "pending", label: "⏳ Still deciding", color: "#FFA500" },
]

const AGENTS = [
  { key: "atlas_response", name: "Atlas 🌐", color: "#00D4FF" },
  { key: "nova_response", name: "Nova ✨", color: "#C96FFF" },
  { key: "reza_response", name: "Reza ⚡", color: "#FF5A6A" },
  { key: "kai_response", name: "Kai 🛠️", color: "#00FF9C" },
] as const

function OutcomePicker({ session, onUpdate }: { session: Session; onUpdate: (s: Session) => void }) {
  const [note, setNote] = useState(session.outcome_note || "")
  const [saving, setSaving] = useState(false)

  async function save(outcome: string) {
    setSaving(true)
    const token = localStorage.getItem("access_token")
    try {
      const res = await fetch(`/api/v1/sessions/${session.id}/outcome`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ outcome, outcome_note: note || null }),
      })
      if (res.ok) {
        const updated = await res.json()
        onUpdate({ ...session, ...updated })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ marginTop: "12px", padding: "12px 16px", background: "#0d0d1f", borderRadius: "8px" }}>
      <div style={{ color: "#888", fontSize: "11px", fontWeight: "700", letterSpacing: "1px", marginBottom: "8px" }}>OUTCOME</div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
        {OUTCOME_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            disabled={saving}
            onClick={() => save(opt.value)}
            style={{
              padding: "6px 14px",
              borderRadius: "999px",
              border: `1.5px solid ${session.outcome === opt.value ? opt.color : "#1a1a3a"}`,
              background: session.outcome === opt.value ? `${opt.color}22` : "transparent",
              color: session.outcome === opt.value ? opt.color : "#aaa",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: session.outcome === opt.value ? "700" : "400",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={() => session.outcome && save(session.outcome)}
        placeholder="Add a note… (optional)"
        style={{
          width: "100%",
          background: "#0a0a1a",
          border: "1px solid #1a1a3a",
          borderRadius: "8px",
          padding: "8px 12px",
          color: "#ccc",
          fontSize: "12px",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  )
}

export default function History() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    fetch("/api/v1/sessions/?limit=100", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setSessions(data.data ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = sessions.filter((s) =>
    s.question.toLowerCase().includes(search.toLowerCase()) ||
    (s.synthesis || "").toLowerCase().includes(search.toLowerCase())
  )

  function updateSession(updated: Session) {
    setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
  }

  return (
    <div style={{ padding: "24px 32px", maxWidth: "860px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ color: "white", fontSize: "26px", fontWeight: "800", marginBottom: "4px" }}>Decision Journal</h1>
      <p style={{ color: "#888", fontSize: "14px", marginBottom: "24px" }}>Every question you've brought to the council. Track what you did with the advice.</p>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search your decisions…"
        style={{
          width: "100%",
          background: "#0a0a1a",
          border: "1px solid #1a1a3a",
          borderRadius: "10px",
          padding: "12px 16px",
          color: "white",
          fontSize: "14px",
          outline: "none",
          marginBottom: "20px",
          boxSizing: "border-box",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#00D4FF")}
        onBlur={(e) => (e.target.style.borderColor = "#1a1a3a")}
      />

      {loading && (
        <div style={{ textAlign: "center", color: "#555", paddingTop: "60px" }}>Loading your journal…</div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: "center", color: "#555", paddingTop: "60px" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>📭</div>
          <div>{search ? "No decisions match that search." : "No decisions yet. Ask the council your first question."}</div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filtered.map((s) => {
          const isOpen = expanded === s.id
          return (
            <div key={s.id} style={{
              background: "#0a0a1a",
              border: "1px solid #1a1a2e",
              borderRadius: "14px",
              overflow: "hidden",
            }}>
              {/* Row header */}
              <div
                onClick={() => setExpanded(isOpen ? null : s.id)}
                style={{
                  padding: "16px 20px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ color: "white", fontWeight: "600", fontSize: "14px", marginBottom: "4px" }}>
                    {s.question.length > 100 ? s.question.slice(0, 100) + "…" : s.question}
                  </div>
                  {s.synthesis && !isOpen && (
                    <div style={{ color: "#666", fontSize: "12px", lineHeight: "1.5" }}>
                      {s.synthesis.length > 110 ? s.synthesis.slice(0, 110) + "…" : s.synthesis}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px", flexShrink: 0 }}>
                  <span style={{ color: "#555", fontSize: "11px" }}>
                    {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  {s.outcome && (
                    <span style={{
                      padding: "2px 10px",
                      borderRadius: "999px",
                      fontSize: "10px",
                      fontWeight: "700",
                      background: s.outcome === "acted" ? "#00FF9C22" : s.outcome === "skipped" ? "#FF5A6A22" : "#FFA50022",
                      color: s.outcome === "acted" ? "#00FF9C" : s.outcome === "skipped" ? "#FF5A6A" : "#FFA500",
                    }}>
                      {s.outcome.toUpperCase()}
                    </span>
                  )}
                  <span style={{ color: "#444", fontSize: "12px" }}>{isOpen ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Expanded view */}
              {isOpen && (
                <div style={{ padding: "0 20px 20px" }}>
                  {/* Full question */}
                  <div style={{
                    background: "#080814",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    marginBottom: "16px",
                    color: "#ccc",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    borderLeft: "3px solid #00D4FF",
                  }}>
                    {s.question}
                  </div>

                  {/* Agent responses */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                    {AGENTS.map((agent) => {
                      const text = s[agent.key]
                      if (!text) return null
                      return (
                        <div key={agent.key} style={{
                          background: "#0d0d1f",
                          border: `1px solid ${agent.color}33`,
                          borderRadius: "10px",
                          padding: "12px 14px",
                        }}>
                          <div style={{ color: agent.color, fontWeight: "700", fontSize: "11px", marginBottom: "6px" }}>
                            {agent.name}
                          </div>
                          <div style={{ color: "#bbb", fontSize: "12px", lineHeight: "1.6" }}>{text}</div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Synthesis */}
                  {s.synthesis && (
                    <div style={{
                      background: "#0d1b3e",
                      border: "1px solid #00D4FF22",
                      borderRadius: "10px",
                      padding: "12px 16px",
                      marginBottom: "4px",
                    }}>
                      <div style={{ color: "#00D4FF", fontWeight: "700", fontSize: "11px", marginBottom: "6px" }}>COUNCIL SYNTHESIS</div>
                      <div style={{ color: "#ccc", fontSize: "13px", lineHeight: "1.6" }}>{s.synthesis}</div>
                    </div>
                  )}

                  {/* Outcome picker */}
                  <OutcomePicker session={s} onUpdate={updateSession} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
