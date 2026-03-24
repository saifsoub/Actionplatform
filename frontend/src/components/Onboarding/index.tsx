import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"

const ROLES = ["Founder / CEO", "Product Manager", "Engineer", "Investor", "Consultant", "Creator", "Student", "Other"]
const DOMAINS = ["SaaS / Tech", "E-commerce", "Finance / Fintech", "Healthcare", "Real Estate", "Education", "Media / Content", "Web3 / Crypto", "Other"]

interface ProfileData {
  role: string
  domain: string
  biggest_challenge: string
  goals: string
}

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<ProfileData>({
    role: "",
    domain: "",
    biggest_challenge: "",
    goals: "",
  })
  const [saving, setSaving] = useState(false)

  const steps = [
    {
      key: "role" as const,
      title: "What best describes you?",
      subtitle: "Your council will calibrate their advice to your context.",
      type: "chips",
      options: ROLES,
    },
    {
      key: "domain" as const,
      title: "What domain are you operating in?",
      subtitle: "This helps Cipher, Atlas, and Kai stay relevant to your world.",
      type: "chips",
      options: DOMAINS,
    },
    {
      key: "biggest_challenge" as const,
      title: "What's your biggest challenge right now?",
      subtitle: "One sentence is enough. The council will remember this.",
      type: "text",
      placeholder: "e.g. Finding product-market fit while keeping the team motivated…",
    },
    {
      key: "goals" as const,
      title: "What do you want to achieve in the next 90 days?",
      subtitle: "Sage will anchor every daily briefing to this.",
      type: "text",
      placeholder: "e.g. Launch v1, hit $10k MRR, close my first 5 enterprise deals…",
    },
  ]

  const currentStep = steps[step]
  const canProceed = data[currentStep.key]?.trim().length > 0

  async function finish() {
    setSaving(true)
    const token = localStorage.getItem("access_token")
    try {
      await fetch("/api/v1/profile/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...data, onboarding_complete: true }),
      })
      navigate({ to: "/" })
    } catch {
      setSaving(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #080814 0%, #0d0d1f 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: "520px", width: "100%" }}>

        {/* Progress bar */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "40px" }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              flex: 1,
              height: "3px",
              borderRadius: "999px",
              background: i <= step ? "#00D4FF" : "#1a1a3a",
              transition: "background 0.3s",
            }} />
          ))}
        </div>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ color: "#00D4FF", fontSize: "12px", fontWeight: "700", letterSpacing: "1.5px", marginBottom: "8px" }}>
            STEP {step + 1} OF {steps.length}
          </div>
          <h1 style={{ color: "white", fontSize: "26px", fontWeight: "800", margin: 0, lineHeight: "1.3" }}>
            {currentStep.title}
          </h1>
          <p style={{ color: "#888", marginTop: "8px", fontSize: "14px", lineHeight: "1.6" }}>
            {currentStep.subtitle}
          </p>
        </div>

        {/* Input */}
        {currentStep.type === "chips" && currentStep.options && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "32px" }}>
            {currentStep.options.map((opt) => {
              const selected = data[currentStep.key] === opt
              return (
                <button
                  key={opt}
                  onClick={() => setData({ ...data, [currentStep.key]: opt })}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "999px",
                    border: `1.5px solid ${selected ? "#00D4FF" : "#1a1a3a"}`,
                    background: selected ? "#00D4FF15" : "transparent",
                    color: selected ? "#00D4FF" : "#aaa",
                    fontSize: "13px",
                    fontWeight: selected ? "700" : "400",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        )}

        {currentStep.type === "text" && (
          <textarea
            value={data[currentStep.key]}
            onChange={(e) => setData({ ...data, [currentStep.key]: e.target.value })}
            placeholder={currentStep.placeholder}
            rows={4}
            style={{
              width: "100%",
              background: "#0a0a1a",
              border: "1.5px solid #1a1a3a",
              borderRadius: "12px",
              padding: "14px 16px",
              color: "white",
              fontSize: "14px",
              lineHeight: "1.6",
              resize: "vertical",
              outline: "none",
              fontFamily: "system-ui, sans-serif",
              marginBottom: "32px",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#00D4FF")}
            onBlur={(e) => (e.target.style.borderColor = "#1a1a3a")}
          />
        )}

        {/* Navigation */}
        <div style={{ display: "flex", gap: "12px" }}>
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                padding: "12px 24px",
                borderRadius: "10px",
                border: "1px solid #1a1a3a",
                background: "transparent",
                color: "#aaa",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Back
            </button>
          )}
          <button
            disabled={!canProceed || saving}
            onClick={() => step < steps.length - 1 ? setStep(step + 1) : finish()}
            style={{
              flex: 1,
              padding: "12px 24px",
              borderRadius: "10px",
              border: "none",
              background: canProceed ? "linear-gradient(135deg, #00D4FF, #0088bb)" : "#1a1a3a",
              color: canProceed ? "white" : "#555",
              fontSize: "14px",
              fontWeight: "700",
              cursor: canProceed ? "pointer" : "not-allowed",
              transition: "all 0.2s",
            }}
          >
            {saving ? "Saving…" : step < steps.length - 1 ? "Continue →" : "Enter the Platform →"}
          </button>
        </div>

        {/* Skip */}
        {step === 0 && (
          <button
            onClick={() => navigate({ to: "/" })}
            style={{
              width: "100%",
              marginTop: "16px",
              background: "none",
              border: "none",
              color: "#555",
              fontSize: "13px",
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            Skip for now
          </button>
        )}

      </div>
    </div>
  )
}
