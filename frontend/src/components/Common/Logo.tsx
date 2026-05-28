import { Link } from "@tanstack/react-router"

import { cn } from "@/lib/utils"

interface LogoProps {
  variant?: "full" | "icon" | "responsive"
  className?: string
  asLink?: boolean
}

export function Logo({
  variant = "full",
  className,
  asLink = true,
}: LogoProps) {
  const content =
    variant === "responsive" ? (
      <span className="flex items-center gap-2">
        <LogoMark className="size-8 group-data-[collapsible=icon]:size-5" />
        <span
          className={cn(
            "font-semibold text-foreground group-data-[collapsible=icon]:hidden",
            className,
          )}
        >
          DoneAi
        </span>
      </span>
    ) : variant === "full" ? (
      <span className={cn("flex items-center gap-3", className)}>
        <LogoMark className="size-12" />
        <span className="text-2xl font-semibold tracking-tight text-foreground">
          DoneAi
        </span>
      </span>
    ) : (
      <LogoMark className={cn("size-5", className)} />
    )

  if (!asLink) {
    return content
  }

  return <Link to="/">{content}</Link>
}

function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-label="DoneAi"
      className={cn(
        "inline-flex items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-sm dark:bg-white dark:text-slate-950",
        className,
      )}
    >
      D
    </span>
  )
}
