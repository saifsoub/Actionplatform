import { useState } from "react"

type Currency = "USD" | "AED"
type Tier = "free" | "pro" | "elite"

const PLANS = {
  free: {
    name: "Explorer",
    emoji: "🌱",
    usd: 0,
    aed: 0,
    color: "#00FF9C",
    desc: "Discover what AI advisors can do for you.",
    sessions: 3,
    agents: 0,
    features: [
      "3 council sessions / month",
      "Atlas, Nova, Reza & Kai (demo mode)",
      "Council synthesis",
      "Access to Sage daily briefing (limited)",
      "Community Q&A",
    ],
    missing: [
      "Real AI responses",
      "Custom agents",
      "Skills builder",
      "Cipher crypto oracle",
      "Unlimited Sage",
    ],
    cta: "Start Free",
    highlight: false,
  },
  pro: {
    name: "Operator",
    emoji: "⚡",
    usd: 40,
    aed: 149,
    color: "#00D4FF",
    desc: "For founders, strategists, and ambitious builders.",
    sessions: 50,
    agents: 10,
    features: [
      "50 council sessions / month",
      "Real Claude AI responses",
      "Full Atlas, Nova, Reza & Kai",
      "10 custom AI agents",
      "Skills builder + auto-matching",
      "Cipher — Crypto Oracle",
      "Sage daily briefings (unlimited)",
      "Priority support",
    ],
    missing: [
      "Unlimited custom agents",
      "Team sharing",
      "API access",
    ],
    cta: "Upgrade to Operator",
    highlight: true,
  },
  elite: {
    name: "Sovereign",
    emoji: "👑",
    usd: 120,
    aed: 449,
    color: "#C96FFF",
    desc: "Unlimited intelligence for teams and power users.",
    sessions: 9999,
    agents: 9999,
    features: [
      "Unlimited council sessions",
      "Real Claude AI (Opus 4.6)",
      "Unlimited custom agents",
      "Advanced skills + global library",
      "Cipher pro — live market data",
      "Sage — full daily intelligence",
      "Team workspaces (up to 10 seats)",
      "API access for integrations",
      "White-label agent exports",
      "Dedicated onboarding call",
    ],
    missing: [],
    cta: "Go Sovereign",
    highlight: false,
  },
}

const FAQS = [
  {
    q: "What are 'council sessions'?",
    a: "Each time you ask the council a question (and the four advisors — Atlas, Nova, Reza, and Kai — respond), that counts as one session. Each follow-up round counts as an additional session.",
  },
  {
    q: "What's the difference between demo mode and real AI?",
    a: "Demo mode uses our expertly crafted static responses that simulate real advisor personalities. Real AI mode connects to Claude Opus 4.6 — every response is unique, context-aware, and generated fresh for your specific question.",
  },
  {
    q: "What is Cipher?",
    a: "Cipher is your AI crypto oracle — a dedicated agent trained for crypto market analysis, DeFi strategy, Web3 trends, and portfolio risk assessment. Available on Operator and Sovereign plans.",
  },
  {
    q: "What is Sage?",
    a: "Sage is the platform's flagship daily intelligence agent. Every morning, Sage delivers a personalized briefing: market signals, decision frameworks, a thought-provoking challenge, and an action prompt. People come back to Sage every single day.",
  },
  {
    q: "Can I build agents and share them?",
    a: "Yes — on Operator and Sovereign plans, you can create custom agents with any instructions, assign skills, and make them public for the community to use.",
  },
  {
    q: "What's the refund policy?",
    a: "We offer a 7-day money-back guarantee, no questions asked. If the AI council doesn't add value in your first week, we'll refund you in full.",
  },
]

export default function Pricing() {
  const [currency, setCurrency] = useState<Currency>("USD")
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [hoveredTier, setHoveredTier] = useState<Tier | null>(null)

  const fmt = (plan: typeof PLANS.pro) => {
    const price = currency === "USD" ? plan.usd : plan.aed
    if (price === 0) return "Free"
    return currency === "USD" ? `$${price}` : `AED ${price}`
  }

  const S = {
    page: {
      minHeight: "100vh" as const,
      background: "#07090F",
      fontFamily: "'Inter',system-ui,sans-serif",
      color: "#E8EAF0",
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
      borderBottom: "1px solid rgba(255,255,255,.07)",
      backdropFilter: "blur(14px)" as const,
    },
  }

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 22 }}>💎</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Plans & Pricing</div>
            <div style={{ fontSize: 8, color: "#555", letterSpacing: "1px" }}>CHOOSE YOUR INTELLIGENCE TIER</div>
          </div>
        </div>

        {/* Currency Toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 30,
            padding: 3,
            gap: 2,
          }}
        >
          {(["USD", "AED"] as Currency[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              style={{
                padding: "5px 14px",
                borderRadius: 24,
                border: "none",
                background: currency === c ? "rgba(255,255,255,.12)" : "transparent",
                color: currency === c ? "#E8EAF0" : "#444",
                fontSize: 10,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                letterSpacing: ".5px",
                transition: "all .2s",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 16px 80px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-1px", marginBottom: 10 }}>
            Your AI advisory board,
            <br />
            <span
              style={{
                background: "linear-gradient(135deg,#00D4FF,#C96FFF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              on demand.
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#555", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
            Atlas, Nova, Reza, and Kai are waiting. Get strategic clarity, creative breakthroughs, honest critique, and a concrete action plan — in minutes.
          </div>
        </div>

        {/* Plan Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 16,
            marginBottom: 60,
          }}
        >
          {(Object.entries(PLANS) as [Tier, typeof PLANS.free][]).map(([tier, plan]) => (
            <div
              key={tier}
              onMouseEnter={() => setHoveredTier(tier)}
              onMouseLeave={() => setHoveredTier(null)}
              style={{
                background: plan.highlight
                  ? "rgba(0,212,255,.05)"
                  : "rgba(255,255,255,.02)",
                border: plan.highlight
                  ? "1px solid rgba(0,212,255,.3)"
                  : hoveredTier === tier
                  ? `1px solid ${plan.color}30`
                  : "1px solid rgba(255,255,255,.07)",
                borderRadius: 16,
                padding: "28px 22px",
                position: "relative" as const,
                transition: "all .3s",
                boxShadow: plan.highlight ? "0 0 40px rgba(0,212,255,.06)" : "none",
              }}
            >
              {plan.highlight && (
                <div
                  style={{
                    position: "absolute" as const,
                    top: -10,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "linear-gradient(135deg,#00D4FF,#C96FFF)",
                    color: "#000",
                    fontSize: 8,
                    fontWeight: 800,
                    letterSpacing: "1px",
                    padding: "4px 14px",
                    borderRadius: 20,
                  }}
                >
                  MOST POPULAR
                </div>
              )}

              <div style={{ fontSize: 24, marginBottom: 8 }}>{plan.emoji}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: plan.color, marginBottom: 4 }}>
                {plan.name}
              </div>
              <div style={{ fontSize: 10, color: "#444", marginBottom: 16, lineHeight: 1.5 }}>
                {plan.desc}
              </div>

              {/* Price */}
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-1.5px" }}>
                  {fmt(plan)}
                </span>
                {plan.usd > 0 && (
                  <span style={{ fontSize: 10, color: "#444", marginLeft: 6 }}>/ month</span>
                )}
              </div>

              {/* CTA */}
              <button
                style={{
                  width: "100%",
                  padding: "11px",
                  borderRadius: 9,
                  border: plan.highlight ? "none" : `1px solid ${plan.color}40`,
                  background: plan.highlight
                    ? "linear-gradient(135deg,#00D4FF,#C96FFF)"
                    : `${plan.color}12`,
                  color: plan.highlight ? "#000" : plan.color,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  letterSpacing: ".4px",
                  marginBottom: 22,
                  transition: "all .2s",
                }}
              >
                {plan.cta}
              </button>

              {/* Features */}
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 7 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                    <span style={{ color: plan.color, fontSize: 11, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 11, color: "#888", lineHeight: 1.45 }}>{f}</span>
                  </div>
                ))}
                {plan.missing.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                    <span style={{ color: "#2a2a3a", fontSize: 11, marginTop: 1 }}>✗</span>
                    <span style={{ fontSize: 11, color: "#2a2a3a", lineHeight: 1.45 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* The Agents Strip */}
        <div
          style={{
            background: "rgba(255,255,255,.02)",
            border: "1px solid rgba(255,255,255,.06)",
            borderRadius: 16,
            padding: "28px 24px",
            marginBottom: 48,
          }}
        >
          <div style={{ fontSize: 10, color: "#444", letterSpacing: "1px", marginBottom: 20, textAlign: "center" as const }}>
            MEET YOUR AI ADVISORY TEAM
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {[
              { emoji: "🌐", name: "Atlas", role: "Strategic Advisor", color: "#00D4FF", desc: "Maps the big picture. Finds leverage points. Challenges whether you're solving the right problem." },
              { emoji: "✨", name: "Nova", role: "Creative Visionary", color: "#C96FFF", desc: "Inverts problems. Finds hidden human truths. Borrows breakthroughs from unexpected domains." },
              { emoji: "⚡", name: "Reza", role: "Critical Analyst", color: "#FF5A6A", desc: "Stress-tests your assumptions. Names what nobody's saying. Forces you to face the real risks." },
              { emoji: "🛠️", name: "Kai", role: "Execution Lead", color: "#00FF9C", desc: "Cuts scope. Defines the next action. Ships the ugly version before the perfect one costs you the market." },
            ].map((a) => (
              <div key={a.name} style={{ textAlign: "center" as const }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{a.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: a.color, marginBottom: 2 }}>{a.name}</div>
                <div style={{ fontSize: 8, color: "#444", marginBottom: 8 }}>{a.role}</div>
                <div style={{ fontSize: 10, color: "#444", lineHeight: 1.55 }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Special Agents */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 48 }}>
          {[
            {
              emoji: "🔮",
              name: "Cipher",
              tagline: "Crypto Oracle",
              color: "#FFD700",
              badge: "OPERATOR+",
              desc: "Real-time crypto market analysis, DeFi strategy, Web3 trend radar, and portfolio risk assessment. Cipher doesn't predict the market — Cipher helps you think about it clearly.",
            },
            {
              emoji: "🧙",
              name: "Sage",
              tagline: "Your Daily Oracle",
              color: "#C96FFF",
              badge: "FLAGSHIP AGENT",
              desc: "Every morning, Sage delivers a personalized intelligence briefing: one signal to watch, one decision framework, one provocative question, and one action. People come back to Sage every single day.",
            },
          ].map((a) => (
            <div
              key={a.name}
              style={{
                background: `${a.color}08`,
                border: `1px solid ${a.color}28`,
                borderRadius: 14,
                padding: "20px 18px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 26 }}>{a.emoji}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: a.color }}>{a.name}</div>
                    <div style={{ fontSize: 9, color: "#444" }}>{a.tagline}</div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 7,
                    fontWeight: 800,
                    color: a.color,
                    letterSpacing: "1px",
                    padding: "3px 8px",
                    border: `1px solid ${a.color}35`,
                    borderRadius: 20,
                  }}
                >
                  {a.badge}
                </span>
              </div>
              <div style={{ fontSize: 11, color: "#666", lineHeight: 1.65 }}>{a.desc}</div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div>
          <div style={{ fontSize: 10, color: "#444", letterSpacing: "1px", marginBottom: 16, textAlign: "center" as const }}>
            FREQUENTLY ASKED QUESTIONS
          </div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            {FAQS.map((faq, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,.02)",
                  border: "1px solid rgba(255,255,255,.06)",
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: "transparent",
                    border: "none",
                    color: "#E8EAF0",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left" as const,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {faq.q}
                  <span style={{ color: "#444", fontSize: 14, transition: "transform .2s", transform: openFaq === i ? "rotate(180deg)" : "none" }}>
                    ↓
                  </span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 16px 14px", fontSize: 12, color: "#777", lineHeight: 1.7 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div style={{ textAlign: "center", marginTop: 40, fontSize: 10, color: "#2a2a3a" }}>
          7-day money-back guarantee · Cancel anytime · Prices shown excl. VAT
        </div>
      </div>
    </div>
  )
}
