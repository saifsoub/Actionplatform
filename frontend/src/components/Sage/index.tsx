import { useState, useEffect, useRef } from "react"

// ── Daily briefing content (rotates by day of week) ─────────────────────────
const DAILY_CONTENT = [
  {
    day: "Sunday",
    signal: "The week ahead has more leverage than the week behind.",
    framework: "The 2-by-2 decision matrix: separate urgency from importance. Most of what feels urgent this week is neither.",
    challenge: "Name one thing you've been 'about to start' for more than 3 weeks. Today is the day you either begin it or consciously release it.",
    action: "Block 90 minutes tomorrow morning before anyone can reach you. That's your highest-value time. Protect it now.",
    quote: "The successful warrior is the average person with laser-like focus.",
    author: "Bruce Lee",
  },
  {
    day: "Monday",
    signal: "Energy compounds across the week — how you start Monday determines Thursday's output.",
    framework: "The 1-3-5 rule: one big thing, three medium things, five small things. Most people have the ratio backwards.",
    challenge: "What is the single outcome that, if achieved by Friday, would make this week feel successful? Everything else is secondary.",
    action: "Write down your three most important tasks for the week before opening email. Order matters.",
    quote: "Don't find the time, make the time.",
    author: "Unknown",
  },
  {
    day: "Tuesday",
    signal: "Tuesday is the most productive day of the week for most people — use it for your hardest cognitive work.",
    framework: "Maker vs. Manager time: creative and strategic work requires 4-hour blocks. Administrative work thrives in 30-minute slots. Which mode are you in right now?",
    challenge: "Identify the one email or message in your inbox that you've been avoiding. Send it today.",
    action: "Find the longest meeting on your calendar this week. Ask whether it could be a 3-paragraph email instead.",
    quote: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
  },
  {
    day: "Wednesday",
    signal: "Midweek is where most plans quietly die — this is the test of commitment, not inspiration.",
    framework: "The pivot vs. persevere decision: if you're behind on your goals, ask whether the strategy is wrong or the execution is. Most pivots happen too soon; most bad executions last too long.",
    challenge: "Ask someone for honest feedback on something you built or wrote this week. Not validation — actual critique.",
    action: "Review what you planned Monday and close one thing completely today. Done is better than almost done.",
    quote: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
  },
  {
    day: "Thursday",
    signal: "Thursday decisions shape Friday's clarity or chaos.",
    framework: "The pre-mortem: imagine it's 6 months from now and your current plan failed completely. What was the most likely cause? Fix that now.",
    challenge: "Find one assumption you've been treating as a fact. Design a 48-hour test to validate or kill it.",
    action: "Write down three things that went well this week and one thing you'd do differently. Compound the wins.",
    quote: "Opportunities don't happen. You create them.",
    author: "Chris Grosser",
  },
  {
    day: "Friday",
    signal: "The best professionals end Friday by setting up Monday's momentum — not just closing the week.",
    framework: "The weekly review: what did you ship? What did you learn? What's the one thing you'll carry into next week?",
    challenge: "Reach out to someone in your network with a specific value-add — a resource, a connection, an insight. No ask attached.",
    action: "Write next Monday's three priorities before you close your computer today. Future-you will be grateful.",
    quote: "A year from now you may wish you had started today.",
    author: "Karen Lamb",
  },
  {
    day: "Saturday",
    signal: "Rest is not the absence of work — it's the work that makes all other work possible.",
    framework: "The input-output ratio: high performers protect their inputs (sleep, thinking time, movement, relationships) as fiercely as their outputs. What input have you been neglecting?",
    challenge: "Spend 30 minutes doing something with no productivity angle whatsoever. Fully present. No phone.",
    action: "Identify one relationship that's been on autopilot. Send a genuine, thoughtful message to that person today.",
    quote: "Almost everything will work again if you unplug it for a few minutes, including you.",
    author: "Anne Lamott",
  },
]

const MOCK_SAGE_RESPONSES = [
  "What you're describing has a common pattern underneath it: you're solving for the visible problem when the real constraint is invisible. Before optimizing the execution, ask whether the goal itself still serves the person you're trying to become. The most powerful question isn't 'how do I do this better?' — it's 'is this still the right thing to do?'",
  "The discomfort you're feeling is signal, not noise. Most people interpret friction as a reason to stop; high performers learn to read friction as the precise location of their next breakthrough. What would you do differently if you believed the obstacle was designed to teach you exactly what you need next?",
  "Clarity doesn't precede action — it follows action. The reason you feel stuck isn't a thinking problem; it's a doing problem. The smallest possible experiment, started today, will give you more information than another week of planning. What's the one thing you could try in the next 24 hours that would either confirm or challenge your current assumption?",
  "You already know what needs to happen. You've known for a while. The question underneath your question is: what story are you telling yourself that makes not doing it feel reasonable? Name that story out loud. Once you can say it clearly, it loses most of its power over you.",
]

interface Message {
  id: number
  role: "user" | "sage"
  text: string
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default function Sage() {
  const today = DAILY_CONTENT[new Date().getDay()]
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [usingAI, setUsingAI] = useState(false)
  const [msgCount, setMsgCount] = useState(0)
  const [briefingExpanded, setBriefingExpanded] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  async function send() {
    const q = input.trim()
    if (!q || loading) return
    setInput("")
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text: q }])
    setLoading(true)
    setMsgCount((n) => n + 1)

    let reply = ""
    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? ""
      const token = localStorage.getItem("access_token")
      const ctx = `Today is ${today.day}. Today's signal: "${today.signal}". Today's challenge: "${today.challenge}".`
      const res = await fetch(`${apiUrl}/api/v1/council/query`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: `[Context: ${ctx}] User asks Sage: ${q}`,
          round: msgCount,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        reply = data.synthesis ?? data.responses?.atlas ?? ""
        setUsingAI(true)
      }
    } catch { /* offline */ }

    if (!reply) {
      await sleep(1200 + Math.random() * 600)
      reply = MOCK_SAGE_RESPONSES[msgCount % MOCK_SAGE_RESPONSES.length]
    }

    setMessages((prev) => [...prev, { id: Date.now() + 1, role: "sage", text: reply }])
    setLoading(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const S = {
    page: {
      minHeight: "100vh" as const,
      background: "#07090F",
      fontFamily: "'Inter',system-ui,sans-serif",
      color: "#E8EAF0",
      display: "flex",
      flexDirection: "column" as const,
    },
    header: {
      position: "sticky" as const,
      top: 0,
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 24px",
      background: "rgba(7,9,15,0.92)",
      borderBottom: "1px solid rgba(201,111,255,.12)",
      backdropFilter: "blur(14px)" as const,
    },
  }

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "linear-gradient(135deg,rgba(201,111,255,.15),rgba(0,212,255,.1))",
              border: "1px solid rgba(201,111,255,.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            🧙
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Sage</div>
            <div style={{ fontSize: 8, color: "#4a2a6a", letterSpacing: "1px" }}>DAILY INTELLIGENCE · {today.day.toUpperCase()}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {usingAI ? (
            <div style={{ fontSize: 8, color: "#00FF9C", letterSpacing: ".8px", padding: "3px 8px", border: "1px solid rgba(0,255,156,.25)", borderRadius: 20, background: "rgba(0,255,156,.06)" }}>
              ● AI POWERED
            </div>
          ) : (
            <div style={{ fontSize: 8, color: "#4a2a6a", letterSpacing: ".8px", padding: "3px 8px", border: "1px solid rgba(201,111,255,.1)", borderRadius: 20 }}>
              DEMO MODE
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, maxWidth: 760, width: "100%", margin: "0 auto", padding: "24px 16px 110px" }}>
        {/* Daily Briefing Card */}
        <div
          style={{
            background: "linear-gradient(135deg,rgba(201,111,255,.07),rgba(0,212,255,.04))",
            border: "1px solid rgba(201,111,255,.2)",
            borderRadius: 16,
            marginBottom: 24,
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => setBriefingExpanded((v) => !v)}
            style={{
              width: "100%",
              padding: "16px 20px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>🧙</span>
              <div style={{ textAlign: "left" as const }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#C96FFF" }}>
                  {today.day}'s Briefing
                </div>
                <div style={{ fontSize: 8, color: "#4a2a6a" }}>
                  {briefingExpanded ? "Click to collapse" : "Click to expand"}
                </div>
              </div>
            </div>
            <span style={{ color: "#4a2a6a", transition: "transform .2s", transform: briefingExpanded ? "rotate(180deg)" : "none" }}>
              ↓
            </span>
          </button>

          {briefingExpanded && (
            <div style={{ padding: "0 20px 20px" }}>
              {/* Signal */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 8, color: "#4a2a6a", letterSpacing: "1px", marginBottom: 6 }}>📡 TODAY'S SIGNAL</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#DDE0EC", lineHeight: 1.6 }}>
                  "{today.signal}"
                </div>
              </div>

              <div style={{ height: 1, background: "rgba(201,111,255,.12)", marginBottom: 16 }} />

              {/* Framework */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 8, color: "#4a2a6a", letterSpacing: "1px", marginBottom: 6 }}>🧩 DECISION FRAMEWORK</div>
                <div style={{ fontSize: 12, color: "#888", lineHeight: 1.7 }}>{today.framework}</div>
              </div>

              <div style={{ height: 1, background: "rgba(201,111,255,.12)", marginBottom: 16 }} />

              {/* Challenge */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 8, color: "#4a2a6a", letterSpacing: "1px", marginBottom: 6 }}>💡 TODAY'S CHALLENGE</div>
                <div style={{ fontSize: 12, color: "#888", lineHeight: 1.7 }}>{today.challenge}</div>
              </div>

              <div style={{ height: 1, background: "rgba(201,111,255,.12)", marginBottom: 16 }} />

              {/* Action */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 8, color: "#00D4FF", letterSpacing: "1px", marginBottom: 6 }}>⚡ YOUR ACTION RIGHT NOW</div>
                <div
                  style={{
                    background: "rgba(0,212,255,.06)",
                    border: "1px solid rgba(0,212,255,.15)",
                    borderRadius: 9,
                    padding: "10px 14px",
                    fontSize: 12,
                    color: "#9DD8EC",
                    lineHeight: 1.7,
                    fontWeight: 500,
                  }}
                >
                  {today.action}
                </div>
              </div>

              {/* Quote */}
              <div style={{ textAlign: "center" as const, padding: "4px 0 4px" }}>
                <div style={{ fontSize: 11, color: "#666", fontStyle: "italic", marginBottom: 3 }}>
                  "{today.quote}"
                </div>
                <div style={{ fontSize: 9, color: "#333" }}>— {today.author}</div>
              </div>
            </div>
          )}
        </div>

        {/* Conversation */}
        {messages.length === 0 && (
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: "#4a2a6a", marginBottom: 14 }}>
              Ask Sage anything — about today's briefing, your challenges, or what's on your mind.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
              {[
                "How do I apply today's framework to a real decision?",
                "I'm struggling to stay focused this week. Help.",
                "How do I build momentum when motivation is low?",
                "What should I prioritize when everything feels urgent?",
              ].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setInput(p)
                    setTimeout(() => send(), 50)
                  }}
                  style={{
                    padding: "11px 13px",
                    background: "rgba(201,111,255,.04)",
                    border: "1px solid rgba(201,111,255,.12)",
                    borderRadius: 9,
                    color: "#6a3a9a",
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left" as const,
                    lineHeight: 1.4,
                    transition: "all .2s",
                  }}
                  onMouseEnter={(e) => {
                    const t = e.currentTarget
                    t.style.background = "rgba(201,111,255,.08)"
                    t.style.color = "#C96FFF"
                  }}
                  onMouseLeave={(e) => {
                    const t = e.currentTarget
                    t.style.background = "rgba(201,111,255,.04)"
                    t.style.color = "#6a3a9a"
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                animation: "rise .3s ease",
              }}
            >
              {msg.role === "sage" && (
                <div style={{ fontSize: 18, marginRight: 10, marginTop: 2 }}>🧙</div>
              )}
              <div
                style={{
                  maxWidth: "80%",
                  padding: "12px 15px",
                  borderRadius: msg.role === "user" ? "12px 12px 3px 12px" : "3px 12px 12px 12px",
                  background: msg.role === "user"
                    ? "rgba(201,111,255,.08)"
                    : "rgba(255,255,255,.03)",
                  border: msg.role === "user"
                    ? "1px solid rgba(201,111,255,.2)"
                    : "1px solid rgba(255,255,255,.06)",
                  fontSize: 12.5,
                  lineHeight: 1.8,
                  color: msg.role === "user" ? "#C96FFF" : "#B8BDD0",
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", animation: "rise .3s ease" }}>
              <div style={{ fontSize: 18 }}>🧙</div>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: "#C96FFF",
                    animation: `pulse 1s ease ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 9, color: "#4a2a6a" }}>Sage is reflecting...</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div
        style={{
          position: "sticky" as const,
          bottom: 0,
          background: "rgba(7,9,15,0.96)",
          borderTop: "1px solid rgba(201,111,255,.12)",
          padding: "14px 16px",
          backdropFilter: "blur(14px)" as const,
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", gap: 10, alignItems: "flex-end" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") send()
            }}
            placeholder="What's on your mind today? Ask Sage anything..."
            rows={2}
            style={{
              flex: 1,
              background: "rgba(201,111,255,.04)",
              border: "1px solid rgba(201,111,255,.15)",
              borderRadius: 10,
              padding: "10px 14px",
              color: "#DDE0EC",
              fontSize: 12,
              lineHeight: 1.6,
              resize: "none",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              background: input.trim() && !loading
                ? "linear-gradient(135deg,#C96FFF,#00D4FF)"
                : "rgba(255,255,255,.04)",
              color: input.trim() && !loading ? "#000" : "#333",
              fontSize: 11,
              fontWeight: 700,
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              height: 44,
              transition: "all .2s",
            }}
          >
            Ask →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes rise { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:.2;transform:scale(.8)} 50%{opacity:1;transform:scale(1.4)} }
        textarea::placeholder { color: #2a1a3a; }
      `}</style>
    </div>
  )
}
