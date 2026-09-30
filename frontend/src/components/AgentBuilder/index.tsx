import { useEffect, useState } from "react"

interface Agent {
  id: string
  name: string
  persona: string
  emoji: string
  role: string
  instructions: string
  color: string
  is_public: boolean
  created_at: string | null
}

interface Skill {
  id: string
  name: string
  description: string
  instructions: string
  tags: string
  created_at: string | null
}

const COLORS = [
  "#00D4FF", "#C96FFF", "#FF5A6A", "#00FF9C",
  "#FFD700", "#FF8C42", "#7FFFD4", "#FF6EC7",
]

const EMOJIS = ["🤖", "🌐", "✨", "⚡", "🛠️", "🔮", "🎯", "🧠", "🦁", "🐉", "🌙", "🔥"]

const DEFAULT_FORM = {
  name: "",
  persona: "",
  emoji: "🤖",
  role: "",
  instructions: "",
  color: "#00D4FF",
  is_public: false,
}

type AgentForm = typeof DEFAULT_FORM

function apiUrl() {
  return import.meta.env.VITE_API_URL ?? ""
}
function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    "Content-Type": "application/json",
  }
}

export default function AgentBuilder() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [templates, setTemplates] = useState<AgentForm[]>([])
  const [form, setForm] = useState<AgentForm>({ ...DEFAULT_FORM })
  const [skillForm, setSkillForm] = useState({ name: "", description: "", instructions: "", tags: "" })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tab, setTab] = useState<"agents" | "skills">("agents")
  const [testInput, setTestInput] = useState("")
  const [testOutput, setTestOutput] = useState("")
  const [testingId, setTestingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [matchResult, setMatchResult] = useState<{ message: string; matched: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: load studio data once on mount.
  useEffect(() => {
    loadAgents()
    loadSkills()
    loadTemplates()
  }, [])

  async function loadAgents() {
    try {
      const res = await fetch(`${apiUrl()}/api/v1/agents/`, { headers: authHeaders() })
      if (res.ok) {
        const data = await res.json()
        setAgents(data.data ?? [])
      } else if (res.status !== 401) {
        setError("Failed to load agents.")
      }
    } catch {
      setError("Could not reach the server. Check your connection.")
    }
  }

  async function loadSkills() {
    try {
      const res = await fetch(`${apiUrl()}/api/v1/skills/`, { headers: authHeaders() })
      if (res.ok) {
        const data = await res.json()
        setSkills(data.data ?? [])
      } else if (res.status !== 401) {
        setError("Failed to load skills.")
      }
    } catch {
      setError("Could not reach the server. Check your connection.")
    }
  }

  async function loadTemplates() {
    try {
      const res = await fetch(`${apiUrl()}/api/v1/agents/templates`, { headers: authHeaders() })
      if (res.ok) {
        const data = await res.json()
        setTemplates(data.data ?? [])
      } else if (res.status !== 401) {
        setError("Failed to load agent templates.")
      }
    } catch {
      setError("Could not reach the server. Check your connection.")
    }
  }

  async function saveAgent() {
    if (!form.name.trim() || !form.instructions.trim()) return
    setSaving(true)
    setError(null)
    try {
      const url = editingId
        ? `${apiUrl()}/api/v1/agents/${editingId}`
        : `${apiUrl()}/api/v1/agents/`
      const method = editingId ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setForm({ ...DEFAULT_FORM })
        setEditingId(null)
        await loadAgents()
      } else {
        const body = await res.json().catch(() => null)
        setError(body?.detail ?? `Failed to save agent (${res.status}).`)
      }
    } catch {
      setError("Could not reach the server. Check your connection.")
    }
    setSaving(false)
  }

  async function deleteAgent(id: string) {
    if (!window.confirm("Delete this agent? This cannot be undone.")) return
    setError(null)
    try {
      const res = await fetch(`${apiUrl()}/api/v1/agents/${id}`, { method: "DELETE", headers: authHeaders() })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setError(body?.detail ?? `Failed to delete agent (${res.status}).`)
        return
      }
    } catch {
      setError("Could not reach the server. Check your connection.")
      return
    }
    await loadAgents()
  }

  async function saveSkill() {
    if (!skillForm.name.trim() || !skillForm.instructions.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`${apiUrl()}/api/v1/skills/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(skillForm),
      })
      if (res.ok) {
        setSkillForm({ name: "", description: "", instructions: "", tags: "" })
        await loadSkills()
      } else {
        const body = await res.json().catch(() => null)
        setError(body?.detail ?? `Failed to save skill (${res.status}).`)
      }
    } catch {
      setError("Could not reach the server. Check your connection.")
    }
    setSaving(false)
  }

  async function matchSkill(skillId: string) {
    setError(null)
    try {
      const res = await fetch(`${apiUrl()}/api/v1/skills/${skillId}/match`, {
        method: "POST",
        headers: authHeaders(),
      })
      if (res.ok) {
        const data = await res.json()
        setMatchResult({
          message: data.reasoning ?? "Skill matched.",
          matched: data.matched_agent_ids?.length ?? 0,
        })
        await loadAgents()
      } else {
        const body = await res.json().catch(() => null)
        setError(body?.detail ?? `Skill matching failed (${res.status}).`)
      }
    } catch {
      setError("Could not reach the server. Check your connection.")
    }
  }

  async function testAgent(agent: Agent) {
    if (!testInput.trim()) return
    setTestingId(agent.id)
    setTestOutput("")
    setError(null)
    try {
      const res = await fetch(`${apiUrl()}/api/v1/council/query`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ question: testInput, round: 0 }),
      })
      if (res.ok) {
        const data = await res.json()
        const agentKey = Object.keys(data.responses ?? {})[0]
        setTestOutput(data.responses?.[agentKey] ?? "No response.")
      } else {
        const body = await res.json().catch(() => null)
        setError(body?.detail ?? `Test failed (${res.status}).`)
      }
    } catch {
      setError("Could not reach the server. Check your connection.")
    }
    setTestingId(null)
  }

  function startEdit(agent: Agent) {
    setEditingId(agent.id)
    setForm({
      name: agent.name,
      persona: agent.persona,
      emoji: agent.emoji,
      role: agent.role,
      instructions: agent.instructions,
      color: agent.color,
      is_public: agent.is_public,
    })
    setTab("agents")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function applyTemplate(template: AgentForm) {
    setEditingId(null)
    setForm({ ...template, is_public: false })
    setTab("agents")
    window.scrollTo({ top: 0, behavior: "smooth" })
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
    container: { maxWidth: 860, margin: "0 auto", padding: "24px 16px 80px" },
    card: {
      background: "rgba(255,255,255,.025)",
      border: "1px solid rgba(255,255,255,.07)",
      borderRadius: 14,
      padding: 20,
      marginBottom: 16,
    },
    label: { fontSize: 9, color: "#444", letterSpacing: ".8px", marginBottom: 6, display: "block" as const },
    input: {
      width: "100%",
      background: "rgba(255,255,255,.04)",
      border: "1px solid rgba(255,255,255,.08)",
      borderRadius: 8,
      padding: "9px 12px",
      color: "#DDE0EC",
      fontSize: 12,
      outline: "none",
      fontFamily: "inherit",
      boxSizing: "border-box" as const,
    },
    btn: (active?: boolean) => ({
      padding: "9px 18px",
      borderRadius: 8,
      border: active ? "none" : "1px solid rgba(255,255,255,.1)",
      background: active ? "linear-gradient(135deg,#00D4FF,#C96FFF)" : "transparent",
      color: active ? "#000" : "#666",
      fontSize: 11,
      fontWeight: 700,
      cursor: "pointer",
      fontFamily: "inherit",
      letterSpacing: ".3px",
    }),
  }

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 22 }}>🤖</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Agent Studio</div>
            <div style={{ fontSize: 8, color: "#555", letterSpacing: "1px" }}>BUILD YOUR AI TEAM</div>
          </div>
        </div>
        <div style={{ fontSize: 10, color: "#333" }}>{agents.length} agents · {skills.length} skills</div>
      </div>

      <div style={S.container}>
        {/* Error banner */}
        {error && (
          <div
            style={{
              background: "rgba(255,90,106,.08)",
              border: "1px solid rgba(255,90,106,.25)",
              borderRadius: 9,
              padding: "10px 14px",
              marginBottom: 16,
              fontSize: 11,
              color: "#FF5A6A",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{ ...S.btn(false), padding: "2px 8px", fontSize: 9, color: "#FF5A6A", flexShrink: 0 }}
            >
              ×
            </button>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["agents", "skills"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={S.btn(tab === t)}>
              {t === "agents" ? "🤖 Agents" : "⚡ Skills"}
            </button>
          ))}
        </div>

        {/* ── AGENTS TAB ── */}
        {tab === "agents" && (
          <>
            {templates.length > 0 && (
              <div style={S.card}>
                <div style={{ fontSize: 10, color: "#888", marginBottom: 10, fontWeight: 600 }}>
                  Start from a template
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {templates.map((template) => (
                    <div
                      key={template.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        padding: "12px 14px",
                        border: "1px solid rgba(255,255,255,.07)",
                        borderRadius: 10,
                        background: "rgba(255,255,255,.02)",
                      }}
                    >
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ fontSize: 20 }}>{template.emoji}</span>
                        <div>
                          <div style={{ fontSize: 12, color: "#DDE0EC", fontWeight: 700 }}>
                            {template.persona}
                          </div>
                          <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>
                            {template.role}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => applyTemplate(template)}
                        style={{ ...S.btn(false), padding: "6px 12px", fontSize: 9, color: "#0A66C2" }}
                      >
                        Use template
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Build form */}
            <div style={S.card}>
              <div style={{ fontSize: 10, color: "#888", marginBottom: 16, fontWeight: 600 }}>
                {editingId ? "✏️ Edit Agent" : "✨ Create New Agent"}
              </div>

              {/* Emoji + Color row */}
              <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={S.label}>EMOJI</label>
                  <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        onClick={() => setForm((f) => ({ ...f, emoji: e }))}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 7,
                          border: form.emoji === e ? "1.5px solid #00D4FF" : "1px solid rgba(255,255,255,.08)",
                          background: form.emoji === e ? "rgba(0,212,255,.1)" : "transparent",
                          cursor: "pointer",
                          fontSize: 16,
                        }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={S.label}>ACCENT COLOR</label>
                  <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setForm((f) => ({ ...f, color: c }))}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: c,
                          border: form.color === c ? "2px solid #fff" : "2px solid transparent",
                          cursor: "pointer",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Name + Persona + Role */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                {[
                  { key: "name", label: "INTERNAL NAME", placeholder: "e.g. my-strategist" },
                  { key: "persona", label: "FRIENDLY NAME", placeholder: "e.g. Marcus" },
                  { key: "role", label: "ROLE TITLE", placeholder: "e.g. Growth Strategist" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label style={S.label}>{label}</label>
                    <input
                      value={form[key as keyof typeof form] as string}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      style={S.input}
                    />
                  </div>
                ))}
              </div>

              {/* Instructions */}
              <div style={{ marginBottom: 14 }}>
                <label style={S.label}>AGENT INSTRUCTIONS (SYSTEM PROMPT)</label>
                <textarea
                  value={form.instructions}
                  onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
                  placeholder={`Describe how this agent should think and respond.\n\nExample: "You are Marcus, a growth strategist who specializes in go-to-market strategy for B2B SaaS companies. You speak with authority but back every claim with data. You always end with a specific next action."`}
                  rows={5}
                  style={{ ...S.input, resize: "vertical" as const, lineHeight: 1.65 }}
                />
              </div>

              {/* Public toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <button
                  onClick={() => setForm((f) => ({ ...f, is_public: !f.is_public }))}
                  style={{
                    width: 36,
                    height: 20,
                    borderRadius: 10,
                    background: form.is_public ? "rgba(0,212,255,.3)" : "rgba(255,255,255,.08)",
                    border: "none",
                    cursor: "pointer",
                    position: "relative" as const,
                    transition: "background .2s",
                  }}
                >
                  <div style={{
                    position: "absolute" as const,
                    top: 3,
                    left: form.is_public ? 18 : 3,
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: form.is_public ? "#00D4FF" : "#333",
                    transition: "left .2s",
                  }} />
                </button>
                <span style={{ fontSize: 10, color: "#555" }}>Make public (shareable with community)</span>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={saveAgent}
                  disabled={saving || !form.name.trim() || !form.instructions.trim()}
                  style={S.btn(true)}
                >
                  {saving ? "Saving..." : editingId ? "Update Agent" : "Create Agent"}
                </button>
                {editingId && (
                  <button
                    onClick={() => { setEditingId(null); setForm({ ...DEFAULT_FORM }) }}
                    style={S.btn(false)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Test panel */}
            {agents.length > 0 && (
              <div style={S.card}>
                <div style={{ fontSize: 9, color: "#444", letterSpacing: ".8px", marginBottom: 10 }}>
                  🧪 TEST AN AGENT
                </div>
                <input
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Enter a test question or scenario..."
                  style={{ ...S.input, marginBottom: 10 }}
                />
                {testOutput && (
                  <div
                    style={{
                      background: "rgba(0,255,156,.05)",
                      border: "1px solid rgba(0,255,156,.15)",
                      borderRadius: 9,
                      padding: "12px 14px",
                      fontSize: 12,
                      lineHeight: 1.75,
                      color: "#B8BDD0",
                      marginBottom: 10,
                    }}
                  >
                    {testOutput}
                  </div>
                )}
              </div>
            )}

            {/* Match result */}
            {matchResult && (
              <div
                style={{
                  background: "rgba(201,111,255,.07)",
                  border: "1px solid rgba(201,111,255,.2)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  marginBottom: 14,
                  fontSize: 11,
                  color: "#C96FFF",
                }}
              >
                ⚡ Skill matched to {matchResult.matched} agent(s): {matchResult.message}
                <button
                  onClick={() => setMatchResult(null)}
                  style={{ ...S.btn(false), padding: "2px 8px", marginLeft: 10, fontSize: 9 }}
                >
                  ×
                </button>
              </div>
            )}

            {/* Agent list */}
            {agents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#333", fontSize: 12 }}>
                No agents yet. Create your first agent above.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    style={{
                      background: `${agent.color}0D`,
                      border: `1px solid ${agent.color}30`,
                      borderRadius: 12,
                      padding: "14px 16px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 22 }}>{agent.emoji}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: agent.color }}>
                            {agent.persona}
                          </div>
                          <div style={{ fontSize: 9, color: "#444", marginTop: 1 }}>{agent.role}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => testAgent(agent)}
                          disabled={testingId === agent.id || !testInput.trim()}
                          style={{ ...S.btn(false), padding: "5px 12px", fontSize: 9 }}
                        >
                          {testingId === agent.id ? "Testing..." : "Test"}
                        </button>
                        <button
                          onClick={() => startEdit(agent)}
                          style={{ ...S.btn(false), padding: "5px 12px", fontSize: 9 }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteAgent(agent.id)}
                          style={{ ...S.btn(false), padding: "5px 12px", fontSize: 9, color: "#FF5A6A" }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: "#555", marginTop: 8, lineHeight: 1.5 }}>
                      {agent.instructions.slice(0, 140)}
                      {agent.instructions.length > 140 ? "..." : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── SKILLS TAB ── */}
        {tab === "skills" && (
          <>
            <div style={S.card}>
              <div style={{ fontSize: 10, color: "#888", marginBottom: 16, fontWeight: 600 }}>
                ⚡ Add New Skill
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={S.label}>SKILL NAME</label>
                  <input
                    value={skillForm.name}
                    onChange={(e) => setSkillForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Cold Email Writing"
                    style={S.input}
                  />
                </div>
                <div>
                  <label style={S.label}>TAGS (comma-separated)</label>
                  <input
                    value={skillForm.tags}
                    onChange={(e) => setSkillForm((f) => ({ ...f, tags: e.target.value }))}
                    placeholder="sales, writing, outreach"
                    style={S.input}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={S.label}>DESCRIPTION</label>
                <input
                  value={skillForm.description}
                  onChange={(e) => setSkillForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="What does this skill enable the agent to do?"
                  style={S.input}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={S.label}>SKILL INSTRUCTIONS</label>
                <textarea
                  value={skillForm.instructions}
                  onChange={(e) => setSkillForm((f) => ({ ...f, instructions: e.target.value }))}
                  placeholder="Detailed instructions for applying this skill. These will be injected into matching agents' prompts."
                  rows={4}
                  style={{ ...S.input, resize: "vertical" as const, lineHeight: 1.65 }}
                />
              </div>
              <button
                onClick={saveSkill}
                disabled={saving || !skillForm.name.trim() || !skillForm.instructions.trim()}
                style={S.btn(true)}
              >
                {saving ? "Saving..." : "Add Skill + Auto-Match Agents"}
              </button>
            </div>

            {skills.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#333", fontSize: 12 }}>
                No skills yet. Add skills and they'll be auto-matched to your agents.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    style={{
                      background: "rgba(255,255,255,.02)",
                      border: "1px solid rgba(255,255,255,.07)",
                      borderRadius: 12,
                      padding: "14px 16px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#C96FFF", marginBottom: 2 }}>
                          ⚡ {skill.name}
                        </div>
                        <div style={{ fontSize: 9, color: "#444" }}>{skill.tags}</div>
                      </div>
                      <button
                        onClick={() => matchSkill(skill.id)}
                        style={{ ...S.btn(false), padding: "5px 14px", fontSize: 9, color: "#C96FFF" }}
                      >
                        Re-Match
                      </button>
                    </div>
                    <div style={{ fontSize: 11, color: "#555", marginTop: 8, lineHeight: 1.5 }}>
                      {skill.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
