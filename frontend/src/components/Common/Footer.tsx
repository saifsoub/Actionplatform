export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t py-4 px-6">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-muted-foreground text-sm">
          DoneAi - {currentYear}
        </p>
        <a
          href="mailto:hello@doneai.agency"
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          hello@doneai.agency
        </a>
      </div>
    </footer>
  )
}
