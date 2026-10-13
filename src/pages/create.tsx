import * as React from "react"
import { useSearchParams } from "react-router-dom"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Blocks from "@/create/blocks"
import { Customizer } from "@/create/customizer"
import { CreateContext, decode, encode, fontFamily, loadFont, overrides, shared, theme as themed, wash, DEFAULTS, type Options } from "@/create/options"
import { Wall } from "@/home/wall"
import { SolidGlassMark } from "@/site/logo"
import { useTheme } from "@/site/theme"

const WELCOMED = "solid-glass:create-welcomed"

/** Shown once: what this page is for. */
function Welcome() {
  const [params] = useSearchParams()
  const [open, setOpen] = React.useState(() => {
    if (params.get("welcome") === "0") return false
    try {
      return localStorage.getItem(WELCOMED) !== "1"
    } catch {
      return false
    }
  })
  const close = (next: boolean) => {
    setOpen(next)
    if (!next) {
      try {
        localStorage.setItem(WELCOMED, "1")
      } catch {
        // private mode: it will be shown again next time
      }
    }
  }
  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent showCloseButton={false} className="gap-0 overflow-hidden p-0 sm:max-w-sm">
        <div className="flex h-44 items-center justify-center bg-background">
          <SolidGlassMark className="size-14" />
        </div>
        <DialogHeader className="p-4">
          <DialogTitle>Tune your own Solid Glass</DialogTitle>
          <DialogDescription>
            Start from a named look or from the stylesheet as it comes, then make the panes thinner or thicker, pick the grey and
            the ink, the type, the corners, the rim and the shadow. The preview is the components as installed; the code at the
            end is only what you changed.
          </DialogDescription>
        </DialogHeader>
        <div className="border-t p-4">
          <Button className="w-full" onClick={() => close(false)}>
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const VIEWS = ["01", "02"] as const

/**
 * Create: the material with its dials out. A panel of pickers on the left, and on the right the
 * components taking each choice as it is made. The choices live in the address, so a look can be
 * linked to; the code at the end is the handful of variables that were tuned.
 */
export default function Create() {
  const [params, setParams] = useSearchParams()
  const options = React.useMemo(() => decode(params.get("preset")), [params])
  const { theme, setTheme } = useTheme()
  const [view, setView] = React.useState<(typeof VIEWS)[number]>("01")

  const change = (next: Options) => {
    const preset = encode(next)
    setParams(
      (current) => {
        const copy = new URLSearchParams(current)
        if (preset === encode(DEFAULTS)) copy.delete("preset")
        else copy.set("preset", preset)
        return copy
      },
      { replace: true }
    )
  }

  // a face that is not the site's own is fetched when a look first asks for it
  React.useEffect(() => {
    loadFont(options.font)
    loadFont(options.heading)
  }, [options.font, options.heading])

  const style = {
    ...shared(options),
    ...overrides(options, theme),
    ...themed(options),
    fontFamily: fontFamily(options.font),
    "--create-heading": fontFamily(options.heading),
    "--create-accent": wash(options, theme),
  } as React.CSSProperties

  return (
    <CreateContext.Provider value={options}>
      <div className="container-wrapper flex h-[calc(100svh-var(--header-height))] min-h-0 flex-col gap-3 px-6 pb-6 md:flex-row md:gap-5">
        <Customizer options={options} onChange={change} mode={theme} onMode={setTheme} className="order-last md:order-first" />
        <div data-create-preview style={style} className="relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-2xl border bg-background text-foreground">
          <div className="no-scrollbar h-full overflow-y-auto">{view === "01" ? <Blocks /> : <Wall full />}</div>
          <div className="glass-panel absolute right-3 bottom-3 z-10 flex gap-0.5 rounded-lg p-0.5 font-mono text-xs">
            {VIEWS.map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={view === name}
                onClick={() => setView(name)}
                className={cn("rounded-md px-2.5 py-1 text-muted-foreground outline-none hover:text-foreground", view === name && "glass-chosen text-foreground")}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
      <Welcome />
    </CreateContext.Provider>
  )
}
