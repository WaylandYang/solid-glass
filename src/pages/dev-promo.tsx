import * as React from "react"
import { flushSync } from "react-dom"
import {
  CalculatorIcon,
  CalendarIcon,
  CheckIcon,
  CreditCardIcon,
  PlusIcon,
  SettingsIcon,
  SmileIcon,
  UserIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { AskCard } from "@/components/ui/ask-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Composer } from "@/components/ui/composer"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { StatusGlyph } from "@/components/ui/status-glyph"
import { Switch } from "@/components/ui/switch"
import { Tag } from "@/components/ui/tag"
import { StepList, type Step } from "@/components/ui/tool-steps"
import { DEFAULTS, overrides } from "@/create/options"
import { GlassWordmark, over } from "@/pages/dev-banner"
import { SolidGlassMark } from "@/site/logo"

/*
 * Development only (/dev/promo): a short film of the material, played by the material itself. Every
 * frame is a function of one clock, `t`, in milliseconds, so the same frame can be drawn again:
 * `scripts/record.mjs` steps the clock and photographs each frame. Left alone the page plays in a
 * loop, scaled to the window; `?t=<ms>` holds one moment.
 */

const W = 1920
const H = 1080
export const DURATION = 31_500

const clamp = (x: number) => Math.min(1, Math.max(0, x))
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3)
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
/** How far from `a` to `b` the clock is, eased: 0 before, 1 after. */
const at = (t: number, a: number, b: number, ease = easeOut) => ease(clamp((t - a) / (b - a)))
/** On from `a` to `b`: fading in over the first `fadeIn` ms and out over the last `fadeOut`. */
const life = (t: number, a: number, b: number, fadeIn = 600, fadeOut = 500) =>
  Math.min(at(t, a, a + fadeIn), 1 - at(t, b - fadeOut, b, easeInOut))
const rise = (t: number, a: number, b: number, by = 24): React.CSSProperties => ({
  opacity: at(t, a, b),
  transform: `translateY(${(1 - at(t, a, b)) * by}px)`,
})

// The scenes, end to end.
const INTRO = [0, 3_800] as const
const PANES = [3_800, 8_600] as const
const EDGES = [8_600, 12_400] as const
const STATE = [12_400, 16_200] as const
const AGENT = [16_200, 23_000] as const
const TUNE = [23_000, 27_400] as const
const LIGHT = [25_800, 27_400] as const
const END = [27_400, DURATION] as const

function Caption({ t, from, to, eyebrow, title, sub }: { t: number; from: number; to: number; eyebrow?: string; title: string; sub?: string }) {
  const o = life(t, from, to, 700, 450)
  return (
    <div style={{ opacity: o, transform: `translateY(${(1 - at(t, from, from + 700)) * 18}px)` }} className="absolute inset-x-0 top-[104px] flex flex-col items-center text-center">
      {eyebrow && <p className="mb-4 font-mono text-[17px] tracking-[0.18em] text-muted-foreground uppercase">{eyebrow}</p>}
      <h2 className="text-[64px] leading-none font-semibold tracking-[-0.035em]">{title}</h2>
      {sub && <p className="mt-5 max-w-[880px] text-[24px] leading-snug text-muted-foreground">{sub}</p>}
    </div>
  )
}

/** Light behind the panes, drifting, so they have something to be solid against. */
function Lights({ t }: { t: number }) {
  const s = t / 1000
  const sweep = at(t, PANES[0] + 200, PANES[1], easeInOut)
  return (
    <>
      <span
        style={{ left: 380 + Math.sin(s * 0.35) * 160 + sweep * 760, top: 300 + Math.cos(s * 0.3) * 60, opacity: 0.32 + 0.14 * life(t, PANES[0], PANES[1]) }}
        className="absolute size-[640px] rounded-full bg-[oklch(0.75_0.11_250)] blur-[150px]"
      />
      <span
        style={{ right: 120 + Math.cos(s * 0.28) * 140, top: -160 + Math.sin(s * 0.4) * 80 }}
        className="absolute size-[560px] rounded-full bg-[oklch(0.85_0.07_200)] opacity-[0.2] blur-[140px]"
      />
      <span style={{ left: -200 + Math.sin(s * 0.22) * 100 }} className="absolute -bottom-[260px] size-[620px] rounded-full bg-white opacity-[0.06] blur-[160px]" />
    </>
  )
}

function Intro({ t }: { t: number }) {
  const [a, b] = INTRO
  const o = life(t, a, b, 1, 650)
  return (
    <div style={{ opacity: o, transform: `scale(${1 + 0.05 * at(t, b - 650, b, easeInOut)})` }} className="absolute inset-0 flex flex-col items-center justify-center">
      <div style={{ opacity: at(t, 100, 1000), transform: `translateY(${(1 - at(t, 100, 1100)) * 36}px) scale(${0.9 + 0.1 * at(t, 100, 1100)})` }}>
        <SolidGlassMark className="size-[136px]" />
      </div>
      <div className="mt-12" style={rise(t, 650, 1550, 22)}>
        <GlassWordmark first="Solid" second="Glass" scale={3.1} />
      </div>
      <p style={rise(t, 1450, 2250, 14)} className="mt-14 text-[34px] tracking-tight text-foreground/85">
        Designed for AI applications
      </p>
    </div>
  )
}

function Panes({ t }: { t: number }) {
  const [a, b] = PANES
  const o = life(t, a, b, 1, 600)
  const enter = (index: number) => rise(t, a + 450 + index * 260, a + 1250 + index * 260, 70)
  return (
    <div style={{ opacity: o }} className="absolute inset-0">
      <Caption t={t} from={a} to={b} eyebrow="Depth is thickness" title="Thick, smoky panes." sub="The thinner the pane, the lower it lies. What floats is the thickest." />
      <div className="absolute inset-x-0 top-[420px] flex justify-center gap-12 text-[19px]">
        <div style={{ ...over("var(--panel)"), ...enter(0) }} className="glass-panel flex h-[440px] w-[420px] flex-col rounded-[28px] p-8">
          <span className="font-mono text-[15px] tracking-[0.14em] text-muted-foreground uppercase">Panel</span>
          <span className="mt-2 text-muted-foreground">Plant 2 · Line 3</span>
          <span className="mt-2 text-[56px] leading-none font-semibold tracking-tight tabular-nums">1,472</span>
          <span className="mt-2 text-[16px] text-muted-foreground">units per hour</span>
          <div className="mt-auto flex h-[150px] items-end gap-3">
            {[52, 78, 64, 88, 70, 38, 60].map((height, index) => (
              <span key={index} style={{ height: `${height * (0.3 + 0.7 * at(t, a + 900 + index * 70, a + 1700 + index * 70))}%` }} className="flex-1 rounded-[6px] bg-chart-2" />
            ))}
          </div>
        </div>
        <div style={{ ...over("var(--card)"), ...enter(1) }} className="flex h-[440px] w-[420px] flex-col gap-4 rounded-[28px] bg-card p-8">
          <span className="font-mono text-[15px] tracking-[0.14em] text-muted-foreground uppercase">Card</span>
          <div className="mt-2 flex items-center gap-3">
            <StatusGlyph activity="thinking" className="size-6" />
            <span className="font-medium">Inspecting weld seams</span>
          </div>
          {["Read the sensor batch", "Compared with last week", "Flagged bearing 4"].map((line, index) => (
            <div key={line} style={{ opacity: at(t, a + 1600 + index * 500, a + 2100 + index * 500) }} className="flex items-center gap-3 text-muted-foreground">
              <CheckIcon className="size-5 text-success" />
              {line}
            </div>
          ))}
          <div className="mt-auto h-[10px] overflow-hidden rounded-full bg-muted">
            <span style={{ width: `${20 + 70 * at(t, a + 1200, b - 600, easeInOut)}%` }} className="block h-full rounded-full bg-primary" />
          </div>
        </div>
        <div style={enter(2)} className="flex h-[440px] w-[420px] flex-col rounded-[28px] bg-popover p-8">
          <span className="font-mono text-[15px] tracking-[0.14em] text-muted-foreground uppercase">Popover</span>
          <div className="mt-4 flex items-center gap-3">
            <span className="size-3 rounded-full bg-status-interrupted" />
            <span className="font-medium">Anomaly on bearing 4</span>
            <Tag className="ml-auto h-8 rounded-[8px] px-2.5 text-[16px] font-medium tabular-nums">+12 °C</Tag>
          </div>
          <span className="mt-3 text-muted-foreground">Above baseline for six minutes.</span>
          <div className="mt-auto flex justify-end gap-3">
            <Button variant="glass" className="h-11 rounded-xl px-5 text-[17px]">
              Dismiss
            </Button>
            <Button className="h-11 rounded-xl px-5 text-[17px]">Create work order</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Edges({ t }: { t: number }) {
  const [a, b] = EDGES
  const o = life(t, a, b, 600, 600)
  const zoom = at(t, a + 1100, a + 2700, easeInOut)
  const glint = at(t, a + 500, a + 2300, easeInOut)
  return (
    <div style={{ opacity: o }} className="absolute inset-0">
      <Caption t={t} from={a} to={a + 1400} eyebrow="Finished at the edges" title="A line of light, a hairline, a shadow." />
      <div className="absolute inset-0 flex items-center justify-center pt-[180px]">
        <div
          style={{ ...over("var(--card)"), transform: `scale(${1 + 2.4 * zoom})`, transformOrigin: "6% 8%" }}
          className="relative flex h-[520px] w-[1000px] flex-col overflow-hidden rounded-[32px] bg-card p-10 text-[20px]"
        >
          {/* the glint, running along the top edge */}
          <span
            style={{ left: `${-30 + glint * 130}%`, opacity: life(t, a + 500, a + 2300, 300, 400) }}
            className="absolute top-0 h-[2px] w-[34%] bg-linear-to-r from-transparent via-white to-transparent"
          />
          <div className="flex items-center gap-4">
            <SolidGlassMark className="size-12" />
            <div className="flex flex-col">
              <span className="text-[26px] font-semibold tracking-tight">Line 3 · Weld seams</span>
              <span className="text-muted-foreground">Inspected 2,048 frames in 14 seconds</span>
            </div>
            <Badge className="ml-auto h-9 px-4 text-[17px]">Live</Badge>
          </div>
          <div className="mt-auto flex h-[220px] items-end gap-4">
            {[44, 62, 58, 80, 72, 90, 66, 52, 74, 86, 60, 70].map((height, index) => (
              <span key={index} style={{ height: `${height}%` }} className="flex-1 rounded-[8px] bg-chart-2" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const MENU = [
  { icon: CalendarIcon, label: "Calendar" },
  { icon: SmileIcon, label: "Search emoji" },
  { icon: CalculatorIcon, label: "Calculator" },
  { icon: UserIcon, label: "Profile" },
  { icon: CreditCardIcon, label: "Billing" },
  { icon: SettingsIcon, label: "Settings" },
]
const TABS = ["Docs", "Components", "Blocks", "Material", "Create"]
const TAB = 96

/** Where the one state is at this moment: it moves from mark to mark, easing between them. */
function along(t: number, marks: [number, number][]) {
  let value = marks[0][1]
  for (let i = 1; i < marks.length; i++) {
    const [when, to] = marks[i]
    value = value + (to - value) * at(t, when, when + 380, easeInOut)
  }
  return value
}

function OneState({ t }: { t: number }) {
  const [a, b] = STATE
  const o = life(t, a, b, 600, 500)
  const row = along(t, [[0, 0], [a + 900, 2], [a + 1600, 4], [a + 2300, 1], [a + 3000, 3]])
  const tab = along(t, [[0, 0], [a + 1150, 2], [a + 1850, 4], [a + 2550, 1], [a + 3150, 3]])
  return (
    <div style={{ opacity: o }} className="absolute inset-0">
      <Caption t={t} from={a} to={b} eyebrow="One state" title="Hovered, chosen, held open." sub="All three wear the same small pane of clear glass." />
      {/* drawn at the size it has on a page, and the whole enlarged */}
      <div className="absolute inset-x-0 top-[380px] flex justify-center">
        <div style={{ zoom: 1.75 }} className="flex items-start gap-14 text-sm">
          <div style={rise(t, a + 200, a + 900, 24)} className="relative w-[268px] rounded-xl bg-popover p-1.5">
            <span style={{ top: 6 + row * 36 }} className="glass-chosen absolute inset-x-1.5 h-9 rounded-md" />
            {MENU.map(({ icon: Icon, label }, index) => (
              <div key={label} className={cn("relative flex h-9 items-center gap-2.5 px-2.5", Math.round(row) === index ? "text-foreground" : "text-foreground/75")}>
                <Icon className="size-4" />
                {label}
                <span className="ml-auto font-mono text-xs text-muted-foreground">⌘{label[0]}</span>
              </div>
            ))}
            {/* the pointer, on the row it is over */}
            <svg style={{ top: 6 + row * 36 + 17, left: 176 }} className="absolute size-5 drop-shadow-[0_2px_4px_rgb(0_0_0/0.5)]" viewBox="0 0 24 24">
              <path d="M5 3l14 8-6.5 1.6L9.6 19z" fill="white" stroke="black" strokeWidth="1.3" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={rise(t, a + 450, a + 1150, 24)} className="flex flex-col gap-6">
            <div style={{ width: TAB * TABS.length + 8 }} className="glass-panel relative flex h-10 items-center rounded-xl p-1">
              <span style={{ left: 4 + tab * TAB, width: TAB }} className="glass-chosen absolute inset-y-1 rounded-lg" />
              {TABS.map((name, index) => (
                <span key={name} style={{ width: TAB }} className={cn("relative text-center", Math.round(tab) === index ? "text-foreground" : "text-muted-foreground")}>
                  {name}
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              {["Day", "Week", "Month"].map((name, index) => (
                <Button key={name} variant="outline" data-pressed={Math.round(row) % 3 === index ? "" : undefined}>
                  {name}
                </Button>
              ))}
              <Button variant="glass">
                <PlusIcon /> New
              </Button>
            </div>
            <p className="max-w-[360px] leading-relaxed text-muted-foreground">
              No colour for hover, another for selected, a third for open. One pane, wherever the attention is.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ASK = "Write that the weld seams on line 3 are fine, and check bearing 4 before the next shift."
const STEPS: [number, Omit<Step, "status">][] = [
  [19_000, { id: "read", label: "Read 2,048 frames from camera 3", detail: "" }],
  [19_700, { id: "compare", label: "Compared seams with last week's baseline" }],
  [20_400, { id: "sensor", label: "Pulled bearing temperatures, line 3" }],
]

function Agent({ t }: { t: number }) {
  const [a, b] = AGENT
  const o = life(t, a, b, 600, 500)
  const typed = ASK.slice(0, Math.floor(ASK.length * at(t, a + 500, a + 1900, (x) => x)))
  const sent = t >= a + 2050
  const steps: Step[] = STEPS.filter(([when]) => t >= when).map(([when, step]) => ({ ...step, status: t >= when + 600 ? "done" : "running" }))
  const asking = t >= 21_200
  const doing = t < 19_000 ? "Thinking" : t < 20_400 ? "Reading the line" : asking ? "Waiting for you" : "Checking the bearings"
  return (
    <div style={{ opacity: o }} className="absolute inset-0">
      <Caption t={t} from={a} to={b} eyebrow="Built for AI applications" title="An agent, at work." sub="Status that moves, steps that can be opened, and a question put where the work stopped." />
      <div className="absolute inset-x-0 top-[340px] flex justify-center">
      <div style={{ ...over("var(--panel)"), ...rise(t, a + 100, a + 800, 24), zoom: 1.6 }} className="glass-panel flex h-[436px] w-[600px] flex-col rounded-2xl p-5 text-sm">
        <div className="flex min-h-0 flex-1 flex-col gap-3.5">
          {sent && (
            <div style={rise(t, a + 2050, a + 2500, 16)} className="ml-auto max-w-[400px] rounded-xl bg-secondary px-3.5 py-2.5 leading-snug">
              {ASK}
            </div>
          )}
          {t >= 18_500 && (
            <div style={rise(t, 18_500, 18_900, 8)} className="flex items-center gap-2 text-[13px]">
              <StatusGlyph activity={asking ? "compacting" : t < 19_000 ? "thinking" : "running"} />
              <span className="font-medium">{doing}</span>
              <span className="text-muted-foreground tabular-nums">{Math.max(0, Math.floor((t - 18_500) / 1000))}s</span>
            </div>
          )}
          {steps.length > 0 && <StepList steps={steps} />}
          {asking && (
            <div style={rise(t, 21_200, 21_700, 12)}>
              <AskCard
                question="Bearing 4 has run 12 °C above baseline for six minutes. Open a work order for the next shift?"
                options={["Open a work order", "Keep watching"]}
                onAnswer={() => {}}
              />
            </div>
          )}
        </div>
        <Composer className="mt-4" value={sent ? "" : typed} onValueChange={() => {}} placeholder="Ask the agent…" running={sent && !asking} />
      </div>
      </div>
    </div>
  )
}

const ACCENTS = ["violet", "blue", "teal", "green", "amber", "orange", "red", "ink"] as const

function Tune({ t }: { t: number }) {
  const [a, b] = TUNE
  const o = life(t, a, b, 600, 500)
  const light = t >= LIGHT[0]
  const index = Math.min(ACCENTS.length - 1, Math.max(0, Math.floor((t - a - 500) / 300)))
  const accent = light ? "blue" : ACCENTS[index]
  const tint = overrides({ ...DEFAULTS, accent }, light ? "light" : "dark")
  return (
    <div style={{ opacity: o }} className="absolute inset-0">
      <Caption t={t} from={a} to={LIGHT[0] + 50} eyebrow="Make it yours" title="Any ink. Any grey. Your type." sub="Tune it in Create, and take the handful of variables you changed." />
      <Caption t={t} from={LIGHT[0]} to={b} eyebrow="Make it yours" title="Dark, and light." sub="The same panes, in daylight." />
      <div className="absolute inset-x-0 top-[470px] flex justify-center">
        <div style={{ ...(tint as React.CSSProperties), ...over("var(--card)"), ...rise(t, a + 150, a + 850, 24), zoom: 1.6 }} className="flex w-[720px] flex-col gap-7 rounded-2xl bg-card p-7 text-sm">
          <div className="flex items-center gap-2.5">
            <Button>Deploy</Button>
            <Button variant="secondary">Preview</Button>
            <Button variant="outline">Cancel</Button>
            <Badge className="ml-1">Live</Badge>
            <Badge variant="secondary">v2.4</Badge>
            <div className="ml-auto flex items-center gap-4">
              <Checkbox checked />
              <Switch checked />
            </div>
          </div>
          <Slider value={[30 + 40 * at(t, a + 500, b - 400, easeInOut)]} className="w-full" />
          <div className="flex items-center gap-4">
            <Progress value={18 + 70 * at(t, a + 500, b - 400, easeInOut)} className="flex-1" />
            <span className="w-10 text-right text-muted-foreground tabular-nums">{Math.round(18 + 70 * at(t, a + 500, b - 400, easeInOut))}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function End({ t }: { t: number }) {
  const [a] = END
  return (
    <div style={{ opacity: at(t, a, a + 700) }} className="absolute inset-0 flex flex-col items-center justify-center">
      <div style={rise(t, a + 100, a + 900, 24)} className="flex items-center gap-8">
        <SolidGlassMark className="size-[104px] -translate-y-[6px]" />
        <GlassWordmark first="Solid" second="Glass" scale={2.4} />
      </div>
      <div style={{ ...over("var(--popover)"), ...rise(t, a + 600, a + 1400, 24) }} className="mt-16 rounded-[22px] bg-popover px-9 py-6 font-mono text-[28px] tracking-tight">
        <span className="text-muted-foreground">$ </span>npx shadcn@latest add deeplethe/solid-glass/solid-glass
      </div>
      <div style={rise(t, a + 1100, a + 1900, 16)} className="mt-14 flex items-center gap-8 text-[26px] text-muted-foreground">
        <span>deeplethe.github.io/solid-glass</span>
        <span className="size-1.5 rounded-full bg-muted-foreground/60" />
        <span>
          by <span className="ml-1 font-logo tracking-[0.14em] text-foreground/85">DeepLethe</span>
        </span>
      </div>
    </div>
  )
}

declare global {
  interface Window {
    __seek?: (ms: number) => void
    __promoDuration?: number
  }
}

export function DevPromo() {
  const params = React.useMemo(() => new URLSearchParams(window.location.search), [])
  const capture = params.has("capture")
  const held = params.get("t")
  const [t, setT] = React.useState(() => (held ? +held : 0))
  const [fit, setFit] = React.useState(1)

  // Played in a loop unless a moment is held or the recorder drives the clock.
  React.useEffect(() => {
    if (capture || held) return
    const start = performance.now()
    let frame = requestAnimationFrame(function step(now) {
      setT((now - start) % DURATION)
      frame = requestAnimationFrame(step)
    })
    return () => cancelAnimationFrame(frame)
  }, [capture, held])

  React.useEffect(() => {
    window.__seek = (ms) => flushSync(() => setT(ms))
    window.__promoDuration = DURATION
    const resize = () => setFit(Math.min(window.innerWidth / W, window.innerHeight / H))
    resize()
    window.addEventListener("resize", resize)
    return () => {
      delete window.__seek
      delete window.__promoDuration
      window.removeEventListener("resize", resize)
    }
  }, [])

  // The film is dark but for one stretch in daylight.
  const light = t >= LIGHT[0] && t < LIGHT[1]
  React.useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", !light)
  }, [light])

  const on = (range: readonly [number, number]) => t >= range[0] - 1 && t <= range[1] + 1
  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-[oklch(0.08_0_0)]">
      <div
        style={{ width: W, height: H, transform: `translate(-50%, -50%) scale(${fit})` }}
        className="absolute top-1/2 left-1/2 overflow-hidden bg-background text-foreground"
      >
        <Lights t={t} />
        {on(INTRO) && <Intro t={t} />}
        {on(PANES) && <Panes t={t} />}
        {on(EDGES) && <Edges t={t} />}
        {on(STATE) && <OneState t={t} />}
        {on(AGENT) && <Agent t={t} />}
        {on(TUNE) && <Tune t={t} />}
        {on(END) && <End t={t} />}
        {/* a blink across the turn into daylight, so the page does not jump from one theme to the other */}
        <div style={{ opacity: clamp(1 - Math.abs(t - LIGHT[0]) / 220) }} className="pointer-events-none absolute inset-0 bg-[oklch(0.08_0_0)]" />
      </div>
    </div>
  )
}
