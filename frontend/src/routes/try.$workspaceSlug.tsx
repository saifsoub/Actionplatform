import { createFileRoute, notFound } from "@tanstack/react-router"
import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { getTrialWorkspace } from "@/lib/trial-workspaces"

export const Route = createFileRoute("/try/$workspaceSlug")({
  loader: ({ params }) => {
    const workspace = getTrialWorkspace(params.workspaceSlug)
    if (!workspace) {
      throw notFound()
    }
    return workspace
  },
  component: TryWorkspacePage,
  head: () => ({
    meta: [
      {
        title: "DoneAi Financial Operations Workspace",
      },
      {
        name: "description",
        content:
          "Preview how DoneAi helps finance operations teams resolve AP, AR, close, and cash workflow bottlenecks.",
      },
    ],
  }),
})

const operatingSignals = [
  "Invoices aging past SLA",
  "Close tasks waiting on owners",
  "Cash exceptions needing review",
] as const

const proofPoints = [
  "Designed for finance operations leaders, not generic chat",
  "Keeps ownership, evidence, and next actions visible",
  "Turns scattered follow-up into a guided operating queue",
] as const

const workflowSteps = [
  {
    label: "01",
    title: "Identify the bottleneck",
    description:
      "DoneAi reviews the workspace context and highlights where work is stalled, who owns the next step, and what evidence is missing.",
  },
  {
    label: "02",
    title: "Draft the operator action",
    description:
      "The workspace prepares a concise outreach, escalation, or verification draft that your team can approve before anything leaves the queue.",
  },
  {
    label: "03",
    title: "Track the decision path",
    description:
      "Every recommendation is tied to a visible reason so finance teams can audit what changed and why it mattered.",
  },
] as const

const trustSignals = [
  "Human approval before outbound action",
  "Clear source context for every recommendation",
  "Workspace-specific onboarding, not a blank chatbot",
  "Built around repeatable finance operating cadences",
] as const

function TryWorkspacePage() {
  const workspace = Route.useLoaderData()

  return (
    <main className="min-h-screen bg-[#F6F7FB] text-[#101828]">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.18),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.05),transparent_45%)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-14 px-6 py-8 sm:px-10 lg:px-12 lg:py-12">
          <nav className="flex items-center justify-between">
            <a
              href="/"
              className="flex items-center gap-3 rounded-full text-sm font-semibold text-slate-900"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/10">
                D
              </span>
              <span>DoneAi</span>
            </a>
            <a
              href={workspace.loginHref}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Sign in
            </a>
          </nav>

          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800">
                <ShieldCheck className="h-4 w-4" />
                Trusted workflow preview
              </div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                {workspace.displayName} workspace
              </p>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
                See how DoneAi clears finance operations bottlenecks
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                A guided workspace preview for AP, AR, close, and cash
                operations teams. Understand the issue, review the evidence, and
                approve the next action from one credible operating surface.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={workspace.signupHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Start guided workspace
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="mailto:hello@doneai.agency?subject=DoneAi%20financial%20operations%20workspace"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-white"
                >
                  Request a walkthrough
                </a>
              </div>
              <div className="mt-8 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                {proofPoints.map((point) => (
                  <div key={point} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-3 shadow-2xl shadow-slate-950/20">
              <div className="rounded-[1.5rem] border border-white/10 bg-[#111827] p-5 text-white">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-300">
                      Live queue
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">
                      Financial operations control room
                    </h2>
                  </div>
                  <div className="rounded-full bg-teal-400/10 px-3 py-1 text-xs font-semibold text-teal-200">
                    Preview
                  </div>
                </div>

                <div className="space-y-3">
                  {operatingSignals.map((signal, index) => (
                    <div
                      key={signal}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                    >
                      <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
                        <span>Signal {index + 1}</span>
                        <span>Needs owner review</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 h-2.5 w-2.5 rounded-full bg-teal-300 shadow-[0_0_24px_rgba(94,234,212,0.8)]" />
                        <div>
                          <p className="font-semibold text-slate-50">
                            {signal}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-300">
                            DoneAi proposes the next action, owner, and approval
                            note before this leaves the workspace.
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-teal-300/20 bg-teal-300/10 p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-1 h-5 w-5 text-teal-200" />
                    <div>
                      <p className="font-semibold text-teal-50">
                        Recommended next step
                      </p>
                      <p className="mt-2 text-sm leading-6 text-teal-50/80">
                        Confirm the overdue invoice owner, attach supporting
                        context, and send an approved follow-up from the queue.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-12 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:py-16">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
            Onboarding clarity
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">
            A serious first step for a serious operations team
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            From the first screen, DoneAi explains the workspace, the operating
            problem it is built for, and the review steps your team controls.
            The result is a focused path from signal to approved action.
          </p>
        </div>

        <div className="grid gap-4">
          {workflowSteps.map((step) => (
            <article
              key={step.label}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                  {step.label}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">
                    {step.title}
                  </h3>
                  <p className="mt-2 leading-7 text-slate-600">
                    {step.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
          <div className="rounded-3xl bg-slate-950 p-8 text-white shadow-xl shadow-slate-950/10">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-300/10 text-teal-200">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-semibold">
              Approval-first operating posture
            </h2>
            <p className="mt-4 leading-7 text-slate-300">
              DoneAi presents recommendations with approval gates and clear
              rationale so finance teams can use AI assistance without giving up
              operational control.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {trustSignals.map((signal) => (
              <div
                key={signal}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
              >
                <FileCheck2 className="mb-4 h-6 w-6 text-teal-700" />
                <p className="font-semibold leading-7 text-slate-900">
                  {signal}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14 text-center sm:px-10 lg:px-12">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
          Ready when you are
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">
          Enter with context, not confusion
        </h2>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
          Start the guided workspace to see how DoneAi turns finance operations
          noise into prioritized, reviewable action.
        </p>
        <div className="mt-8">
          <a
            href={workspace.signupHref}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-700 px-7 py-3 text-sm font-semibold text-white shadow-xl shadow-teal-700/20 transition hover:-translate-y-0.5 hover:bg-teal-800"
          >
            Start guided workspace
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </main>
  )
}
