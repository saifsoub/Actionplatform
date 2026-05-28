import { useState, useRef, useEffect } from "react"

// ── Live price ticker ─────────────────────────────────────────────────────────
interface PriceData {
  btc: number | null
  eth: number | null
  sol: number | null
  btc_change: number | null
  eth_change: number | null
  sol_change: number | null
  fear_greed: number | null
  fear_label: string
}

function useCryptoPrices(): PriceData {
  const [data, setData] = useState<PriceData>({
    btc: null, eth: null, sol: null,
    btc_change: null, eth_change: null, sol_change: null,
    fear_greed: null, fear_label: "",
  })

  useEffect(() => {
    async function fetchPrices() {
      try {
        const [priceRes, fngRes] = await Promise.all([
          fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true"),
          fetch("https://api.alternative.me/fng/"),
        ])
        const priceJson = await priceRes.json()
        const fngJson = await fngRes.json()
        setData({
          btc: priceJson.bitcoin?.usd ?? null,
          eth: priceJson.ethereum?.usd ?? null,
          sol: priceJson.solana?.usd ?? null,
          btc_change: priceJson.bitcoin?.usd_24h_change ?? null,
          eth_change: priceJson.ethereum?.usd_24h_change ?? null,
          sol_change: priceJson.solana?.usd_24h_change ?? null,
          fear_greed: fngJson.data?.[0]?.value ? Number(fngJson.data[0].value) : null,
          fear_label: fngJson.data?.[0]?.value_classification ?? "",
        })
      } catch { /* network unavailable */ }
    }
    fetchPrices()
    const interval = setInterval(fetchPrices, 60_000)
    return () => clearInterval(interval)
  }, [])

  return data
}

function PriceTicker() {
  const d = useCryptoPrices()
  const fmt = (n: number | null) => n == null ? "—" : `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
  const chg = (n: number | null) => n == null ? "" : `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`
  const chgColor = (n: number | null) => n == null ? "#666" : n >= 0 ? "#00FF9C" : "#FF5A6A"
  const fgColor = (v: number | null) => {
    if (v == null) return "#666"
    if (v <= 25) return "#FF5A6A"
    if (v <= 45) return "#FFA500"
    if (v <= 55) return "#FFD700"
    return "#00FF9C"
  }

  return (
    <div style={{
      background: "rgba(255,215,0,.03)",
      borderBottom: "1px solid rgba(255,215,0,.08)",
      padding: "8px 24px",
      display: "flex",
      gap: "24px",
      alignItems: "center",
      overflowX: "auto",
      fontSize: "11px",
      flexWrap: "nowrap",
    }}>
      {[
        { symbol: "BTC", price: d.btc, change: d.btc_change },
        { symbol: "ETH", price: d.eth, change: d.eth_change },
        { symbol: "SOL", price: d.sol, change: d.sol_change },
      ].map(({ symbol, price, change }) => (
        <div key={symbol} style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          <span style={{ color: "#554400", fontWeight: "700" }}>{symbol}</span>
          <span style={{ color: "#ccc", fontWeight: "600" }}>{fmt(price)}</span>
          <span style={{ color: chgColor(change) }}>{chg(change)}</span>
        </div>
      ))}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
        <span style={{ color: "#554400" }}>Fear &amp; Greed</span>
        <span style={{ color: fgColor(d.fear_greed), fontWeight: "700" }}>
          {d.fear_greed != null ? `${d.fear_greed} · ${d.fear_label}` : "—"}
        </span>
      </div>
    </div>
  )
}

const STARTER_PROMPTS = [
  "What signals should I watch in a crypto bear market?",
  "How do I evaluate a new DeFi protocol for safety?",
  "What's the relationship between Bitcoin cycles and altcoin seasons?",
  "How should I think about portfolio allocation in crypto?",
  "What are the red flags of a rug pull or exit scam?",
  "Explain liquid staking and its risks simply.",
]

// Compelling mock responses for demo mode
const MOCK_RESPONSES = [
  "The signal I'd watch first is exchange outflows — when Bitcoin moves off exchanges in large volumes, it typically precedes or confirms accumulation phases. Combine that with funding rates approaching zero or negative on perpetuals, and you have two confirming signals for potential bottoms. The market bottom is rarely where panic peaks; it's usually a few weeks after, when nobody wants to talk about crypto anymore.",
  "Before anything else, I audit three things: the smart contract audit (who did it and when), the token distribution (is there a whale concentration that can dump), and whether the team is doxxed or has skin in the game. A 15% team allocation vesting over 4 years tells a different story than a 30% allocation unlocking in 6 months. Always read the tokenomics appendix that nobody reads.",
  "Bitcoin dominance is the tell. When BTC dominance peaks and starts declining, capital rotates into Ethereum, then large caps, then mid caps, then small caps — in that rough order, with weeks of lag between each wave. Most people catch the Bitcoin move and miss the altseason because they wait for certainty, which only arrives after the easy money is gone.",
  "Position sizing matters more than asset selection. I'd rather see you in 3-5 high-conviction positions with 10-20% each than spread across 30 coins you barely understand. Volatility in crypto can wipe 80% in months — the math only works if you can hold through drawdowns without needing the capital.",
  "Red flags: anonymous team with no track record, no third-party audit or an audit by an unknown firm, token unlock schedule that benefits insiders in year one, unrealistic APY that requires new money to sustain, and social pressure to buy without clear use case or revenue model. If you can't explain in two sentences how the protocol makes money, that's a flag.",
  "Liquid staking lets you earn staking rewards while keeping liquidity — you deposit ETH and receive a liquid token representing your stake. The risk is the peg: in a stress scenario, that liquid token can trade at a discount to the underlying asset, and if you're using it as collateral in DeFi, a depegging event can cascade into liquidations. The protocol risk layered on top of the underlying chain is the hidden exposure most people underestimate.",
]

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

interface Message {
  id: number
  role: "user" | "assistant"
  text: string
}

export default function Cipher() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [usingAI, setUsingAI] = useState(false)
  const [msgCount, setMsgCount] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  async function send(text?: string) {
    const q = (text ?? input).trim()
    if (!q || loading) return
    setInput("")
    const userMsg: Message = { id: Date.now(), role: "user", text: q }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)
    setMsgCount((n) => n + 1)

    let reply = ""

    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? ""
      const token = localStorage.getItem("access_token")
      const res = await fetch(`${apiUrl}/api/v1/council/query`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: `[Crypto/Web3 question for Cipher] ${q}`,
          round: msgCount,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        // Use atlas response as cipher's response (strategic tone fits)
        reply = data.responses?.atlas ?? data.synthesis ?? ""
        setUsingAI(true)
      }
    } catch { /* offline */ }

    if (!reply) {
      await sleep(1100 + Math.random() * 600)
      reply = MOCK_RESPONSES[msgCount % MOCK_RESPONSES.length]
    }

    setMessages((prev) => [...prev, { id: Date.now() + 1, role: "assistant", text: reply }])
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
      borderBottom: "1px solid rgba(255,215,0,.1)",
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
              background: "linear-gradient(135deg,rgba(255,215,0,.15),rgba(255,140,0,.1))",
              border: "1px solid rgba(255,215,0,.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            🔮
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Cipher</div>
            <div style={{ fontSize: 8, color: "#554400", letterSpacing: "1px" }}>CRYPTO INTELLIGENCE ORACLE</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {usingAI ? (
            <div style={{ fontSize: 8, color: "#00FF9C", letterSpacing: ".8px", padding: "3px 8px", border: "1px solid rgba(0,255,156,.25)", borderRadius: 20, background: "rgba(0,255,156,.06)" }}>
              ● AI POWERED
            </div>
          ) : (
            <div style={{ fontSize: 8, color: "#554400", letterSpacing: ".8px", padding: "3px 8px", border: "1px solid rgba(255,215,0,.1)", borderRadius: 20 }}>
              DEMO MODE
            </div>
          )}
        </div>
      </div>

      {/* Live price ticker */}
      <PriceTicker />

      {/* Messages */}
      <div style={{ flex: 1, maxWidth: 760, width: "100%", margin: "0 auto", padding: "24px 16px 100px" }}>
        {messages.length === 0 && (
          <>
            {/* Intro */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔮</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#FFD700", marginBottom: 8, letterSpacing: "-.5px" }}>
                Cipher
              </div>
              <div style={{ fontSize: 12, color: "#554400", maxWidth: 420, margin: "0 auto", lineHeight: 1.7 }}>
                Your AI crypto intelligence advisor. Ask about markets, DeFi, tokenomics, Web3 strategy, portfolio thinking, and more. I help you think clearly — not predict the future.
              </div>
            </div>

            {/* Starter prompts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
              {STARTER_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  style={{
                    padding: "12px 14px",
                    background: "rgba(255,215,0,.04)",
                    border: "1px solid rgba(255,215,0,.12)",
                    borderRadius: 10,
                    color: "#887700",
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left" as const,
                    lineHeight: 1.45,
                    transition: "all .2s",
                  }}
                  onMouseEnter={(e) => {
                    const t = e.currentTarget
                    t.style.background = "rgba(255,215,0,.08)"
                    t.style.color = "#FFD700"
                  }}
                  onMouseLeave={(e) => {
                    const t = e.currentTarget
                    t.style.background = "rgba(255,215,0,.04)"
                    t.style.color = "#887700"
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Message thread */}
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
              {msg.role === "assistant" && (
                <div style={{ fontSize: 18, marginRight: 10, marginTop: 2 }}>🔮</div>
              )}
              <div
                style={{
                  maxWidth: "78%",
                  padding: "12px 15px",
                  borderRadius: msg.role === "user" ? "12px 12px 3px 12px" : "3px 12px 12px 12px",
                  background: msg.role === "user"
                    ? "rgba(255,215,0,.08)"
                    : "rgba(255,255,255,.03)",
                  border: msg.role === "user"
                    ? "1px solid rgba(255,215,0,.18)"
                    : "1px solid rgba(255,255,255,.06)",
                  fontSize: 12.5,
                  lineHeight: 1.8,
                  color: msg.role === "user" ? "#D4AC0D" : "#B8BDD0",
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", animation: "rise .3s ease" }}>
              <div style={{ fontSize: 18 }}>🔮</div>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#FFD700",
                    animation: `pulse 1s ease ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 9, color: "#443300" }}>Cipher is thinking...</span>
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
          borderTop: "1px solid rgba(255,215,0,.1)",
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
            placeholder="Ask Cipher about crypto markets, DeFi, Web3 strategy..."
            rows={2}
            style={{
              flex: 1,
              background: "rgba(255,215,0,.04)",
              border: "1px solid rgba(255,215,0,.12)",
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
            onClick={() => send()}
            disabled={loading || !input.trim()}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              background: input.trim() && !loading
                ? "linear-gradient(135deg,#FFD700,#FF8C42)"
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
        <div style={{ maxWidth: 760, margin: "4px auto 0", fontSize: 8, color: "#221800", textAlign: "center" as const }}>
          Not financial advice. Cipher helps you think — you make the decisions.
        </div>
      </div>

      <style>{`
        @keyframes rise { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:.2;transform:scale(.8)} 50%{opacity:1;transform:scale(1.4)} }
        textarea::placeholder { color: #332200; }
      `}</style>
    </div>
  )
}
