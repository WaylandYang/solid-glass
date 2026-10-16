"use client"

import { cn } from "@/lib/utils"

/**
 * A decision the agent has put to the user: the question, and its choices as
 * buttons when it gave any. Once the conversation has moved on, leave
 * `onAnswer` out: the choices are then no longer offered, and the card stays
 * as a record of what was asked.
 */
function AskCard({
  question,
  options = [],
  onAnswer,
  eyebrow = "Needs your decision",
  className,
}: {
  question: string
  options?: string[]
  onAnswer?: (option: string) => void
  eyebrow?: string
  className?: string
}) {
  return (
    <div data-slot="ask-card" className={cn("glass-panel rounded-md px-3.5 py-3", className)}>
      <p className="text-[11.5px] text-status-interrupted">{eyebrow}</p>
      <p className="mt-1 text-[14px] leading-relaxed whitespace-pre-wrap">{question}</p>
      {options.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              disabled={!onAnswer}
              onClick={() => onAnswer?.(option)}
              className="glass-chosen h-7 rounded-sm px-2.5 text-[12.5px] text-foreground/90 transition-colors outline-none hover:bg-foreground/[0.12] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export { AskCard }
