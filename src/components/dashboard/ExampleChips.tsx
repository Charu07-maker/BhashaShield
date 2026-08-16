interface ExampleChip {
  label: string
  onClick: () => void
}

interface ExampleChipsProps {
  chips: ExampleChip[]
  disabled?: boolean
}

export function ExampleChips({ chips, disabled }: ExampleChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-ink-disabled">Try:</span>
      {chips.map((chip) => (
        <button
          key={chip.label}
          type="button"
          disabled={disabled}
          onClick={chip.onClick}
          className="rounded-full border border-border bg-raised px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors duration-150 hover:border-accent/50 hover:text-ink-primary disabled:pointer-events-none disabled:opacity-40"
        >
          {chip.label}
        </button>
      ))}
    </div>
  )
}
