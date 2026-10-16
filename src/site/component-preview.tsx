import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { CodeBlock } from "@/site/code"

// Every example, loaded when its preview is first shown, and its source as text.
const modules = import.meta.glob<{ default?: React.ComponentType } & Record<string, unknown>>("/src/examples/*.tsx")
const sources = import.meta.glob<string>("/src/examples/*.tsx", { query: "?raw", import: "default" })
const uiSources = import.meta.glob<string>("/src/components/ui/*.tsx", { query: "?raw", import: "default" })

const lazies = new Map<string, React.LazyExoticComponent<React.ComponentType>>()
function exampleOf(name: string) {
  const load = modules[`/src/examples/${name}.tsx`]
  if (!load) return null
  if (!lazies.has(name)) {
    lazies.set(
      name,
      React.lazy(async () => {
        const mod = await load()
        // An example is its default export, or else the one component the file exports.
        const found = mod.default ?? Object.values(mod).find((value) => typeof value === "function")
        return { default: found as React.ComponentType }
      })
    )
  }
  return lazies.get(name)!
}

/** The text of a file, once it has been fetched. */
function useSource(load: (() => Promise<string>) | undefined) {
  const [text, setText] = React.useState<string | null>(null)
  React.useEffect(() => {
    let live = true
    setText(null)
    void load?.().then((value) => live && setText(value))
    return () => {
      live = false
    }
  }, [load])
  return text
}

/**
 * A component shown live over its code, as on ui.shadcn.com: the preview on top, and under it the
 * first lines of the source, fading out, with a button that shows the rest.
 */
export function ComponentPreview({
  name,
  align = "center",
  className,
  wrapperClassName,
  hideCode = false,
}: {
  name: string
  align?: string
  /** For the box the example stands in. */
  className?: string
  /** For the frame round it; shadcn/ui's pages use it to reach inside (`[&_.preview]:h-auto`). */
  wrapperClassName?: string
  hideCode?: boolean
}) {
  const Example = exampleOf(name)
  const source = useSource(sources[`/src/examples/${name}.tsx`])
  const [open, setOpen] = React.useState(false)
  const code = source ?? ""

  return (
    <div data-slot="component-preview" className={cn("group relative mt-4 mb-12 flex flex-col overflow-hidden rounded-2xl border", wrapperClassName)}>
      <div data-slot="preview">
        <div
          data-align={align}
          className={cn(
            "preview relative flex h-72 w-full justify-center p-10 data-[align=center]:items-center data-[align=end]:items-end data-[align=start]:items-start",
            className
          )}
        >
          <React.Suspense fallback={<Spinner className="text-muted-foreground" />}>
            {Example ? <Example /> : <p className="text-sm text-muted-foreground">No example named {name}.</p>}
          </React.Suspense>
        </div>
      </div>
      {!hideCode && code && (
        <div data-slot="code" className="relative overflow-hidden border-t">
          {open ? (
            <CodeBlock code={code} className="my-0 rounded-none" />
          ) : (
            <div className="relative">
              <CodeBlock code={code.split("\n").slice(0, 3).join("\n")} className="my-0 rounded-none **:data-[slot=copy-button]:hidden" />
              <div className="absolute inset-0 flex items-center justify-center pb-4">
                <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
                <Button type="button" size="sm" variant="glass" className="relative z-10 rounded-lg" onClick={() => setOpen(true)}>
                  View Code
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** A component's own source, as it is installed. */
export function ComponentSource({ name, title }: { name: string; title?: string }) {
  const source = useSource(uiSources[`/src/components/ui/${name}.tsx`])
  if (!source) return null
  return <CodeBlock code={source} title={title ?? `components/ui/${name}.tsx`} />
}
