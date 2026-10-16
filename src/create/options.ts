import * as React from "react"

/**
 * What can be tuned on the Create page, and what each choice does to the material: a handful of
 * the stylesheet's own variables, per theme. A choice left at its default changes nothing, so the
 * code handed over at the end holds only what was actually tuned.
 */

export type Mode = "dark" | "light"

/**
 * The faces to choose from. One with a `pack` is fetched when it is first wanted (see `loadFont`):
 * the site carries the files itself, from Fontsource, and asks no one else for them. The first five
 * are where they have always been, so a preset made before the list grew still means what it did.
 */
type Font = { value: string; name: string; family: string; kind: "sans" | "serif" | "mono"; pack?: string }

const sans = (stack: string) => `${stack}, ui-sans-serif, system-ui, sans-serif`
const serif = (stack: string) => `${stack}, ui-serif, Georgia, serif`
const mono = (stack: string) => `${stack}, ui-monospace, SFMono-Regular, Menlo, monospace`

export const FONTS: Font[] = [
  { value: "geist", name: "Geist", kind: "sans", family: sans('"Geist Variable"') },
  { value: "system", name: "System", kind: "sans", family: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif' },
  { value: "rounded", name: "Rounded", kind: "sans", family: 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif' },
  { value: "serif", name: "Serif", kind: "serif", family: 'ui-serif, Georgia, "Times New Roman", serif' },
  { value: "mono", name: "Geist Mono", kind: "mono", family: mono('"Geist Mono Variable"') },
  { value: "inter", name: "Inter", kind: "sans", family: sans('"Inter Variable"'), pack: "inter" },
  { value: "manrope", name: "Manrope", kind: "sans", family: sans('"Manrope Variable"'), pack: "manrope" },
  { value: "figtree", name: "Figtree", kind: "sans", family: sans('"Figtree Variable"'), pack: "figtree" },
  { value: "dm-sans", name: "DM Sans", kind: "sans", family: sans('"DM Sans Variable"'), pack: "dm-sans" },
  { value: "outfit", name: "Outfit", kind: "sans", family: sans('"Outfit Variable"'), pack: "outfit" },
  { value: "plus-jakarta-sans", name: "Plus Jakarta Sans", kind: "sans", family: sans('"Plus Jakarta Sans Variable"'), pack: "plus-jakarta-sans" },
  { value: "public-sans", name: "Public Sans", kind: "sans", family: sans('"Public Sans Variable"'), pack: "public-sans" },
  { value: "nunito-sans", name: "Nunito Sans", kind: "sans", family: sans('"Nunito Sans Variable"'), pack: "nunito-sans" },
  { value: "noto-sans", name: "Noto Sans", kind: "sans", family: sans('"Noto Sans Variable"'), pack: "noto-sans" },
  { value: "roboto", name: "Roboto", kind: "sans", family: sans('"Roboto Variable"'), pack: "roboto" },
  { value: "raleway", name: "Raleway", kind: "sans", family: sans('"Raleway Variable"'), pack: "raleway" },
  { value: "ibm-plex-sans", name: "IBM Plex Sans", kind: "sans", family: sans('"IBM Plex Sans Variable"'), pack: "ibm-plex-sans" },
  { value: "space-grotesk", name: "Space Grotesk", kind: "sans", family: sans('"Space Grotesk Variable"'), pack: "space-grotesk" },
  { value: "lora", name: "Lora", kind: "serif", family: serif('"Lora Variable"'), pack: "lora" },
  { value: "source-serif-4", name: "Source Serif 4", kind: "serif", family: serif('"Source Serif 4 Variable"'), pack: "source-serif-4" },
  { value: "noto-serif", name: "Noto Serif", kind: "serif", family: serif('"Noto Serif Variable"'), pack: "noto-serif" },
  { value: "merriweather", name: "Merriweather", kind: "serif", family: serif('"Merriweather Variable"'), pack: "merriweather" },
  { value: "playfair-display", name: "Playfair Display", kind: "serif", family: serif('"Playfair Display Variable"'), pack: "playfair-display" },
  { value: "jetbrains-mono", name: "JetBrains Mono", kind: "mono", family: mono('"JetBrains Mono Variable"'), pack: "jetbrains-mono" },
]

// Written out one by one: a bundler has to see each address to carry the files, and fetches one only when asked.
const PACKS: Record<string, () => Promise<unknown>> = {
  inter: () => import("@fontsource-variable/inter"),
  manrope: () => import("@fontsource-variable/manrope"),
  figtree: () => import("@fontsource-variable/figtree"),
  "dm-sans": () => import("@fontsource-variable/dm-sans"),
  outfit: () => import("@fontsource-variable/outfit"),
  "plus-jakarta-sans": () => import("@fontsource-variable/plus-jakarta-sans"),
  "public-sans": () => import("@fontsource-variable/public-sans"),
  "nunito-sans": () => import("@fontsource-variable/nunito-sans"),
  "noto-sans": () => import("@fontsource-variable/noto-sans"),
  roboto: () => import("@fontsource-variable/roboto"),
  raleway: () => import("@fontsource-variable/raleway"),
  "ibm-plex-sans": () => import("@fontsource-variable/ibm-plex-sans"),
  "space-grotesk": () => import("@fontsource-variable/space-grotesk"),
  lora: () => import("@fontsource-variable/lora"),
  "source-serif-4": () => import("@fontsource-variable/source-serif-4"),
  "noto-serif": () => import("@fontsource-variable/noto-serif"),
  merriweather: () => import("@fontsource-variable/merriweather"),
  "playfair-display": () => import("@fontsource-variable/playfair-display"),
  "jetbrains-mono": () => import("@fontsource-variable/jetbrains-mono"),
}

const fontOf = (value: string) => FONTS.find((font) => font.value === value) ?? FONTS[0]

/** Fetch a face's files, if it has any of its own; `"all"` fetches every one, for a list that shows each in itself. */
export function loadFont(value: string) {
  const packs = value === "all" ? Object.keys(PACKS) : [fontOf(value).pack].filter((pack): pack is string => !!pack)
  packs.forEach((pack) => void PACKS[pack]?.())
}

const fontChoices = FONTS.map((font) => ({ value: font.value, label: font.name }))

// The hues a look can take, round the wheel; the chart's colours and the accent are both picked from them.
const HUES = [
  { value: "red", label: "Red" },
  { value: "orange", label: "Orange" },
  { value: "amber", label: "Amber" },
  { value: "yellow", label: "Yellow" },
  { value: "lime", label: "Lime" },
  { value: "green", label: "Green" },
  { value: "emerald", label: "Emerald" },
  { value: "teal", label: "Teal" },
  { value: "cyan", label: "Cyan" },
  { value: "sky", label: "Sky" },
  { value: "blue", label: "Blue" },
  { value: "indigo", label: "Indigo" },
  { value: "violet", label: "Violet" },
  { value: "purple", label: "Purple" },
  { value: "fuchsia", label: "Fuchsia" },
  { value: "pink", label: "Pink" },
  { value: "rose", label: "Rose" },
]

/**
 * Every option, in the order the preset string spells them. New ones go at the end, and new choices
 * at the end of a list, so a preset already handed out goes on meaning what it did. The panel shows
 * them in an order of its own (`GROUPS`).
 */
export const OPTIONS = {
  thickness: {
    label: "Thickness",
    choices: [
      { value: "thin", label: "Thin" },
      { value: "default", label: "Default" },
      { value: "thick", label: "Thick" },
      { value: "opaque", label: "Opaque" },
    ],
    default: "default",
  },
  // the grey everything is made of: no hue, or a little of one
  tint: {
    label: "Base Color",
    choices: [
      { value: "neutral", label: "Neutral" },
      { value: "cool", label: "Slate" },
      { value: "warm", label: "Stone" },
      { value: "zinc", label: "Zinc" },
      { value: "mist", label: "Mist" },
      { value: "olive", label: "Olive" },
      { value: "taupe", label: "Taupe" },
      { value: "mauve", label: "Mauve" },
    ],
    default: "neutral",
  },
  chart: {
    label: "Chart Color",
    choices: [{ value: "neutral", label: "Neutral" }, ...HUES],
    default: "neutral",
  },
  heading: { label: "Heading", choices: fontChoices, default: "geist" },
  font: { label: "Font", choices: fontChoices, default: "geist" },
  radius: {
    label: "Radius",
    choices: [
      { value: "none", label: "None" },
      { value: "small", label: "Small" },
      { value: "default", label: "Default" },
      { value: "large", label: "Large" },
    ],
    default: "default",
  },
  rim: {
    label: "Rim",
    choices: [
      { value: "soft", label: "Soft" },
      { value: "default", label: "Default" },
      { value: "bright", label: "Bright" },
    ],
    default: "default",
  },
  blur: {
    label: "Blur",
    choices: [
      { value: "none", label: "None" },
      { value: "default", label: "Default" },
      { value: "heavy", label: "Heavy" },
    ],
    default: "default",
  },
  // what the primary button, a ticked box and a filled bar are made of: ink, or ink of a colour
  accent: { label: "Accent", choices: [{ value: "ink", label: "Ink" }, ...HUES], default: "ink" },
  shadow: {
    label: "Shadow",
    choices: [
      { value: "none", label: "None" },
      { value: "soft", label: "Soft" },
      { value: "default", label: "Default" },
      { value: "deep", label: "Deep" },
    ],
    default: "default",
  },
  density: {
    label: "Density",
    choices: [
      { value: "compact", label: "Compact" },
      { value: "default", label: "Default" },
      { value: "roomy", label: "Roomy" },
    ],
    default: "default",
  },
} as const

export type OptionKey = keyof typeof OPTIONS
export type Options = Record<OptionKey, string>
export const KEYS = Object.keys(OPTIONS) as OptionKey[]

export const DEFAULTS = Object.fromEntries(KEYS.map((key) => [key, OPTIONS[key].default])) as Options

/** How the panel lays the options out: by what they are about, a rule between one group and the next. */
export const GROUPS: OptionKey[][] = [
  ["thickness", "tint", "accent", "chart"],
  ["heading", "font"],
  ["radius", "density"],
  ["rim", "shadow", "blur"],
]

/** Whole looks, each a handful of choices made together. The first is the stylesheet as it comes. */
export const STYLES: { value: string; label: string; options: Partial<Options> }[] = [
  { value: "solid-glass", label: "Solid Glass", options: {} },
  { value: "graphite", label: "Graphite", options: { thickness: "thick", tint: "cool", radius: "small", rim: "soft", font: "inter", heading: "inter" } },
  { value: "paper", label: "Paper", options: { thickness: "opaque", tint: "warm", radius: "small", shadow: "soft", font: "source-serif-4", heading: "playfair-display" } },
  { value: "terminal", label: "Terminal", options: { tint: "olive", accent: "green", chart: "green", radius: "none", blur: "none", density: "compact", font: "jetbrains-mono", heading: "jetbrains-mono" } },
  { value: "soft", label: "Soft", options: { tint: "mauve", accent: "violet", chart: "violet", radius: "large", rim: "bright", density: "roomy", font: "nunito-sans", heading: "nunito-sans" } },
  { value: "signal", label: "Signal", options: { tint: "taupe", accent: "orange", chart: "amber", shadow: "deep", font: "space-grotesk", heading: "space-grotesk" } },
]

/** The look these options are, if they are one of the named ones. */
export const styleOf = (options: Options) => STYLES.find((style) => KEYS.every((key) => options[key] === (style.options[key] ?? DEFAULTS[key])))?.value

export const TINT: Record<string, Record<Mode, { c: number; h: number }>> = {
  neutral: { dark: { c: 0, h: 0 }, light: { c: 0.005, h: 265 } },
  cool: { dark: { c: 0.014, h: 262 }, light: { c: 0.014, h: 262 } },
  warm: { dark: { c: 0.011, h: 70 }, light: { c: 0.012, h: 80 } },
  zinc: { dark: { c: 0.007, h: 286 }, light: { c: 0.008, h: 286 } },
  mist: { dark: { c: 0.014, h: 205 }, light: { c: 0.014, h: 205 } },
  olive: { dark: { c: 0.014, h: 125 }, light: { c: 0.016, h: 120 } },
  taupe: { dark: { c: 0.012, h: 40 }, light: { c: 0.013, h: 45 } },
  mauve: { dark: { c: 0.015, h: 320 }, light: { c: 0.015, h: 320 } },
}

// The shadows a pane casts: under it, where it touches, and where it lifts. Each is black (or the
// light theme's blue-black) at so much, and a choice of shadow is that much times a number.
const SHADES: Record<Mode, Record<"shade" | "contact" | "lift", [string, number]>> = {
  dark: { shade: ["0 0 0", 60], contact: ["0 0 0", 10], lift: ["0 0 0", 22] },
  light: { shade: ["0.3 0.06 265", 28], contact: ["0.25 0.03 265", 6], lift: ["0.25 0.03 265", 14] },
}
const SHADOW: Record<string, number> = { none: 0, soft: 0.5, deep: 1.7 }

const DENSITY: Record<string, string> = { compact: "0.225rem", roomy: "0.28rem" }

// Ink of a colour, per hue and theme: lightness, chroma, and whether white or dark is written on it.
// White needs the fill dark enough to be read at 4.5:1 or better once the pane lets the page through,
// and the hues near green are brighter at the same lightness, so each is set on its own; chroma is
// as much as the screen can show at that lightness, so the hue does not shift when it is clipped.
// Amber, yellow and lime are only themselves when they are bright, and carry dark writing; so does
// orange on a light page, where white would need it so dark it turns to rust.
type Ink = [l: number, c: number, on: "white" | "dark"]
const INK: Record<string, Record<Mode, Ink>> = {
  red: { light: [0.54, 0.2, "white"], dark: [0.62, 0.19, "white"] },
  orange: { light: [0.72, 0.19, "dark"], dark: [0.62, 0.16, "white"] },
  amber: { light: [0.79, 0.165, "dark"], dark: [0.8, 0.165, "dark"] },
  yellow: { light: [0.79, 0.16, "dark"], dark: [0.8, 0.165, "dark"] },
  lime: { light: [0.79, 0.17, "dark"], dark: [0.8, 0.17, "dark"] },
  green: { light: [0.48, 0.13, "white"], dark: [0.58, 0.155, "white"] },
  emerald: { light: [0.48, 0.1, "white"], dark: [0.59, 0.125, "white"] },
  teal: { light: [0.49, 0.085, "white"], dark: [0.59, 0.105, "white"] },
  cyan: { light: [0.49, 0.085, "white"], dark: [0.59, 0.1, "white"] },
  sky: { light: [0.49, 0.1, "white"], dark: [0.6, 0.125, "white"] },
  blue: { light: [0.5, 0.16, "white"], dark: [0.61, 0.19, "white"] },
  indigo: { light: [0.51, 0.2, "white"], dark: [0.61, 0.19, "white"] },
  violet: { light: [0.52, 0.2, "white"], dark: [0.62, 0.19, "white"] },
  purple: { light: [0.52, 0.2, "white"], dark: [0.62, 0.19, "white"] },
  fuchsia: { light: [0.53, 0.2, "white"], dark: [0.62, 0.19, "white"] },
  pink: { light: [0.54, 0.2, "white"], dark: [0.62, 0.19, "white"] },
  rose: { light: [0.54, 0.2, "white"], dark: [0.62, 0.19, "white"] },
}
function ink(hue: string, mode: Mode) {
  const h = CHART_HUE[hue]
  const [l, c, on] = INK[hue][mode]
  return { fill: `oklch(${l} ${c} ${h})`, on: on === "white" ? "oklch(0.985 0 0)" : `oklch(0.24 0.05 ${h})` }
}

// The dark theme finishes its ink as the light pane it is: a full line of light on top and a pale
// hairline. Ink of a colour is a mid-tone, and is finished as the light theme finishes its own.
const COLOURED_INK_DARK: Record<string, string> = {
  "--primary-rim": "oklch(1 0 0 / 30%)",
  "--primary-under": "oklch(0 0 0 / 40%)",
  "--primary-inner": "oklch(1 0 0 / 7%)",
  "--primary-edge": "oklch(0.2 0 0 / 30%)",
}

// Fill and how much of it: the pane's lightness, then its opacity at each thickness.
const PANES: Record<Mode, { background: number; card: [number, number[]]; panel: [number, number[]]; popover: [number, number[]]; solid: number[] }> = {
  dark: { background: 0.16, card: [0.31, [30, 46, 68]], panel: [1, [3, 4.5, 7.5]], popover: [0.22, [86, 96, 99]], solid: [0.19, 0.225, 0.22] },
  light: { background: 0.925, card: [0.98, [40, 60, 82]], panel: [0.975, [28, 44, 64]], popover: [0.985, [86, 96, 99]], solid: [0.947, 0.958, 0.98] },
}

/** Where each chart colour sits on the wheel; the five steps of a chart share it and differ in lightness. */
export const CHART_HUE: Record<string, number> = {
  red: 27,
  orange: 50,
  amber: 75,
  yellow: 98,
  lime: 128,
  green: 150,
  emerald: 163,
  teal: 183,
  cyan: 212,
  sky: 235,
  blue: 255,
  indigo: 275,
  violet: 293,
  purple: 307,
  fuchsia: 325,
  pink: 350,
  rose: 12,
}
// On a dark page the first step is the brightest and so the clearest; on a light one the lightest
// would be the faintest, and the first is what most charts lead with. So the light steps start at
// a mid-tone that still reads on a card, keep their widest step between the first two (the pair
// most charts set side by side), and close up towards the darkest.
const CHART_LIGHT: Record<Mode, number[]> = { dark: [0.94, 0.83, 0.69, 0.56, 0.44], light: [0.7, 0.55, 0.46, 0.38, 0.31] }
// How much colour each step carries: a light page needs more of it than a dark one to read as the hue.
const CHART_CHROMA: Record<Mode, number[]> = { dark: [0.07, 0.13, 0.15, 0.13, 0.1], light: [0.15, 0.18, 0.16, 0.14, 0.12] }

const RADIUS: Record<string, [string, string]> = { none: ["0rem", "0rem"], small: ["0.5rem", "0.4rem"], large: ["1.125rem", "0.9rem"] }
const RIM: Record<string, Record<Mode, [number, number]>> = {
  soft: { dark: [8, 5], light: [55, 50] },
  bright: { dark: [32, 22], light: [100, 100] },
}

const colour = (l: number, tint: { c: number; h: number }, alpha?: number) =>
  `oklch(${l} ${tint.c} ${tint.c ? tint.h : 0}${alpha === undefined ? "" : ` / ${alpha}%`})`

/** The variables one theme takes for these options: only the ones that differ from the stylesheet. */
export function overrides(options: Options, mode: Mode): Record<string, string> {
  const vars: Record<string, string> = {}
  const tint = (TINT[options.tint] ?? TINT.neutral)[mode]
  const panes = PANES[mode]

  if (options.tint !== "neutral") vars["--background"] = colour(panes.background, tint)

  if (options.thickness !== "default" || options.tint !== "neutral") {
    if (options.thickness === "opaque") {
      vars["--panel"] = colour(panes.solid[0], tint)
      vars["--card"] = colour(panes.solid[1], tint)
      vars["--popover"] = colour(panes.solid[2], tint)
    } else {
      const at = ["thin", "default", "thick"].indexOf(options.thickness)
      // In dark the panel is a wash of white, whatever the tint: that is what makes it the thinnest.
      vars["--panel"] = mode === "dark" ? `oklch(1 0 0 / ${panes.panel[1][at]}%)` : colour(panes.panel[0], tint, panes.panel[1][at])
      vars["--card"] = colour(panes.card[0], tint, panes.card[1][at])
      vars["--popover"] = colour(panes.popover[0], tint, panes.popover[1][at])
    }
  }

  if (options.chart !== "neutral") {
    const h = CHART_HUE[options.chart]
    CHART_LIGHT[mode].forEach((l, index) => {
      vars[`--chart-${index + 1}`] = `oklch(${l} ${CHART_CHROMA[mode][index]} ${h})`
    })
  }

  if (options.rim !== "default") {
    const [rim, control] = RIM[options.rim][mode]
    vars["--glass-rim"] = `oklch(1 0 0 / ${rim}%)`
    vars["--glass-control-rim"] = `oklch(1 0 0 / ${control}%)`
  }

  if (options.accent !== "ink") {
    const { fill, on } = ink(options.accent, mode)
    vars["--primary"] = fill
    vars["--primary-foreground"] = on
    vars["--sidebar-primary"] = fill
    vars["--sidebar-primary-foreground"] = on
    if (mode === "dark") Object.assign(vars, COLOURED_INK_DARK)
  }

  if (options.shadow !== "default") {
    const by = SHADOW[options.shadow]
    for (const name of ["shade", "contact", "lift"] as const) {
      const [black, alpha] = SHADES[mode][name]
      vars[`--glass-${name}`] = `oklch(${black} / ${Math.min(100, Math.round(alpha * by * 10) / 10)}%)`
    }
  }

  return vars
}

/** The variables that are the same in both themes. */
export function shared(options: Options): Record<string, string> {
  const vars: Record<string, string> = {}
  if (options.radius !== "default") {
    vars["--radius"] = RADIUS[options.radius][0]
    vars["--radius-control"] = RADIUS[options.radius][1]
  }
  if (options.blur === "none" || options.thickness === "opaque") {
    vars["--glass-blur"] = "none"
    vars["--glass-blur-control"] = "none"
  } else if (options.blur === "heavy") {
    vars["--glass-blur"] = "blur(48px) saturate(180%)"
    vars["--glass-blur-control"] = "blur(24px)"
  }
  return vars
}

/** The one colour a look has, if it has one: its accent's, or the chart's, or failing those the base colour's. */
export function wash(options: Options, mode: Mode): string | undefined {
  if (options.accent !== "ink") return ink(options.accent, mode).fill
  if (options.chart !== "neutral") return `oklch(${mode === "dark" ? 0.72 : 0.6} 0.17 ${CHART_HUE[options.chart]})`
  if (options.tint !== "neutral") return `oklch(0.62 0.09 ${TINT[options.tint][mode].h})`
  return undefined
}

export const fontFamily = (value: string) => fontOf(value).family

/** What the theme takes that is not a colour: the faces, and how much room things are given. */
export function theme(options: Options): Record<string, string> {
  const vars: Record<string, string> = {}
  if (options.font !== "geist") vars["--font-sans"] = fontFamily(options.font)
  if (options.heading !== options.font) vars["--font-heading"] = fontFamily(options.heading)
  if (options.density !== "default") vars["--spacing"] = DENSITY[options.density]
  return vars
}

/** The faces a look uses that have to be installed, as the packages they come in. */
export const packages = (options: Options) => [...new Set([options.font, options.heading].map((value) => fontOf(value).pack).filter((pack): pack is string => !!pack))].map((pack) => `@fontsource-variable/${pack}`)

const block = (selector: string, vars: Record<string, string>) =>
  Object.keys(vars).length ? `${selector} {\n${Object.entries(vars).map(([name, value]) => `  ${name}: ${value};`).join("\n")}\n}\n` : ""

/** The CSS to put after the stylesheet: what was tuned, and nothing else. */
export function code(options: Options): string {
  const parts = [
    block(":root", { ...shared(options), ...overrides(options, "light") }),
    block(".dark", overrides(options, "dark")),
  ]
  parts.push(block("@theme", theme(options)))
  const css = parts.filter(Boolean).join("\n")
  const faces = packages(options).map((name) => `@import "${name}";\n`).join("")
  return (faces ? `${faces}\n` : "") + (css || "/* Nothing tuned: the stylesheet as it comes. */\n")
}

/** A preset is the options spelled as one character each, in order: "12000211". One from before an option was added is shorter, and what it does not say is as it comes. */
export const encode = (options: Options) => KEYS.map((key) => OPTIONS[key].choices.findIndex((choice) => choice.value === options[key]).toString(36)).join("")

export function decode(preset: string | null): Options {
  const options = { ...DEFAULTS }
  if (!preset || preset.length > KEYS.length) return options
  KEYS.slice(0, preset.length).forEach((key, index) => {
    const choice = OPTIONS[key].choices[parseInt(preset[index], 36)]
    if (choice) options[key] = choice.value
  })
  return options
}

export const shuffle = (): Options =>
  Object.fromEntries(KEYS.map((key) => [key, OPTIONS[key].choices[Math.floor(Math.random() * OPTIONS[key].choices.length)].value])) as Options

export const CreateContext = React.createContext<Options>(DEFAULTS)
