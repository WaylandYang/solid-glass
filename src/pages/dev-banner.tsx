import * as React from "react"
import { CheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { StatusGlyph } from "@/components/ui/status-glyph"
import { Tag } from "@/components/ui/tag"
import { SolidGlassMark } from "@/site/logo"

/**
 * The name, set in the material: each letter a pane of glass. A face (darker for the first word,
 * brighter for the second), the line of light along the top of every stroke, a hairline round it,
 * a thin dark edge underneath and its shadow on the page. No gradient; like a pane, a letter is
 * finished at its edges.
 */
export function GlassWordmark({ first, second, scale = 1 }: { first: string; second: string; scale?: number }) {
  const id = React.useId()
  // Every layer is the same line of type. Only the face is told the two words apart.
  const letters = (props: React.SVGProps<SVGTextElement>, face?: [string, string]) => (
    <text x="0" y="36" fontSize="40" fontWeight="600" letterSpacing="-2" {...props}>
      <tspan fill={face?.[0]}>{first}</tspan>
      <tspan fill={face?.[1]}> {second}</tspan>
    </text>
  )
  return (
    <svg width={222 * scale} height={48 * scale} viewBox="0 0 222 48" role="img" aria-label={`${first} ${second}`} className="overflow-visible font-sans">
      <defs>
        {/* What is left of the letters once the same letters, moved down a little, are taken out: their top edges. */}
        <mask id={`${id}rim`} maskUnits="userSpaceOnUse" x="-8" y="-8" width="240" height="64">
          {letters({ fill: "#fff" })}
          <g transform="translate(0 1)">{letters({ fill: "#000" })}</g>
        </mask>
      </defs>
      <g transform="translate(0 3.5)" style={{ filter: "blur(3px)" }}>
        {letters({ fill: "#000", fillOpacity: 0.55 })}
      </g>
      <g transform="translate(0 1.1)">{letters({ fill: "oklch(0.3 0 0)" })}</g>
      {/* smoked glass for the first word, clear glass for the second: the name says which is which */}
      {letters({}, ["oklch(0.62 0 0)", "oklch(0.9 0 0)"])}
      {letters({ fill: "none", stroke: "#fff", strokeOpacity: 0.16, strokeWidth: 0.7 })}
      <g mask={`url(#${id}rim)`}>{letters({ fill: "#fff", fillOpacity: 0.85 })}</g>
    </svg>
  )
}

/**
 * Development only (/dev/banner): the banner at the top of the README, drawn with the theme itself so
 * it cannot drift from the material. It fills an 820 by 200 window; `docs/banner-5.webp` is a
 * screenshot of this page at twice that, with a clear background (the corners are see-through).
 *
 * On the left, the name, in glass, and who it is by. On the right, what it is for: three panes of the
 * three thicknesses, a plant's line being watched, an agent at work on it, and the question it has
 * for a person.
 */
// Solid Glass is not see-through. On the site's unlit page a pane is a faint tint; over a light, as
// here, that tint alone would turn clear and take the light's colour, which is liquid glass's look.
// So the page a pane lies on is put back under it: the page's colour, mostly opaque, beneath the
// tint. The light then shows round a pane and along its edges, not through its face.
export const over = (tint: string): React.CSSProperties => ({
  background: `linear-gradient(${tint}, ${tint}), color-mix(in oklch, var(--background) 90%, transparent)`,
})

export function DevBanner() {
  // Nothing behind the banner: its corners are rounded, and what shows past them should be whatever
  // page the picture ends up on.
  React.useEffect(() => {
    const page = [document.documentElement, document.body]
    page.forEach((el) => el.style.setProperty("background", "transparent", "important"))
    return () => page.forEach((el) => el.style.removeProperty("background"))
  }, [])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-between overflow-hidden rounded-[16px] bg-background px-11 shadow-[inset_0_0_0_1px_var(--glass-edge)]">
      {/* Light, so the picture is not flat: a blue patch behind the panes, a fainter teal one in the
          corner and a touch of white opposite. The site's dark page has none; this is a poster, not a
          page to read. */}
      <span aria-hidden className="absolute top-[70px] left-[440px] size-[250px] rounded-full bg-[oklch(0.78_0.1_250)] opacity-40 blur-[64px]" />
      <span aria-hidden className="absolute -top-[90px] right-[-40px] size-[220px] rounded-full bg-[oklch(0.85_0.07_205)] opacity-25 blur-[60px]" />
      <span aria-hidden className="absolute -bottom-[120px] left-[-60px] size-[260px] rounded-full bg-white opacity-[0.09] blur-[70px]" />

      {/* The title block: the name, what it is for, and who it is by. Everything said in words is said
          here, so the right is left to be an interface and nothing else. */}
      <div className="relative flex flex-col">
        <div className="flex items-center gap-3.5">
          <SolidGlassMark className="size-11 -translate-y-[3px]" />
          <GlassWordmark first="Solid" second="Glass" />
        </div>
        {/* two lines under the name, in one size and on one edge: what it is for, and who it is by */}
        <p className="mt-5 pl-[6px] text-[15px] leading-none tracking-tight text-foreground/85">Designed for AI applications</p>
        <p className="mt-3 pl-[6px] text-[15px] leading-none text-muted-foreground">
          by <span className="ml-0.5 font-logo text-[15.5px] tracking-[0.14em] text-foreground/85">DeepLethe</span>
        </p>
      </div>

      {/* What that looks like, in three panes of the three thicknesses: a line in a plant being
          watched, an agent at work on it, and the one thing it needs a person for. */}
      <div className="relative h-[164px] w-[420px] shrink-0 text-[11px] leading-tight">
        {/* thinnest: the readings */}
        <div style={over("var(--panel)")} className="glass-panel absolute top-[10px] left-0 flex h-[146px] w-[138px] flex-col rounded-xl p-3">
          <span className="text-muted-foreground">Plant 2 · Line 3</span>
          <span className="mt-1.5 text-[22px] leading-none font-semibold tracking-tight tabular-nums">1,472</span>
          <span className="mt-1 text-[10px] text-muted-foreground">units per hour</span>
          <div className="mt-auto flex h-[46px] items-end gap-[5px]">
            {[52, 78, 64, 88, 70, 38, 60].map((height, index) => (
              <span key={index} style={{ height: `${height}%` }} className="flex-1 rounded-[3px] bg-chart-2" />
            ))}
          </div>
        </div>

        {/* in between: the agent, at work */}
        <div style={over("var(--card)")} className="absolute top-0 left-[150px] flex h-[96px] w-[270px] flex-col gap-1.5 rounded-xl bg-card p-3">
          <div className="flex items-center gap-2">
            <StatusGlyph activity="thinking" />
            <span className="font-medium text-foreground">Inspecting weld seams</span>
            <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">14s · 2,048 frames</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckIcon className="size-3 text-success" />
            Read the sensor batch from the furnace
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckIcon className="size-3 text-success" />
            Compared it with last week's baseline
          </div>
        </div>

        {/* thickest: what it needs a person for */}
        <div className="absolute top-[74px] left-[196px] flex h-[90px] w-[224px] flex-col rounded-xl bg-popover p-3">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-status-interrupted" />
            <span className="font-medium text-foreground">Anomaly on bearing 4</span>
            {/* a reading is a tag, the small pane with a control's corners, not a pill */}
            <Tag className="ml-auto h-[18px] gap-0 rounded-[5px] px-1.5 text-[10px] font-medium tabular-nums">+12 °C</Tag>
          </div>
          <span className="mt-1 text-[10.5px] text-muted-foreground">Above baseline for six minutes.</span>
          <div className="mt-auto flex justify-end gap-1.5">
            <Button variant="glass" size="xs" className="h-[22px] text-[10.5px]">
              Dismiss
            </Button>
            <Button size="xs" className="h-[22px] text-[10.5px]">
              Create work order
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
