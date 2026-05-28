import { createFileRoute } from "@tanstack/react-router"
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"

interface WorkspaceMetric {
  label: string
  value: string
}

interface WorkspaceStep {
  title: string
  description: string
}

interface WorkspaceContent {
  eyebrow: string
  headline: string
  summary: string
  metrics: WorkspaceMetric[]
  workflow: WorkspaceStep[]
}

interface TrustSignal {
  title: string
  description: string
  icon: LucideIcon
}

const WORKSPACES: Record<string, WorkspaceContent> = {
  "financial_ops-2940387048": {
    eyebrow: "Financial operations pilot workspace",
    headline: "AI operators for financial operations teams",
    summary:
      "Review invoices, reconcile exceptions, and prepare approvals with a controlled AI workspace built around your team's existing process.",
    metrics: [
      { label: "Primary use case", value: "Invoice review" },
      { label: "Operating model", value: "Human approved" },
      { label: "Preview scope", value: "Guided pilot" },
    ],
    workflow: [
      {
        title: "Intake and structure",
        description:
          "Extract vendor, amount, due date, owner, purchase order match, and missing context from finance requests.",
      },
      {
        title: "Exception review",
        description:
          "Flag mismatched totals, missing approvals, duplicate vendors, stale requests, and unclear next owners before work stalls.",
      },
      {
        title: "Approval preparation",
        description:
          "Draft the approval note, vendor follow-up, and audit-ready summary for your finance lead to review.",
      },
    ],
  },
}

const DEFAULT_WORKSPACE: WorkspaceContent = {
  eyebrow: "DoneAi pilot workspace",
  headline: "AI operators for high-trust operational work",
  summary:
    "Preview how DoneAi turns messy business workflows into reviewable tasks, clear owner handoffs, and approval-ready outputs.",
  metrics: [
    { label: "Workspace type", value: "Pilot preview" },
    { label: "Operating model", value: "Human approved" },
    { label: "Setup", value: "Guided walkthrough" },
  ],
  workflow: [
    {
      title: "Map the workflow",
      description:
        "Clarify the intake, decision points, reviewers, and final output your team needs to trust.",
    },
    {
      title: "Prepare the work",
      description:
        "Organize the source material into reviewable tasks with owners, blockers, and next actions.",
    },
    {
      title: "Keep control",
      description:
        "Route sensitive steps through your team so AI supports the process without acting alone.",
    },
  ],
}

const TRUST_SIGNALS: TrustSignal[] = [
  {
    title: "Guided workspace preview",
    description:
      "Prospects see the workflow, guardrails, and expected outputs before they commit time or data.",
    icon: FileCheck2,
  },
  {
    title: "Human approval built in",
    description:
      "DoneAi prepares the work. Your team reviews decisions, external messages, and financial actions.",
    icon: ShieldCheck,
  },
  {
    title: "Clear implementation path",
    description:
      "Start with one controlled process, measure the review load, then expand only where the pilot earns trust.",
    icon: Clock3,
  },
]

export const Route = createFileRoute("/try/$workspaceSlug")({
  component: TryWorkspace,
  head: () => ({
    meta: [
      {
        title: "DoneAi financial operations workspace",
      },
      {
        name: "description",
        content:
          "Preview a DoneAi workspace for financial operations teams that need controlled AI support for invoice review, exception handling, and approvals.",
      },
    ],
  }),
})

function TryWorkspace() {
  const { workspaceSlug } = Route.useParams()
  const workspace = WORKSPACES[workspaceSlug] ?? DEFAULT_WORKSPACE

  return (
    <main className="min-h-screen bg-[#080b12] text-slate-50">
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="-top-32 left-1/2 absolute h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="right-10 bottom-20 absolute h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 lg:px-10">
        <header className="flex items-center justify-between border-white/10 border-b pb-5">
          <a className="flex items-center gap-3" href="/" aria-label="DoneAi home">
            <span className="flex size-9 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-300/10 font-semibold text-cyan-100">
              D
            </span>
            <span className="font-semibold text-lg tracking-tight">DoneAi</span>
          </a>
          <Button
            asChild
            variant="outline"
            className="border-white/15 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white"
          >
            <a href="mailto:hello@doneai.agency?subject=DoneAi%20financial%20operations%20walkthrough">
              Contact DoneAi
            </a>
          </Button>
        </header>

        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:py-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 font-medium text-cyan-100 text-sm">
              <span className="size-2 rounded-full bg-emerald-300" />
              {workspace.eyebrow}
            </div>

            <h1 className="max-w-3xl text-balance font-semibold text-5xl tracking-tight md:text-6xl">
              {workspace.headline}
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-slate-300 leading-8">
              {workspace.summary}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-cyan-300 text-slate-950 hover:bg-cyan-200">
                <a href="mailto:hello@doneai.agency?subject=DoneAi%20financial%20operations%20walkthrough">
                  Request a walkthrough
                  <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/15 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white"
              >
                <a href="#workspace-preview">See what the workspace does</a>
              </Button>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {workspace.metrics.map((metric) => (
                <div
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  key={metric.label}
                >
                  <div className="text-slate-400 text-xs uppercase tracking-[0.22em]">
                    {metric.label}
                  </div>
                  <div className="mt-2 font-semibold text-base text-white">
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <WorkspacePreview workflow={workspace.workflow} />
        </section>

        <section className="grid gap-4 pb-16 md:grid-cols-3">
          {TRUST_SIGNALS.map(({ title, description, icon: Icon }) => (
            <article
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20"
              key={title}
            >
              <div className="mb-5 flex size-11 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-100">
                <Icon className="size-5" />
              </div>
              <h2 className="font-semibold text-lg text-white">{title}</h2>
              <p className="mt-3 text-sm text-slate-300 leading-6">{description}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}

function WorkspacePreview({ workflow }: { workflow: WorkspaceStep[] }) {
  return (
    <div
      id="workspace-preview"
      className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-4 shadow-2xl shadow-cyan-950/30 backdrop-blur"
    >
      <div className="rounded-[1.5rem] border border-white/10 bg-[#0c111d] p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-cyan-100 text-sm">Guided workspace preview</p>
            <h2 className="mt-2 font-semibold text-2xl text-white">
              Finance queue, cleaned up for review
            </h2>
          </div>
          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 font-medium text-emerald-100 text-xs">
            Human approved
          </span>
        </div>

        <div className="space-y-3">
          {workflow.map((step, index) => (
            <article
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              key={step.title}
            >
              <div className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cyan-300/10 font-semibold text-cyan-100 text-sm">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-white">{step.title}</h3>
                  <p className="mt-1 text-sm text-slate-300 leading-6">
                    {step.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-200" />
            <div>
              <h3 className="font-semibold text-emerald-50">Workspace guardrails</h3>
              <p className="mt-1 text-emerald-50/80 text-sm leading-6">
                No autonomous payments, vendor messages, or accounting changes. DoneAi
                prepares the queue so your team can approve with context.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
