import { useState, useRef, useEffect } from "react"

// ── Named agent profiles ────────────────────────────────────────────────────
const M = {
  atlas: {
    name: "Atlas",
    emoji: "🌐",
    color: "#00D4FF",
    role: "Strategic Advisor",
    bg: "rgba(0,212,255,.07)",
    border: "rgba(0,212,255,.25)",
    tagline: "Global Systems Thinker",
    r: [
      "The real question isn't what you're solving — it's why this problem persists at all. Map the incentive structures: who profits from the status quo, and what switching costs protect them? Your best move creates asymmetric leverage, not incremental improvement. Position before you execute.",
      "Before committing capital or time, stress-test your riskiest assumption with the cheapest possible signal. I've seen too many brilliant strategies collapse at first contact with reality. What experiment could you run this week that would either kill this idea or make it bulletproof?",
      "You're looking at three futures: the optimistic case you're planning for, the realistic case you'll actually face, and the silent one — where nothing changes and the status quo wins by default. That third scenario carries more weight than you're giving it. How does your approach hold up when adoption is 40% of your projection?",
      "The clearest strategic wins always come from ruthless subtraction, not addition. Define what you refuse to be before you define what you are. The companies that dominate their space do one thing so well that alternatives feel like compromises.",
    ],
  },
  nova: {
    name: "Nova",
    emoji: "✨",
    color: "#C96FFF",
    role: "Creative Visionary",
    bg: "rgba(201,111,255,.07)",
    border: "rgba(201,111,255,.25)",
    tagline: "Sees What Others Miss",
    r: [
      "What if you inverted the whole framing? Instead of solving the problem for users, what if the product solved itself — and users were the medium, not the audience? The most disruptive companies didn't compete in existing categories; they made their category irrelevant. What's the version of this that surprises even you?",
      "There's a deeper human emotion underneath this challenge that nobody's naming. Strip away the technical framing — what does someone feel in the moment this works perfectly? Design backwards from that feeling. When you nail the emotion, the features reveal themselves like inevitabilities.",
      "I keep seeing the same pattern: the friction you're fighting isn't a bug — it's the signal pointing to the real breakthrough. The constraint is the concept. The most elegant solutions in history were born from the exact limitations people were trying to escape.",
      "Borrow from an adjacent world. What would a jazz musician do here? A city planner? A marine biologist? The answer you need almost certainly exists somewhere — just in a domain nobody's thought to look. Cross-pollination is underrated as a strategy.",
    ],
  },
  reza: {
    name: "Reza",
    emoji: "⚡",
    color: "#FF5A6A",
    role: "Critical Analyst",
    bg: "rgba(255,90,106,.07)",
    border: "rgba(255,90,106,.25)",
    tagline: "Makes Ideas Survive Reality",
    r: [
      "The assumption I'd challenge first: that the people who need this actually want it. There's a graveyard full of elegant solutions to problems people were tolerating just fine. Who has told you this is painful enough to change their behavior — not in a survey, but in a real conversation where they paid attention and leaned forward?",
      "Here's what nobody's saying out loud: the real bottleneck isn't building the solution, it's getting enough people to use it consistently. Even a perfect product dies without a credible theory of adoption. 'Build it and they'll come' has never been a strategy. What's your actual mechanism for behavior change?",
      "Let me name the dependency nobody's talking about: this works if a third party cooperates — an API, a partner, a regulation, a platform. External dependencies are legitimate risks, not footnotes. What's your contingency if the key dependency shifts, breaks, or walks away?",
      "Be honest about your timeline and burn rate. Every ambitious plan runs 2–3× longer than expected. If your model breaks at month 6 with no revenue and no traction, this project doesn't survive. Compress everything to the minimum viable version first — then build up from proof, not aspiration.",
    ],
  },
  kai: {
    name: "Kai",
    emoji: "🛠️",
    color: "#00FF9C",
    role: "Execution Lead",
    bg: "rgba(0,255,156,.07)",
    border: "rgba(0,255,156,.25)",
    tagline: "Builder & Pragmatist",
    r: [
      "Cut everything and ask: what's the smallest thing you could put in front of a real user this week? Not a mockup — something that actually works, even if it's ugly and mostly manual. One hour of watching a real person use it beats a month of internal theorizing. If you can't demo it in 7 days, the scope is still too big.",
      "Don't touch the architecture until you've nailed the core user flow end-to-end, even if half of it is you doing things manually behind the scenes. Automate the bottlenecks only after you know which ones actually cause pain. Tech debt on features nobody uses is worse than no tech at all.",
      "Give me two concrete next actions: one you can do before noon today, and one that unblocks everything for next week. Everything else is planning theater. Name the single specific thing that's actually blocking forward motion right now — not in general, but specifically.",
      "Ship the ugly version. Perfection is a delay tactic dressed up as quality control. The feedback you get from a rough v1 live in 10 days is worth more than the polished v2 you launch in 3 months. Market response is the only signal that matters — everything else is speculation.",
    ],
  },
}

const ORDER = ["atlas", "nova", "reza", "kai"] as const
type AgentId = (typeof ORDER)[number]

// ── Compelling mock synthesis responses ─────────────────────────────────────
const SYNTH = [
  "The council is unanimous on one thing: the fastest path forward is a single, cheap, real-world test run this week — before any architecture decisions, strategy pivots, or resource commitments. Every perspective points to the same bottleneck: an untested core assumption that's holding the entire plan hostage.",
  "Despite different lenses, Atlas, Nova, Reza, and Kai converge on a shared truth: the bottleneck isn't the idea or the build — it's the first honest signal from the market. Strip everything to its minimum, ship it in days, and let reality edit the roadmap. Internal conviction without external validation is just expensive storytelling.",
  "The council's consensus is stark: there's a hidden assumption underneath this challenge that nobody has actually tested yet. Until that assumption is either confirmed or killed, everything downstream is premature. One conversation, one prototype, one week — that's the only move that changes the probability of success.",
  "Four advisors, one verdict: stop planning, start probing. The leverage point, the creative inversion, the critical risk, and the next action all point to the same first step — get this in front of a real person today, before refining anything. Speed of learning beats quality of planning every time.",
]

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

let _msgSeq = 0

interface Message {
  id: number
  agent: AgentId
  text: string
  round: number
}

export default function LLMCouncil() {
  const [question, setQuestion] = useState("")
  const [session, setSession] = useState<{ question: string } | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [synthesis, setSynthesis] = useState("")
  const [typing, setTyping] = useState<AgentId | null>(null)
  const [loading, setLoading] = useState(false)
  const [round, setRound] = useState(0)
  const [spoke, setSpoke] = useState<Record<string, boolean>>({})
  const [usingAI, setUsingAI] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const roundRef = useRef(0)
  const sessionQuestionRef = useRef("")

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, synthesis, typing])

  async function runRound() {
    setLoading(true)
    const r = roundRef.current
    const q = sessionQuestionRef.current

    // ── Try real API ──────────────────────────────────────────────────────────
    let agentResponses: Record<string, string> | null = null
    let synthResponse: string | null = null

    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? ""
      const token = localStorage.getItem("access_token")
      const res = await fetch(`${apiUrl}/api/v1/council/query`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: q }),
      })
      if (res.ok) {
        const data = await res.json()
        agentResponses = data.responses as Record<string, string>
        synthResponse = data.synthesis as string
        setUsingAI(true)
      } else if (res.status === 402) {
        const data = await res.json().catch(() => ({}))
        setLoading(false)
        setApiError(data.detail ?? "Session limit reached. Please upgrade your plan.")
        return
      } else if (res.status === 429) {
        setLoading(false)
        setApiError("AI service is busy. Please wait a moment and try again.")
        return
      } else if (res.status === 503 || res.status === 504) {
        setLoading(false)
        setApiError("The council is temporarily unavailable. Please try again shortly.")
        return
      }
      // Other non-ok responses fall through to mock
    } catch {
      // Network error — fall through to mock
    }

    // ── Sequential display (real or mock) ───────────────────────────────────
    setTyping(ORDER[0])
    for (let i = 0; i < ORDER.length; i++) {
      const id = ORDER[i]
      await sleep(900 + Math.random() * 700)
      setTyping(null)
      const text = agentResponses?.[id] ?? M[id].r[r % M[id].r.length]
      setMessages((prev) => [...prev, { id: ++_msgSeq, agent: id, text, round: r }])
      setSpoke((prev) => ({ ...prev, [id]: true }))
      if (i < ORDER.length - 1) {
        await sleep(150)
        setTyping(ORDER[i + 1])
      }
    }

    await sleep(600)
    setSynthesis(synthResponse ?? SYNTH[r % SYNTH.length])
    roundRef.current = r + 1
    setRound(r + 1)
    setLoading(false)
    setTyping(null)
  }

  async function convene() {
    if (loading || !question.trim()) return
    sessionQuestionRef.current = question
    setSession({ question })
    setMessages([])
    setSynthesis("")
    setSpoke({})
    setUsingAI(false)
    setApiError(null)
    roundRef.current = 0
    setRound(0)
    await runRound()
  }

  async function anotherRound() {
    if (loading) return
    setSpoke({})
    setSynthesis("")
    await runRound()
  }

  function reset() {
    setSession(null)
    setMessages([])
    setSynthesis("")
    setQuestion("")
    setTyping(null)
    setLoading(false)
    setSpoke({})
    setUsingAI(false)
    setApiError(null)
    roundRef.current = 0
    setRound(0)
    sessionQuestionRef.current = ""
  }

  const roundGroups = messages.reduce(
    (acc: Record<number, Message[]>, m) => {
      if (!acc[m.round]) acc[m.round] = []
      acc[m.round].push(m)
      return acc
    },
    {} as Record<number, Message[]>,
  )

  const isDone = !loading && messages.length > 0 && messages.length % 4 === 0

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#07090F",
        fontFamily: "'Inter',system-ui,sans-serif",
        color: "#E8EAF0",
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px",
          background: "rgba(7,9,15,0.92)",
          borderBottom: "1px solid rgba(255,255,255,.07)",
          backdropFilter: "blur(14px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: "linear-gradient(135deg,rgba(0,212,255,.2),rgba(201,111,255,.2))",
              border: "1px solid rgba(255,255,255,.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            ⚖️
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-.3px" }}>
              The Council
            </div>
            <div style={{ fontSize: 8, color: "#555", letterSpacing: "1px" }}>
              AI ADVISOR PANEL
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {usingAI && (
            <div
              style={{
                fontSize: 8,
                color: "#00FF9C",
                letterSpacing: ".8px",
                padding: "3px 8px",
                border: "1px solid rgba(0,255,156,.25)",
                borderRadius: 20,
                background: "rgba(0,255,156,.06)",
              }}
            >
              ● AI POWERED
            </div>
          )}
          {!usingAI && session && (
            <div
              style={{
                fontSize: 8,
                color: "#555",
                letterSpacing: ".8px",
                padding: "3px 8px",
                border: "1px solid rgba(255,255,255,.06)",
                borderRadius: 20,
              }}
            >
              DEMO MODE
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "22px 16px 80px" }}>
        {/* Agent Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 8,
            marginBottom: 24,
          }}
        >
          {ORDER.map((id) => {
            const m = M[id]
            const isTyping = typing === id
            return (
              <div
                key={id}
                style={{
                  padding: "14px 12px",
                  borderRadius: 12,
                  background: m.bg,
                  border: `1px solid ${isTyping ? m.color : m.border}`,
                  boxShadow: isTyping ? `0 0 24px ${m.color}22` : "none",
                  transition: "all .3s",
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 6 }}>{m.emoji}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: m.color, marginBottom: 1 }}>
                  {m.name}
                </div>
                <div style={{ fontSize: 8, color: "#444", lineHeight: 1.35 }}>{m.tagline}</div>
                {spoke[id] && !isTyping && (
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: m.color,
                      opacity: 0.6,
                      marginTop: 7,
                    }}
                  />
                )}
                {isTyping && (
                  <div style={{ display: "flex", gap: 3, marginTop: 7 }}>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: 3,
                          height: 3,
                          borderRadius: "50%",
                          background: m.color,
                          animation: `pulse 1s ease ${i * 0.18}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Input */}
        {!session && (
          <div
            style={{
              background: "rgba(255,255,255,.025)",
              border: "1px solid rgba(255,255,255,.07)",
              borderRadius: 14,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 9, color: "#444", letterSpacing: ".9px", marginBottom: 10 }}>
              BRING YOUR CHALLENGE TO THE COUNCIL
            </div>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") convene()
              }}
              placeholder="What decision, strategy, or challenge should Atlas, Nova, Reza, and Kai deliberate on?"
              rows={4}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#DDE0EC",
                fontSize: 13,
                lineHeight: 1.7,
                resize: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 12,
                paddingTop: 12,
                borderTop: "1px solid rgba(255,255,255,.05)",
              }}
            >
              <span style={{ fontSize: 9, color: "#252535" }}>⌘ + Enter to convene</span>
              <button
                onClick={convene}
                disabled={!question.trim()}
                style={{
                  padding: "9px 22px",
                  borderRadius: 8,
                  border: "none",
                  background: question.trim()
                    ? "linear-gradient(135deg,#00D4FF,#C96FFF)"
                    : "rgba(255,255,255,.05)",
                  color: question.trim() ? "#000" : "#333",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: question.trim() ? "pointer" : "not-allowed",
                  letterSpacing: ".4px",
                  fontFamily: "inherit",
                  transition: "all .2s",
                }}
              >
                CONVENE COUNCIL →
              </button>
            </div>
          </div>
        )}

        {/* Session Banner */}
        {session && (
          <div
            style={{
              background: "rgba(255,255,255,.02)",
              border: "1px solid rgba(255,255,255,.06)",
              borderRadius: 10,
              padding: "12px 14px",
              marginBottom: 18,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 14,
            }}
          >
            <div>
              <div style={{ fontSize: 8, color: "#333", letterSpacing: ".8px", marginBottom: 4 }}>
                DELIBERATING ON
              </div>
              <div style={{ fontSize: 12, color: "#999", lineHeight: 1.5 }}>{session.question}</div>
              {round > 0 && (
                <div style={{ fontSize: 8, color: "#333", marginTop: 4 }}>
                  Round {round} complete
                </div>
              )}
            </div>
            <button
              onClick={reset}
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,.07)",
                background: "transparent",
                color: "#444",
                fontSize: 9,
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              New ↺
            </button>
          </div>
        )}

        {/* API Error Banner */}
        {apiError && (
          <div
            style={{
              background: "rgba(255,90,106,.08)",
              border: "1px solid rgba(255,90,106,.3)",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 12, color: "#FF5A6A", lineHeight: 1.5 }}>{apiError}</span>
            <button
              onClick={() => setApiError(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "#FF5A6A",
                cursor: "pointer",
                fontSize: 14,
                padding: "0 4px",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Round Groups */}
        {Object.entries(roundGroups).map(([r, msgs]) => (
          <div key={r}>
            {parseInt(r) > 0 && (
              <div style={{ textAlign: "center", margin: "18px 0 14px" }}>
                <span
                  style={{
                    fontSize: 8,
                    color: "#252535",
                    letterSpacing: "1.2px",
                    padding: "3px 14px",
                    border: "1px solid rgba(255,255,255,.04)",
                    borderRadius: 20,
                  }}
                >
                  ROUND {parseInt(r) + 1}
                </span>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
              {msgs.map((msg) => {
                const m = M[msg.agent]
                return (
                  <div
                    key={msg.id}
                    style={{
                      borderRadius: 12,
                      padding: "14px 16px",
                      background: m.bg,
                      border: `1px solid ${m.border}`,
                      animation: "rise .35s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        marginBottom: 9,
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{m.emoji}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: m.color }}>
                        {m.name}
                      </span>
                      <span style={{ fontSize: 8, color: "#333", marginLeft: 1 }}>{m.role}</span>
                    </div>
                    <div style={{ fontSize: 12.5, lineHeight: 1.85, color: "#B8BDD0" }}>
                      {msg.text}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Synthesis */}
        {synthesis && (
          <div
            style={{
              background: "linear-gradient(135deg,rgba(0,212,255,.05),rgba(201,111,255,.05))",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 12,
              padding: "16px 18px",
              marginTop: 6,
              animation: "rise .4s ease",
            }}
          >
            <div style={{ fontSize: 8, color: "#666", letterSpacing: "1px", marginBottom: 8 }}>
              ⚖️ COUNCIL SYNTHESIS
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.85, color: "#CDD2E4", fontStyle: "italic" }}>
              {synthesis}
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {typing && messages.length > 0 && (
          <div style={{ padding: "8px 14px", opacity: 0.5 }}>
            <span style={{ fontSize: 10, color: M[typing]?.color }}>
              {M[typing]?.name} is thinking...
            </span>
          </div>
        )}

        {/* Actions */}
        {isDone && (
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              marginTop: 20,
            }}
          >
            <button
              onClick={anotherRound}
              style={{
                padding: "10px 22px",
                borderRadius: 9,
                border: "1px solid rgba(0,212,255,.3)",
                background: "rgba(0,212,255,.07)",
                color: "#00D4FF",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all .2s",
              }}
            >
              ↻ Another Round
            </button>
            <button
              onClick={reset}
              style={{
                padding: "10px 20px",
                borderRadius: 9,
                border: "1px solid rgba(255,255,255,.07)",
                background: "transparent",
                color: "#555",
                fontSize: 10,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              New Question
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <style>{`
        @keyframes rise { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:.2;transform:scale(.8)} 50%{opacity:1;transform:scale(1.3)} }
        textarea::placeholder { color: #1e2030; }
      `}</style>
    </div>
  )
}
