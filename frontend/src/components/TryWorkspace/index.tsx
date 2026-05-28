import NotFound from "@/components/Common/NotFound"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface WorkspacePreview {
  eyebrow: string
  headline: string
  subheadline: string
  primaryCta: string
  secondaryCta: string
  signals: string[]
  outcomes: Array<{
    title: string
    copy: string
  }>
  workflow: Array<{
    step: string
    title: string
    copy: string
  }>
  queue: Array<{
    company: string
    status: string
    detail: string
  }>
}

const financialOpsPreview: WorkspacePreview = {
  eyebrow: "DoneAi financial operations workspace",
  headline: "Financial operations workspace for owner-led teams",
  subheadline:
    "See how DoneAi turns invoice follow-up, cash visibility, and approval routing into a managed daily queue your team can trust.",
  primaryCta: "Preview the workspace",
  secondaryCta: "Request a guided pilot",
  signals: [
    "No login required",
    "Built around your current process",
    "Designed for finance and operations leaders",
  ],
  outcomes: [
    {
      title: "Invoice follow-up",
      copy: "Prioritize overdue accounts, draft professional reminders, and keep every next step tied to the customer record.",
    },
    {
      title: "Cash visibility",
      copy: "Turn scattered updates into a daily view of expected collections, open risks, and decisions that need an owner.",
    },
    {
      title: "Approval routing",
      copy: "Escalate exceptions with the context a manager needs, without forcing the finance team to rewrite the same summary.",
    },
  ],
  workflow: [
    {
      step: "01",
      title: "Connect the queue",
      copy: "DoneAi uses your current process and starts with a narrow, agreed workflow instead of asking the team to replace tools on day one.",
    },
    {
      step: "02",
      title: "Review AI-prepared actions",
      copy: "The workspace drafts follow-ups, flags risk, and explains why each item is in the queue before anyone sends a message.",
    },
    {
      step: "03",
      title: "Approve, send, and track",
      copy: "Operators keep control. DoneAi records outcomes, updates status, and makes the next business action clear.",
    },
  ],
  queue: [
    {
      company: "Northstar Trading",
      status: "Ready for review",
      detail:
        "$18,420 invoice is 12 days overdue. Draft reminder prepared with account history and payment link.",
    },
    {
      company: "Crescent Foods",
      status: "Needs approval",
      detail:
        "Payment plan request detected. Summary prepared for finance lead before response.",
    },
    {
      company: "Harbor Clinics",
      status: "Follow-up scheduled",
      detail:
        "Promise-to-pay logged for Friday. DoneAi will reopen the item if payment is not received.",
    },
  ],
}

const financialOpsWorkspaceId = "financial_ops-2940387048"

function getWorkspacePreview(workspaceId: string): WorkspacePreview | null {
  if (workspaceId === financialOpsWorkspaceId) {
    return financialOpsPreview
  }

  return null
}

export default function TryWorkspace({ workspaceId }: { workspaceId: string }) {
  const workspace = getWorkspacePreview(workspaceId)

  if (!workspace) {
    return <NotFound />
  }

  return (
    <main className="min-h-screen bg-[#071016] text-slate-50">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.24),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.16),transparent_28%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-[0.28em] text-teal-200 uppercase">
                DoneAi
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Customer workspace preview
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {workspace.signals.map((signal) => (
                <Badge
                  key={signal}
                  variant="outline"
                  className="border-white/15 bg-white/5 px-3 py-1 text-slate-200"
                >
                  {signal}
                </Badge>
              ))}
            </div>
          </header>

          <div className="grid gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
            <div>
              <Badge className="border-teal-300/20 bg-teal-300/10 text-teal-100">
                {workspace.eyebrow}
              </Badge>
              <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl lg:text-6xl">
                {workspace.headline}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                {workspace.subheadline}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-teal-300 text-slate-950 hover:bg-teal-200"
                >
                  <a href="#workspace-preview">{workspace.primaryCta}</a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  <a href="mailto:hello@doneai.agency?subject=DoneAi%20financial%20operations%20pilot">
                    {workspace.secondaryCta}
                  </a>
                </Button>
              </div>
            </div>

            <Card
              id="workspace-preview"
              className="border-white/10 bg-slate-950/70 py-0 shadow-2xl shadow-black/30 backdrop-blur"
            >
              <CardContent className="p-0">
                <div className="border-b border-white/10 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Today&apos;s finance queue
                      </p>
                      <p className="text-xs text-slate-400">
                        Sample workspace preview
                      </p>
                    </div>
                    <Badge className="bg-emerald-400/10 text-emerald-200">
                      3 actions ready
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3 p-5">
                  {workspace.queue.map((item) => (
                    <div
                      key={item.company}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-medium text-white">
                            {item.company}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-300">
                            {item.detail}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-medium text-teal-100">
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-14 sm:px-8 lg:grid-cols-3 lg:px-10">
        {workspace.outcomes.map((outcome) => (
          <Card key={outcome.title} className="border-white/10 bg-white/[0.03]">
            <CardContent className="p-6">
              <p className="text-lg font-semibold text-white">
                {outcome.title}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {outcome.copy}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 sm:px-8 lg:px-10">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 lg:p-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-[0.22em] text-teal-200 uppercase">
              How the pilot works
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
              Clear enough for a prospect. Controlled enough for a finance team.
            </h2>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {workspace.workflow.map((step) => (
              <div
                key={step.step}
                className="rounded-2xl border border-white/10 bg-slate-950/55 p-5"
              >
                <p className="text-sm font-semibold text-teal-200">
                  {step.step}
                </p>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {step.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
