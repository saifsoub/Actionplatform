import { useState, useRef, useEffect } from "react"

const M = {
  strategist: {
    name: "The Strategist",
    emoji: "🎯",
    color: "#00D4FF",
    role: "Strategic Systems Thinker",
    bg: "rgba(0,212,255,.08)",
    border: "rgba(0,212,255,.28)",
    r: [
      "The core strategic question isn't what you're asking — it's why this problem exists at all. Map the system: who benefits from the current state, and what's the switching cost? Your move should create asymmetric leverage, not incremental improvement. Position first, execute second.",
      "Before committing resources, validate your riskiest assumption with the cheapest possible experiment. The opportunity cost of being right slowly is far less than being confidently wrong. What's your 18-month moat if this works?",
      "Three scenarios: best case, realistic case, and the one nobody talks about — what if nothing changes? The status quo has inertia you're underestimating. Your strategy needs to work even if adoption is 30% of projections.",
      "Positioning precedes product. Define what you are not before you define what you are. The clearest strategic wins come from ruthless subtraction, not addition.",
    ],
  },
  visionary: {
    name: "The Visionary",
    emoji: "🔮",
    color: "#B14FFF",
    role: "Creative Ideator",
    bg: "rgba(177,79,255,.08)",
    border: "rgba(177,79,255,.28)",
    r: [
      "What if you inverted the whole problem — instead of solving for X, what if X solving for you was the actual product? The most interesting companies didn't compete in existing categories, they made their category irrelevant. What's the version of this that surprises even you?",
      "There's a deeper human truth hiding underneath this question. Strip away the technical framing — what does someone actually feel when this works perfectly? Design for that feeling, and the features will reveal themselves.",
      "I'm drawn to the tension here. The friction you're experiencing isn't a bug — it's the exact signal pointing toward the real breakthrough. Lean into the constraint; the constraint is the concept.",
      "The most powerful moves borrow from adjacent domains. What would a game designer do here? A filmmaker? A city planner? The answer you need probably already exists somewhere — just not in your industry.",
    ],
  },
  critic: {
    name: "The Critic",
    emoji: "⚡",
    color: "#FF4F6A",
    role: "Devil's Advocate",
    bg: "rgba(255,79,106,.08)",
    border: "rgba(255,79,106,.28)",
    r: [
      "The assumption I'd stress-test first: that the people who need this actually want it. There's a graveyard of elegant solutions to problems people tolerated just fine. Who specifically has told you this is painful enough to change behavior?",
      "You're solving for visibility, but the real bottleneck is probably adoption. Even if you build it perfectly, what's the theory of change that gets people to use it consistently? 'Build it and they'll come' is not a theory.",
      "I'll name the elephant: this depends on things outside your control. External dependencies are fine, but you need a Plan B that works even if the API changes, the partner walks, or the regulation shifts. Where's the hedge?",
      "Be honest about the timeline. Every ambitious plan runs 2–3× longer than expected. If your model breaks at month 6 with no revenue, this dies. Compress everything to its minimum viable version first.",
    ],
  },
  builder: {
    name: "The Builder",
    emoji: "🛠️",
    color: "#00FF8C",
    role: "Practical Executor",
    bg: "rgba(0,255,140,.08)",
    border: "rgba(0,255,140,.28)",
    r: [
      "Skip the full build — what's the smallest thing you could put in front of a real user this week? An hour of testing beats a month of theorizing. If you can't demo something in 7 days, the scope is still too large.",
      "Before architecture decisions, nail the core user flow end-to-end, even if it's mostly manual. Automate the bottlenecks after you know which ones actually hurt. Tech debt on features nobody uses is worse than no tech at all.",
      "Two concrete next actions: one you can do today, one that unblocks everything for next week. Everything else is planning theater. What's actually blocking you right now, specifically?",
      "Ship the ugly version. Perfection is a delay tactic. The feedback you get from a rough v1 in 10 days is worth more than the elegant v2 you launch in 3 months.",
    ],
  },
}

const ORDER = ["strategist", "visionary", "critic", "builder"] as const
type AgentId = (typeof ORDER)[number]

const SYNTH = [
  "The council converges on one thing: validate your core assumption this week with the smallest possible test before any architecture or strategy decisions lock you in. Real user feedback beats internal conviction every time.",
  "Despite different lenses, the council agrees: the bottleneck is not the idea, it's the first honest signal from the market. Strip the plan to its minimum, ship it ugly, and let reality do the editing.",
  "The synthesis is clear: there's a fatal assumption hiding underneath this challenge that nobody has tested yet. Until that assumption is proven or killed, everything else is premature. One week, one test, one answer.",
  "The council's verdict: stop planning, start probing. Leverage, boldness, evidence, action — all four agents point to the same first step: get it in front of a real person today.",
]

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

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
  const bottomRef = useRef<HTMLDivElement>(null)
  const roundRef = useRef(0)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, synthesis, typing])

  async function runRound() {
    setLoading(true)
    const r = roundRef.current
    setTyping(ORDER[0])
    for (let i = 0; i < ORDER.length; i++) {
      const id = ORDER[i]
      await sleep(950 + Math.random() * 750)
      setTyping(null)
      setMessages((prev) => [
        ...prev,
        { id: Math.random(), agent: id, text: M[id].r[r % M[id].r.length], round: r },
      ])
      setSpoke((prev) => ({ ...prev, [id]: true }))
      if (i < ORDER.length - 1) {
        await sleep(160)
        setTyping(ORDER[i + 1])
      }
    }
    await sleep(600)
    setSynthesis(SYNTH[r % SYNTH.length])
    roundRef.current = r + 1
    setRound(r + 1)
    setLoading(false)
    setTyping(null)
  }

  async function convene() {
    if (loading || !question.trim()) return
    setSession({ question })
    setMessages([])
    setSynthesis("")
    setSpoke({})
    roundRef.current = 0
    setRound(0)
    await runRound()
  }

  async function anotherRound() {
    if (loading) return
    setSpoke({})
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
    roundRef.current = 0
    setRound(0)
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
              background: "linear-gradient(135deg,rgba(0,212,255,.2),rgba(177,79,255,.2))",
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
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-.3px" }}>LLM Council</div>
            <div style={{ fontSize: 8, color: "#555", letterSpacing: "1px" }}>
              MULTI-AGENT DELIBERATION
            </div>
          </div>
        </div>
        <div style={{ fontSize: 9, color: "#252535" }}>Seif Alsoub · FTA UAE</div>
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "22px 16px 60px" }}>
        {/* Member Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 7,
            marginBottom: 22,
          }}
        >
          {ORDER.map((id) => {
            const m = M[id]
            const isTyping = typing === id
            return (
              <div
                key={id}
                style={{
                  padding: "12px 10px",
                  borderRadius: 11,
                  background: m.bg,
                  border: `1px solid ${isTyping ? m.color : m.border}`,
                  boxShadow: isTyping ? `0 0 20px ${m.color}28` : "none",
                  transition: "all .3s",
                }}
              >
                <div style={{ fontSize: 18, marginBottom: 5 }}>{m.emoji}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: m.color, marginBottom: 2 }}>
                  {m.name}
                </div>
                <div style={{ fontSize: 8, color: "#555", lineHeight: 1.3 }}>{m.role}</div>
                {spoke[id] && !isTyping && (
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: m.color,
                      opacity: 0.7,
                      marginTop: 6,
                    }}
                  />
                )}
                {isTyping && (
                  <div style={{ display: "flex", gap: 3, marginTop: 6 }}>
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
              padding: 18,
              marginBottom: 18,
            }}
          >
            <div style={{ fontSize: 9, color: "#444", letterSpacing: ".9px", marginBottom: 9 }}>
              BRING YOUR QUESTION TO THE COUNCIL
            </div>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") convene()
              }}
              placeholder="What decision, challenge, or idea should the council deliberate on?"
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
                  padding: "9px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: question.trim()
                    ? "linear-gradient(135deg,#00D4FF,#B14FFF)"
                    : "rgba(255,255,255,.05)",
                  color: question.trim() ? "#000" : "#333",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: question.trim() ? "pointer" : "not-allowed",
                  letterSpacing: ".4px",
                  fontFamily: "inherit",
                }}
              >
                CONVENE COUNCIL →
              </button>
            </div>
          </div>
        )}

        {/* Session banner */}
        {session && (
          <div
            style={{
              background: "rgba(255,255,255,.02)",
              border: "1px solid rgba(255,255,255,.06)",
              borderRadius: 10,
              padding: "11px 14px",
              marginBottom: 16,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 14,
            }}
          >
            <div>
              <div style={{ fontSize: 8, color: "#333", letterSpacing: ".8px", marginBottom: 3 }}>
                DELIBERATING ON
              </div>
              <div style={{ fontSize: 12, color: "#999", lineHeight: 1.5 }}>{session.question}</div>
            </div>
            <button
              onClick={reset}
              style={{
                padding: "4px 11px",
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,.07)",
                background: "transparent",
                color: "#444",
                fontSize: 9,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              New ↺
            </button>
          </div>
        )}

        {/* Round groups */}
        {Object.entries(roundGroups).map(([r, msgs]) => (
          <div key={r}>
            {parseInt(r) > 0 && (
              <div style={{ textAlign: "center", margin: "16px 0 12px" }}>
                <span
                  style={{
                    fontSize: 8,
                    color: "#252535",
                    letterSpacing: "1.2px",
                    padding: "3px 12px",
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
                      borderRadius: 11,
                      padding: "13px 15px",
                      background: m.bg,
                      border: `1px solid ${m.border}`,
                      animation: "rise .35s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontSize: 13 }}>{m.emoji}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: m.color }}>
                        {m.name}
                      </span>
                      <span style={{ fontSize: 8, color: "#3a3a4a", marginLeft: 2 }}>{m.role}</span>
                    </div>
                    <div style={{ fontSize: 12, lineHeight: 1.8, color: "#B8BDD0" }}>
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
              background:
                "linear-gradient(135deg,rgba(0,212,255,.05),rgba(177,79,255,.05))",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 11,
              padding: "14px 16px",
              marginTop: 4,
            }}
          >
            <div
              style={{ fontSize: 8, color: "#666", letterSpacing: "1px", marginBottom: 7 }}
            >
              ⚖️ COUNCIL SYNTHESIS
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.8, color: "#CDD2E4", fontStyle: "italic" }}>
              {synthesis}
            </div>
          </div>
        )}

        {/* Thinking */}
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
              gap: 9,
              justifyContent: "center",
              marginTop: 18,
            }}
          >
            <button
              onClick={anotherRound}
              style={{
                padding: "9px 20px",
                borderRadius: 9,
                border: "1px solid rgba(0,212,255,.3)",
                background: "rgba(0,212,255,.07)",
                color: "#00D4FF",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              ↻ Another Round
            </button>
            <button
              onClick={reset}
              style={{
                padding: "9px 18px",
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
        textarea::placeholder { color: #1a1c28; }
      `}</style>
    </div>
  )
}
