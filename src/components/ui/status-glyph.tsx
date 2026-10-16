"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type Activity = "thinking" | "searching" | "running" | "writing" | "compacting"

/** One of the three points: where it is in a 16 by 16 box, how bright, how large. */
export type Dot = { x: number; y: number; o: number; s: number }
/**
 * Where the three points are at a time in seconds. A figure made of several
 * taken in turn carries them as `parts`, so each can also be played alone.
 */
export type Figure = ((t: number) => Dot[]) & { parts?: Figure[] }

const TAU = Math.PI * 2
/** Where in its cycle a figure is, from 0 to 1, for a time in seconds. */
const cycle = (t: number, period: number) => (((t % period) + period) % period) / period
const easeInOut = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2)
const easeOut = (u: number) => 1 - Math.pow(1 - u, 3)
const lerp = (a: number, b: number, k: number) => a + (b - a) * k
const mix = (a: Dot[], b: Dot[], k: number): Dot[] =>
  a.map((dot, i) => ({
    x: lerp(dot.x, b[i].x, k),
    y: lerp(dot.y, b[i].y, k),
    o: lerp(dot.o, b[i].o, k),
    s: lerp(dot.s, b[i].s, k),
  }))

/** The corners the three points rest on when they make the mark's triangle. */
const CORNERS = [
  { x: 8, y: 2.6 },
  { x: 13, y: 11.4 },
  { x: 3, y: 11.4 },
]
const SQUARE = [
  { x: 3.5, y: 3.5 },
  { x: 12.5, y: 3.5 },
  { x: 12.5, y: 12.5 },
  { x: 3.5, y: 12.5 },
]

/**
 * A point in space, seen from in front: nearer is larger and brighter, farther
 * is smaller and dimmer. That is all the depth there is — no shading, no
 * blur — and it is enough for three points going round to read as turning in
 * three dimensions instead of sliding about on the page.
 */
const EYE = 15
function seen(x: number, y: number, z: number): Dot {
  const scale = EYE / (EYE - z)
  return { x: 8 + x * scale, y: 8.3 + y * scale, o: 0.3 + 0.7 * ((z + 5) / 10), s: 0.72 + 0.5 * ((z + 5) / 10) }
}
/** Turn a point about the x axis, then about the z axis. */
function tilted(x: number, y: number, z: number, aboutX: number, aboutZ: number) {
  const y1 = y * Math.cos(aboutX) - z * Math.sin(aboutX)
  const z1 = y * Math.sin(aboutX) + z * Math.cos(aboutX)
  return [x * Math.cos(aboutZ) - y1 * Math.sin(aboutZ), x * Math.sin(aboutZ) + y1 * Math.cos(aboutZ), z1] as const
}

/** The triangle turning flat on the page. */
const spin: Figure = (t) => {
  const u = cycle(t, 2.6)
  const turn = TAU * easeInOut(u) - TAU / 4
  return [0, 1, 2].map((i) => {
    const angle = turn + (i * TAU) / 3
    return {
      x: 8 + 4.7 * Math.cos(angle),
      y: 8.4 + 4.7 * Math.sin(angle),
      o: 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(TAU * (u - i / 3))),
      s: 1,
    }
  })
}

/** One ring, leaning back: the three go round it, coming forward and falling away. */
const ring: Figure = (t) =>
  [0, 1, 2].map((i) => {
    const angle = TAU * (t / 2.4) + (i * TAU) / 3
    return seen(...tilted(5.2 * Math.cos(angle), 5.2 * Math.sin(angle), 0, 1.15, -0.35))
  })

/** Three rings on three planes, a point on each, like the picture of an atom. */
const atom: Figure = (t) =>
  [0, 1, 2].map((i) => {
    const angle = TAU * (t / 2.1) + i * 2.1
    return seen(...tilted(5 * Math.cos(angle), 5 * Math.sin(angle), 0, 1.2, (i * TAU) / 6))
  })

/** The triangle itself turning about its upright, like a sign in the wind. */
const tumble: Figure = (t) => {
  const about = TAU * (t / 3)
  return CORNERS.map((corner) => {
    const x = corner.x - 8
    const y = corner.y - 8.3
    // Leant a little toward the eye, so the top corner travels too.
    const [lx, ly, lz] = tilted(x, y, 0, 0.45, 0)
    return seen(lx * Math.cos(about) + lz * Math.sin(about), ly, -lx * Math.sin(about) + lz * Math.cos(about))
  })
}

/** Round a square, one behind the other, seen square-on. */
const lap: Figure = (t) =>
  [0, 1, 2].map((i) => {
    const p = cycle(t - i * 0.26, 2.6) * 4
    const side = Math.floor(p) % 4
    const along = easeInOut(p - Math.floor(p))
    const from = SQUARE[side]
    const to = SQUARE[(side + 1) % 4]
    return { x: lerp(from.x, to.x, along), y: lerp(from.y, to.y, along), o: [1, 0.6, 0.3][i], s: 1 }
  })

/** The square circuit laid down flat and seen from above its near edge. */
const circuit: Figure = (t) =>
  [0, 1, 2].map((i) => {
    const p = cycle(t - i * 0.26, 2.6) * 4
    const side = Math.floor(p) % 4
    const along = easeInOut(p - Math.floor(p))
    const from = SQUARE[side]
    const to = SQUARE[(side + 1) % 4]
    const dot = seen(...tilted(lerp(from.x, to.x, along) - 8, lerp(from.y, to.y, along) - 8, 0, 1.05, 0.3))
    return { ...dot, o: dot.o * [1, 0.7, 0.45][i] }
  })

/**
 * Several figures taken in turn: each holds for a while, then turns into the
 * next. A state that lasts minutes is then not minutes of one motion.
 */
function inTurn(figures: Figure[], hold: number, change = 0.7): Figure {
  const whole: Figure = (t) => {
    const at = cycle(t, hold * figures.length) * figures.length
    const index = Math.floor(at) % figures.length
    const into = (at - Math.floor(at)) * hold - (hold - change)
    const now = figures[index](t)
    return into <= 0 ? now : mix(now, figures[(index + 1) % figures.length](t), easeInOut(into / change))
  }
  whole.parts = figures
  return whole
}

/** Three in a row, each lifting in its turn. */
const wave: Figure = (t) =>
  [0, 1, 2].map((i) => {
    const phase = cycle(t - i * 0.16, 1.3)
    const lift = phase < 0.5 ? Math.sin(Math.PI * (phase / 0.5)) : 0
    return { x: 3.5 + 4.5 * i, y: 9 - 3 * lift, o: 0.45 + 0.55 * lift, s: 1 }
  })

/** Three in a row, a light passing along them. */
const sweep: Figure = (t) =>
  [0, 1, 2].map((i) => {
    const phase = cycle(t - i * 0.2, 1.5)
    const lit = Math.sin(Math.PI * Math.min(phase / 0.6, 1))
    return { x: 3.5 + 4.5 * i, y: 8, o: 0.35 + 0.65 * lit, s: 0.85 + 0.4 * lit }
  })

/** Out from the middle toward the corners, one after another, fading as they go. */
const reach: Figure = (t) =>
  [0, 1, 2].map((i) => {
    const p = cycle(t - i * 0.66, 2)
    const out = easeOut(p)
    const far = { x: 8 + (CORNERS[i].x - 8) * 1.25, y: 8 + (CORNERS[i].y - 8) * 1.25 }
    return {
      x: lerp(8, far.x, out),
      y: lerp(8, far.y, out),
      o: p < 0.18 ? p / 0.18 : 1 - (p - 0.18) / 0.82,
      s: 0.6 + 0.4 * out,
    }
  })

/** Into the middle, one, and apart again. */
const gather: Figure = (t) => {
  const p = cycle(t, 1.9)
  const k = p < 0.15 ? 0 : p < 0.5 ? easeInOut((p - 0.15) / 0.35) : p < 0.62 ? 1 : 1 - easeInOut((p - 0.62) / 0.38)
  return CORNERS.map((corner) => ({ x: lerp(corner.x, 8, k), y: lerp(corner.y, 8, k), o: 1, s: 1 + 0.15 * k }))
}

/**
 * The figures. Each is where the three points are, how bright and how large,
 * at a time in seconds — a function rather than a keyframe animation, because
 * two functions can be blended and two CSS animations cannot. That is what
 * lets one figure turn into the next.
 */
const FIGURES: Record<Activity, Figure> = {
  // They circle one another, turning the question over — flat at first, then
  // leaning into depth: a ring seen at an angle, three rings at once, the
  // triangle turning about its own upright.
  thinking: inTurn([spin, ring, atom, tumble], 4.5),
  // The three dots of something being written: lifting in turn, then a light
  // running along the row.
  writing: inTurn([wave, sweep], 4),
  // They set out from the middle toward the corners, one after another, and
  // fade as they go: feelers sent out, again and again.
  searching: reach,
  // They go round a square, one behind the other: seen square-on, then with
  // the circuit laid flat and seen at an angle.
  running: inTurn([lap, circuit], 5.2),
  // They fall into the middle, become one, and spring apart.
  compacting: gather,
}

/**
 * Every figure on its own, with the activity it belongs to: an activity that
 * takes several in turn gives one entry each. For a page that shows them all.
 */
export const STATUS_FIGURES: { activity: Activity; name: string; figure: Figure }[] = (
  [
    ["thinking", ["spin", "ring", "atom", "tumble"]],
    ["writing", ["wave", "sweep"]],
    ["searching", ["reach"]],
    ["running", ["lap", "circuit"]],
    ["compacting", ["gather"]],
  ] as const
).flatMap(([activity, names]) =>
  (FIGURES[activity].parts ?? [FIGURES[activity]]).map((figure, i) => ({ activity, name: names[i], figure }))
)

/** How long one figure takes to become another. */
const MORPH_MS = 450
const RADIUS = 1.7

/**
 * The sign that a turn is going, and of what it is doing: three points of
 * light — the three corners of a triangle — and a way of moving for each
 * kind of work. The points are always the same three; what changes is the
 * figure they make.
 *
 * When the work changes, the points travel from wherever they are to their
 * places in the new figure rather than jumping there: the old figure is held
 * as it stood at that moment and blended into the new one as it moves.
 *
 * `figure` plays one figure alone instead of the activity's own (which may
 * take several in turn); see STATUS_FIGURES.
 *
 * With reduced motion the points hold each figure's opening pose.
 */
export function StatusGlyph({
  activity = "thinking",
  figure,
  className,
}: {
  activity?: Activity
  figure?: Figure
  className?: string
}) {
  const svg = React.useRef<SVGSVGElement>(null)
  // Keep the clock and transition state when the figure changes.
  const wanted = React.useRef<Figure>(figure ?? FIGURES[activity])
  const refreshAnimation = React.useRef<(() => void) | null>(null)
  React.useEffect(() => {
    wanted.current = figure ?? FIGURES[activity]
    refreshAnimation.current?.()
  }, [activity, figure])

  React.useEffect(() => {
    const element = svg.current
    if (!element) return
    const circles = [...element.querySelectorAll("circle")]
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const draw = (dots: Dot[]) =>
      dots.forEach((dot, i) => {
        const circle = circles[i]
        if (!circle) return
        circle.setAttribute("cx", dot.x.toFixed(2))
        circle.setAttribute("cy", dot.y.toFixed(2))
        circle.setAttribute("r", (RADIUS * dot.s).toFixed(2))
        circle.setAttribute("opacity", Math.max(0, Math.min(1, dot.o)).toFixed(2))
      })

    let visible = false
    let frame: number | null = null
    let showing = wanted.current
    // What the points were doing when the figure last changed, and when.
    let left: Dot[] | null = null
    let changedAt = 0
    let last = showing(0)
    const began = performance.now()
    function step(now: number) {
      if (wanted.current !== showing) {
        showing = wanted.current
        left = last
        changedAt = now
      }
      let dots = showing((now - began) / 1000)
      if (left) {
        const k = (now - changedAt) / MORPH_MS
        if (k >= 1) left = null
        else dots = mix(left, dots, easeInOut(k))
      }
      last = dots
      draw(dots)
      frame = requestAnimationFrame(step)
    }

    function refresh() {
      const shouldAnimate = visible && !document.hidden && !reducedMotion.matches
      if (shouldAnimate) {
        if (frame === null) frame = requestAnimationFrame(step)
        return
      }

      if (frame !== null) cancelAnimationFrame(frame)
      frame = null
      if (!visible || document.hidden) return

      showing = wanted.current
      left = null
      last = showing(0)
      draw(last)
    }

    // Offscreen glyphs keep their clock, but do not schedule frames.
    const observer = new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1].isIntersecting
      refresh()
    })
    observer.observe(element)
    reducedMotion.addEventListener("change", refresh)
    document.addEventListener("visibilitychange", refresh)
    refreshAnimation.current = refresh

    return () => {
      if (frame !== null) cancelAnimationFrame(frame)
      observer.disconnect()
      // Discard queued notifications so an unmounted glyph cannot restart.
      observer.takeRecords()
      reducedMotion.removeEventListener("change", refresh)
      document.removeEventListener("visibilitychange", refresh)
      refreshAnimation.current = null
    }
  }, [])

  return (
    <svg
      ref={svg}
      data-slot="status-glyph"
      viewBox="0 0 16 16"
      aria-hidden="true"
      fill="currentColor"
      className={cn("size-4 shrink-0 overflow-visible", className)}
    >
      {CORNERS.map((corner, i) => (
        <circle key={i} cx={corner.x} cy={corner.y} r={RADIUS} />
      ))}
    </svg>
  )
}

/**
 * A count that climbs to its new value instead of jumping to it: the figure
 * simply counts up over a moment, in place. Nothing moves but the digits.
 */
export function RollingNumber({ value, className }: { value: number; className?: string }) {
  const [shown, setShown] = React.useState(value)
  const from = React.useRef(value)

  React.useEffect(() => {
    const start = from.current
    if (start === value) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      from.current = value
      setShown(value)
      return
    }
    const began = performance.now()
    let frame = requestAnimationFrame(function step(now) {
      const t = Math.min(1, (now - began) / 350)
      const next = Math.round(start + (value - start) * t)
      from.current = next
      setShown(next)
      if (t < 1) frame = requestAnimationFrame(step)
    })
    return () => cancelAnimationFrame(frame)
  }, [value])

  return <span className={cn("tabular-nums", className)}>{shown.toLocaleString()}</span>
}
