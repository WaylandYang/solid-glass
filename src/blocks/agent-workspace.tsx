"use client"

import * as React from "react"
import {
  ChevronRightIcon,
  FileTextIcon,
  FolderIcon,
  FolderPlusIcon,
  ListChecksIcon,
  PanelLeftIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  SquareIcon,
  UploadIcon,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { AskCard } from "@/components/ui/ask-card"
import { Button } from "@/components/ui/button"
import { Composer, ComposerFooter, ComposerFooterEnd, ComposerPick } from "@/components/ui/composer"
import { ContextRing } from "@/components/ui/context-ring"
import { Kbd } from "@/components/ui/kbd"
import { Panel, PanelRow } from "@/components/ui/panel"
import { Tag } from "@/components/ui/tag"
import { StepGroup, type Step } from "@/components/ui/tool-steps"
import { TurnStatus } from "@/components/ui/turn-status"

/**
 * Agent workspace: an application where an agent works, whole. Sessions on the left, the thread in
 * the middle (what was asked, the steps taken, the answer, and the question it has for you), and on
 * the right what it has made and what it is still running.
 *
 * Everything on it answers: sessions can be chosen, searched and begun, the question answered, a
 * message sent, a file picked and attached, a folder opened, a task stopped, a panel shut and
 * opened again. None of it reaches anything: the data is made up and lives at the top of the file,
 * the state is kept here, and where an agent would reply there is one set sentence. Replace both
 * with your own.
 */

// A turn of the thread: what the user said, and what came back: the steps taken, the answer, a question.
type Turn = {
  id: string
  said?: string
  attached?: string[]
  steps?: Step[]
  reply?: React.ReactNode
  ask?: { question: string; options: string[] }
}
type Session = { id: string; group: string; name: string; turns: Turn[] }

// What it wrote, as the patch it made: the row for it opens as a diff.
const NOTES = `@@ -0,0 +1,7 @@
+# Interface coatings for sulfide electrolytes
+
+Six papers, three ways forward:
+
+- Coat the cathode: the most data, the quickest check.
+- Change the dopant: a higher ceiling, new samples needed.
+- Benchmark only: nothing new to make, the least to learn.
`

// Each step is one line, and opens to the call itself: what was asked for, and what came back.
const STEPS: Step[] = [
  {
    id: "search",
    label: "Searched for “sulfide electrolytes, interface stability”",
    status: "done",
    detail: "sulfide electrolytes, interface stability",
    detailLabel: "Query",
    output: "14 results, 6 kept\ncoating-review.pdf\nsulfide-interfaces.pdf\ndopant-screening.pdf\ngarnet-stability.pdf\ncycle-life.csv\nbaseline.yaml",
  },
  {
    id: "read",
    label: "Read 6 papers",
    status: "done",
    output: "coating-review.pdf        42 pages\nsulfide-interfaces.pdf    18 pages\ndopant-screening.pdf      11 pages\ngarnet-stability.pdf      23 pages\n2 data files read as tables",
  },
  { id: "write", label: "Wrote survey/notes.md", status: "done", patch: NOTES },
]

const DIRECTIONS = [
  { name: "Coat the cathode.", note: "Data and code exist, and a first check fits in a week." },
  { name: "Change the dopant.", note: "A higher ceiling, but it means new samples: three weeks at least." },
  { name: "Benchmark only.", note: "The lowest risk, and the smallest result." },
]

const SESSIONS: Session[] = [
  {
    id: "baseline",
    group: "Solid electrolytes",
    name: "Baseline, reproduced",
    turns: [
      { id: "b1", said: "Reproduce the baseline from the paper before we change anything." },
      {
        id: "b2",
        steps: [
          { id: "clone", label: "Read research/baseline.yaml", status: "done", output: "cathode: NMC811\nelectrolyte: Li6PS5Cl\ncycles: 500\nseeds: [0, 1, 2]" },
          {
            id: "run",
            label: "Ran rerun.py on three seeds",
            status: "done",
            detail: "python rerun.py --seeds 0 1 2",
            detailLabel: "Command",
            output: "seed 0   retention 91.4%\nseed 1   retention 91.0%\nseed 2   retention 91.3%\nreported          91.2%",
          },
        ],
        reply: "Reproduced: the three seeds land within 0.4% of the reported capacity retention. The configuration is in research/baseline.yaml.",
      },
    ],
  },
  {
    id: "survey",
    group: "Solid electrolytes",
    name: "Survey of interface coatings",
    turns: [
      { id: "s1", said: "Survey the related work first, then give me a few directions to choose from." },
      {
        id: "s2",
        steps: STEPS,
        reply: (
          <>
            <p>
              The survey is done; the notes are in <code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-[12.5px]">survey/notes.md</code>. Three
              directions stand out:
            </p>
            <ol className="flex list-decimal flex-col gap-1 pl-5 marker:text-muted-foreground">
              {DIRECTIONS.map((direction) => (
                <li key={direction.name}>
                  <span className="font-semibold">{direction.name}</span> {direction.note}
                </li>
              ))}
            </ol>
            <p>I would take the first.</p>
          </>
        ),
        ask: {
          question: "Which direction should I write the proposal for? It goes in research/ROADMAP.md, and the baseline rerun carries on either way.",
          options: ["Coat the cathode", "Change the dopant", "Benchmark only"],
        },
      },
    ],
  },
  {
    id: "cycle",
    group: "Benchmarks",
    name: "Cycle-life run 12",
    turns: [
      { id: "c1", said: "How did run 12 end?" },
      { id: "c2", reply: "Run 12 stopped at cycle 480 with 91.2% of its capacity left, a little above run 11. The curve is in the project's results folder." },
    ],
  },
  {
    id: "review",
    group: "Benchmarks",
    name: "Notes for the review",
    turns: [
      { id: "r1", said: "Collect what the reviewers are likely to ask about the benchmark." },
      { id: "r2", reply: "Three things: how the cells were matched, why the cut-off voltage differs from the reference, and whether the seeds were fixed before the runs." },
    ],
  },
]

// The project as a tree: a folder is its chevron, a file a small mark and its size.
type Node = { name: string; size?: string; children?: Node[] }

const TREE: Node[] = [
  {
    name: "survey",
    children: [
      { name: "sources", children: [{ name: "coating-review.pdf", size: "1.2 MB" }] },
      { name: "notes.md", size: "4 KB" },
      { name: "report.md", size: "15 KB" },
      { name: "sources.json", size: "57 KB" },
    ],
  },
  {
    name: "research",
    children: [
      { name: "ROADMAP.md", size: "2 KB" },
      { name: "baseline.yaml", size: "2 KB" },
    ],
  },
  { name: "paper", children: [{ name: "main.tex", size: "9 KB" }] },
  { name: "rerun.py", size: "5 KB" },
]

// What it started and did not wait for: a board to a task, with its kind, how it stands and for how long.
type Task = { title: string; kind: string; state: string; time: string; tokens?: string; activity?: string; running?: boolean }

const TASKS: Task[] = [
  { title: "Rerun the baseline", kind: "Command", state: "Running", time: "2m 14s", activity: "python rerun.py --timeout 120", running: true },
  { title: "Collect citations", kind: "Subagent", state: "Running", time: "41s", tokens: "3,280 tok", activity: "Reading coating-review.pdf", running: true },
  { title: "Background reading", kind: "Subagent", state: "Completed", time: "18s" },
]

const MODES = [
  { value: "ask", label: "Ask first", hint: "Stops where the choice is yours" },
  { value: "auto", label: "On its own", hint: "Decides and carries on" },
]
const MODELS = [
  { value: "large", label: "model-large" },
  { value: "small", label: "model-small" },
]
const EFFORTS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
]

// what stands in for an agent's reply, and how long it takes to come
const REPLY = "Noted. I will take that into the next step."
const REPLIES_AFTER = 1600

const INDENT = 12

/** Whether the window is at least so wide: asked when something is pressed, to know which of two things it should do. */
const wide = (query: string) => window.matchMedia(query).matches

/** Whether a node or anything under it has `query` in its name. */
const matches = (node: Node, query: string): boolean => node.name.toLowerCase().includes(query) || !!node.children?.some((child) => matches(child, query))

function Tree({
  nodes,
  open,
  chosen,
  query,
  onToggle,
  onChoose,
  depth = 0,
  under = "",
}: {
  nodes: Node[]
  /** the folders standing open, by path */
  open: Set<string>
  chosen: string
  /** what is being looked for: only what has it, or has something with it, is listed, and every folder stands open */
  query: string
  onToggle: (path: string) => void
  onChoose: (path: string) => void
  depth?: number
  under?: string
}) {
  return (
    <ul>
      {nodes
        .filter((node) => !query || matches(node, query))
        .map((node) => {
          const path = under + node.name
          const shown = !!node.children && (!!query || open.has(path))
          return (
            <li key={path}>
              <button
                type="button"
                aria-expanded={node.children ? shown : undefined}
                aria-current={chosen === path || undefined}
                onClick={() => (node.children ? onToggle(path) : onChoose(path))}
                style={{ paddingLeft: 6 + depth * INDENT }}
                className={cn(
                  "flex w-full items-center gap-1 rounded-sm py-[3px] pr-2 text-left transition-colors outline-none hover:bg-accent focus-visible:bg-accent",
                  chosen === path && "glass-chosen"
                )}
              >
                {node.children ? (
                  <ChevronRightIcon strokeWidth={1.5} className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform", shown && "rotate-90")} />
                ) : (
                  // where a folder has its chevron, and as light: the name is what is read
                  <FileTextIcon strokeWidth={1.5} className="ml-0.5 size-3 shrink-0 text-muted-foreground/70" />
                )}
                <span className="min-w-0 flex-1 truncate text-[12.5px]">{node.name}</span>
                {node.size && <span className="shrink-0 text-[11px] text-muted-foreground/80 tabular-nums">{node.size}</span>}
              </button>
              {node.children && shown && (
                <Tree nodes={node.children} open={open} chosen={chosen} query={query} onToggle={onToggle} onChoose={onChoose} depth={depth + 1} under={`${path}/`} />
              )}
            </li>
          )
        })}
    </ul>
  )
}

function TaskBoard({ task, onStop }: { task: Task; onStop: () => void }) {
  return (
    <li className="glass-control rounded-md bg-(--glass-control) px-3 py-2.5">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[13px] leading-snug text-foreground/85">{task.title}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-muted-foreground tabular-nums">
            <span>{task.kind}</span>
            <span>{task.state}</span>
            <span>{task.time}</span>
            {task.tokens && <span>{task.tokens}</span>}
          </p>
          {task.running && task.activity && <p className="status-shimmer mt-1 truncate font-mono text-[11px]">{task.activity}</p>}
        </div>
        {task.running && (
          <button
            type="button"
            aria-label={`Stop ${task.title}`}
            onClick={onStop}
            className="flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:bg-accent"
          >
            <SquareIcon className="size-3" />
          </button>
        )}
      </div>
    </li>
  )
}

/** A small button that is only its icon: the bar's, and a panel's. */
function IconButton({ label, pressed, className, ...props }: React.ComponentProps<"button"> & { label: string; pressed?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={cn(
        "flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:bg-accent [&_svg]:size-4",
        pressed && "text-foreground",
        className
      )}
      {...props}
    />
  )
}

export default function AgentWorkspace() {
  const [sessions, setSessions] = React.useState(SESSIONS)
  const [current, setCurrent] = React.useState("survey")
  const [sidebar, setSidebar] = React.useState(true)
  const [finding, setFinding] = React.useState<string | null>(null)

  const [value, setValue] = React.useState("")
  const [attached, setAttached] = React.useState(["notes.md"])
  const [mode, setMode] = React.useState("ask")
  const [model, setModel] = React.useState("large")
  const [effort, setEffort] = React.useState("medium")
  // which session is being answered, and since when
  const [busy, setBusy] = React.useState<{ session: string; since: number } | null>(null)
  const answering = React.useRef(0)
  React.useEffect(() => () => window.clearTimeout(answering.current), [])

  const [panels, setPanels] = React.useState({ files: true, tasks: true })
  // On a narrow window there is room for the thread only: the sessions and the panels are drawn
  // over it instead, one at a time, and this says which is out.
  const [drawer, setDrawer] = React.useState<"sessions" | "panels" | null>(null)
  // a drawer with nothing left in it goes back in
  React.useEffect(() => {
    if (!panels.files && !panels.tasks) setDrawer((now) => (now === "panels" ? null : now))
  }, [panels])
  const [tree, setTree] = React.useState(TREE)
  const [open, setOpen] = React.useState(() => new Set(["survey", "research"]))
  const [chosen, setChosen] = React.useState("survey/notes.md")
  const [looking, setLooking] = React.useState("")
  const [turning, setTurning] = React.useState(false)
  const picker = React.useRef<HTMLInputElement>(null)

  const [tasks, setTasks] = React.useState(TASKS)
  const [ended, setEnded] = React.useState(true)

  const session = sessions.find((each) => each.id === current) ?? sessions[0]
  const groups = [...new Set(sessions.map((each) => each.group))]
  const found = finding?.trim().toLowerCase() ?? ""
  const thread = React.useRef<HTMLDivElement>(null)
  const grown = React.useRef(false)
  // A thread goes to its end as it grows, though not as it is first shown. It is the thread's own
  // window that is moved: asking the last line to come into view would move the page round the
  // block as well, where the block is shown in a frame.
  React.useEffect(() => {
    if (grown.current) thread.current?.scrollTo({ top: thread.current.scrollHeight })
    grown.current = true
  }, [session.id, session.turns.length, busy])

  const add = (to: string, ...turns: Turn[]) => setSessions((all) => all.map((each) => (each.id === to ? { ...each, turns: [...each.turns, ...turns] } : each)))

  /** What stands in for an agent: after a moment, one sentence. */
  const answer = (to: string, reply: string) => {
    window.clearTimeout(answering.current)
    setBusy({ session: to, since: Date.now() })
    answering.current = window.setTimeout(() => {
      add(to, { id: `a${Date.now()}`, reply })
      setBusy(null)
    }, REPLIES_AFTER)
  }

  const send = (text: string) => {
    if (!text.trim()) return
    // a chat begun here is named by the first thing said in it
    setSessions((all) => all.map((each) => (each.id === session.id && !each.turns.length ? { ...each, name: text.trim().slice(0, 32) } : each)))
    add(session.id, { id: `u${Date.now()}`, said: text.trim(), attached })
    setValue("")
    setAttached([])
    answer(session.id, REPLY)
  }

  const decide = (turn: Turn, option: string) => {
    // the question goes, and the choice stands in the thread as something said
    setSessions((all) =>
      all.map((each) => (each.id === session.id ? { ...each, turns: [...each.turns.map((t) => (t.id === turn.id ? { ...t, ask: undefined } : t)), { id: `u${Date.now()}`, said: option }] } : each))
    )
    setTasks((all) => [{ title: `Write the proposal: ${option.toLowerCase()}`, kind: "Subagent", state: "Running", time: "0s", activity: "Writing research/ROADMAP.md", running: true }, ...all])
    answer(session.id, `I will write the proposal for “${option}” into research/ROADMAP.md. It is running in the background; the baseline rerun carries on.`)
  }

  const begin = () => {
    const id = `new-${Date.now()}`
    setSessions((all) => [{ id, group: groups[0], name: "New chat", turns: [] }, ...all])
    setCurrent(id)
    setFinding(null)
    setDrawer(null)
  }

  /** The bar's button for a panel: beside the thread it is shown or hidden; over the thread, brought out. */
  const panel = (name: "files" | "tasks") => {
    if (wide("(min-width: 64rem)")) return setPanels((now) => ({ ...now, [name]: !now[name] }))
    const out = drawer === "panels" && panels[name]
    setPanels((now) => ({ ...now, [name]: true }))
    setDrawer(out ? null : "panels")
  }

  const file = chosen.split("/").pop() ?? ""
  const running = tasks.filter((task) => task.running)
  const over = tasks.filter((task) => !task.running)

  return (
    <div className="flex h-svh min-h-[640px] overflow-hidden bg-background text-[13px] text-foreground">
      {/* what is behind a drawer, dimmed; pressed, the drawer goes back in */}
      {drawer && (
        <button
          type="button"
          aria-label="Close"
          onClick={() => setDrawer(null)}
          className={cn("fixed inset-0 z-20 bg-black/45", drawer === "sessions" ? "md:hidden" : "lg:hidden")}
        />
      )}

      {/* sessions: beside the thread where there is room, over it where there is not */}
      {(sidebar || drawer === "sessions") && (
        <aside
          className={cn(
            "w-[216px] shrink-0 flex-col border-r bg-sidebar",
            sidebar ? "md:flex" : "md:hidden",
            drawer === "sessions" ? "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-30 max-md:flex max-md:w-[272px] max-md:max-w-[85vw] max-md:bg-(--popover)" : "max-md:hidden"
          )}
        >
          {/* The tile is wider than a row's icon, so it is centred on the icons' column and its name starts
              where the rows' words do: one line down the side for the marks, one for the words. */}
          <div className="flex h-12 items-center gap-[5px] pr-2 pl-[11px]">
            <span className="glass-chosen flex size-5 items-center justify-center rounded-[6px] text-[10px] font-semibold">R</span>
            <span className="text-sm font-medium">Research</span>
            <IconButton label="Hide sessions" className="ml-auto" onClick={() => (wide("(min-width: 48rem)") ? setSidebar(false) : setDrawer(null))}>
              <PanelLeftIcon />
            </IconButton>
          </div>
          <div className="flex flex-col gap-px px-1.5">
            {finding === null ? (
              <PanelRow onClick={() => setFinding("")}>
                <SearchIcon /> Search
                <span className="ml-auto flex gap-1">
                  <Kbd>⌘</Kbd>
                  <Kbd>K</Kbd>
                </span>
              </PanelRow>
            ) : (
              <label className="flex h-7 items-center gap-2 rounded-sm bg-accent px-2 text-[12.5px] [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-muted-foreground">
                <SearchIcon />
                <input
                  autoFocus
                  value={finding}
                  onChange={(event) => setFinding(event.target.value)}
                  onKeyDown={(event) => event.key === "Escape" && setFinding(null)}
                  placeholder="Search sessions"
                  className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                />
                <button type="button" aria-label="Close search" onClick={() => setFinding(null)} className="rounded-sm outline-none hover:text-foreground">
                  <XIcon />
                </button>
              </label>
            )}
            <PanelRow onClick={begin}>
              <PlusIcon /> New chat
            </PanelRow>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
            {groups.map((group) => {
              const rows = sessions.filter((each) => each.group === group && (!found || each.name.toLowerCase().includes(found)))
              return rows.length ? (
                <React.Fragment key={group}>
                  <p className="px-3.5 pt-5 pb-1 text-xs text-muted-foreground">{group}</p>
                  <div className="flex flex-col gap-px px-1.5">
                    {rows.map((each) => (
                      <PanelRow
                        key={each.id}
                        chosen={each.id === session.id}
                        onClick={() => {
                          setCurrent(each.id)
                          setDrawer(null)
                        }}
                      >
                        <span className="truncate">{each.name}</span>
                      </PanelRow>
                    ))}
                  </div>
                </React.Fragment>
              ) : null
            })}
          </div>
          <div className="flex items-center gap-[5px] border-t py-3 pr-3.5 pl-[11px]">
            <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium">A</span>
            <span>Alex</span>
          </div>
        </aside>
      )}

      {/* the thread */}
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 shrink-0 items-center gap-1.5 px-3">
          {/* always there on a narrow window; on a wide one, only while the sessions are hidden */}
          <IconButton label="Show sessions" className={cn(sidebar && "md:hidden")} onClick={() => (wide("(min-width: 48rem)") ? setSidebar(true) : setDrawer("sessions"))}>
            <PanelLeftIcon />
          </IconButton>
          <span className="min-w-0 truncate px-1 text-sm font-medium">{session.name}</span>
          {/* the panels at the side, each opened and shut from here */}
          <span className="ml-auto flex items-center gap-1">
            <IconButton label="Background tasks" pressed={panels.tasks} onClick={() => panel("tasks")}>
              <ListChecksIcon />
            </IconButton>
            <IconButton label="Files" pressed={panels.files} onClick={() => panel("files")}>
              <FolderIcon />
            </IconButton>
          </span>
        </div>
        <div ref={thread} className="flex min-h-0 flex-1 justify-center overflow-y-auto px-4 pt-5 pb-6 [scrollbar-width:thin] md:px-6">
          <div className="flex h-fit w-full max-w-[600px] flex-col gap-4">
            {session.turns.map((turn) => (
              <React.Fragment key={turn.id}>
                {turn.said && (
                  <div className="flex flex-col items-end gap-1.5">
                    {!!turn.attached?.length && (
                      <div className="flex flex-wrap justify-end gap-1">
                        {turn.attached.map((name) => (
                          <Tag key={name} icon={<FileTextIcon />}>
                            {name}
                          </Tag>
                        ))}
                      </div>
                    )}
                    <div className="glass-control rounded-2xl bg-secondary px-3.5 py-2 text-sm">{turn.said}</div>
                  </div>
                )}
                {turn.steps && <StepGroup steps={turn.steps} defaultOpen />}
                {turn.reply && <div className="flex flex-col gap-3 text-sm leading-relaxed">{typeof turn.reply === "string" ? <p>{turn.reply}</p> : turn.reply}</div>}
                {turn.ask && <AskCard question={turn.ask.question} options={turn.ask.options} onAnswer={(option) => decide(turn, option)} />}
              </React.Fragment>
            ))}
            {busy?.session === session.id && <TurnStatus activity="thinking" label="Working" since={busy.since} />}
            {/* a chat that has just been begun: one quiet line where the thread will be */}
            {!session.turns.length && <p className="pt-24 text-center text-sm text-muted-foreground">Ask for something to begin.</p>}
          </div>
        </div>

        <div className="flex shrink-0 justify-center px-4 pb-4 md:px-6">
          <div className="w-full max-w-[600px]">
            <Composer
              textareaProps={{ "aria-label": "Message" }}
              value={value}
              onValueChange={setValue}
              onSubmit={send}
              running={busy?.session === session.id}
              onStop={() => {
                window.clearTimeout(answering.current)
                setBusy(null)
              }}
              // back over the start of the words takes off the last thing attached
              onBackspaceAtStart={() => {
                if (!attached.length) return false
                setAttached((all) => all.slice(0, -1))
                return true
              }}
              placeholder="Keep going, or change direction…"
              leading={
                // attaches the file that is chosen in the tree
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Attach ${file}`}
                  title={`Attach ${file}`}
                  disabled={!file || attached.includes(file)}
                  onClick={() => setAttached((all) => [...all, file])}
                  className="shrink-0 text-muted-foreground"
                >
                  <PlusIcon className="size-4.5" />
                </Button>
              }
              tags={
                attached.length ? (
                  <>
                    {attached.map((name) => (
                      <Tag key={name} className="mb-0.5" icon={<FileTextIcon />} onRemove={() => setAttached((all) => all.filter((each) => each !== name))}>
                        {name}
                      </Tag>
                    ))}
                  </>
                ) : undefined
              }
            />
            <ComposerFooter>
              <ComposerPick label="Mode" align="start" value={mode} options={MODES} onValueChange={setMode} />
              <ComposerFooterEnd>
                <ComposerPick label="Model" value={model} options={MODELS} onValueChange={setModel} />
                <ComposerPick label="Effort" value={effort} options={EFFORTS} onValueChange={setEffort} shown={`Effort · ${EFFORTS.find((each) => each.value === effort)?.label}`} />
                <ContextRing used={86_300} window={200_000} />
              </ComposerFooterEnd>
            </ComposerFooter>
          </div>
        </div>
      </main>

      {/* what it has made, and what it is running */}
      {(panels.files || panels.tasks) && (
        <aside
          className={cn(
            "w-[272px] shrink-0 flex-col gap-3 py-3 pr-3 lg:flex",
            drawer === "panels" ? "max-lg:fixed max-lg:inset-y-0 max-lg:right-0 max-lg:z-30 max-lg:flex max-lg:w-[300px] max-lg:max-w-[88vw] max-lg:border-l max-lg:bg-background max-lg:pl-3" : "max-lg:hidden"
          )}
        >
          {panels.files && (
            <Panel
              title="Files"
              className={panels.tasks ? "max-h-[55%] shrink-0" : "min-h-0 flex-1"}
              onClose={() => setPanels((now) => ({ ...now, files: false }))}
              actions={
                <span className="flex items-center">
                  <IconButton
                    label="New folder"
                    className="size-6 [&_svg]:size-3.5"
                    onClick={() => {
                      const taken = new Set(tree.map((node) => node.name))
                      let name = "untitled"
                      for (let n = 2; taken.has(name); n++) name = `untitled ${n}`
                      setTree((all) => [...all, { name, children: [] }])
                    }}
                  >
                    <FolderPlusIcon />
                  </IconButton>
                  {/* the file is named in the tree and goes nowhere */}
                  <IconButton label="Upload" className="size-6 [&_svg]:size-3.5" onClick={() => picker.current?.click()}>
                    <UploadIcon />
                  </IconButton>
                  <input
                    ref={picker}
                    type="file"
                    hidden
                    onChange={(event) => {
                      const picked = event.target.files?.[0]
                      if (picked) setTree((all) => [...all.filter((node) => node.name !== picked.name), { name: picked.name, size: `${Math.max(1, Math.round(picked.size / 1024))} KB` }])
                      event.target.value = ""
                    }}
                  />
                  <IconButton
                    label="Refresh"
                    className="size-6 [&_svg]:size-3.5"
                    onClick={() => {
                      setTurning(true)
                      window.setTimeout(() => setTurning(false), 700)
                    }}
                  >
                    <RefreshCwIcon className={cn(turning && "animate-spin")} />
                  </IconButton>
                </span>
              }
            >
              <label className="mx-1.5 mb-1 flex h-7 items-center gap-1.5 rounded-sm px-1.5 text-[12.5px] text-muted-foreground focus-within:bg-accent">
                <SearchIcon className="size-3.5 shrink-0" />
                <input
                  value={looking}
                  onChange={(event) => setLooking(event.target.value)}
                  placeholder="Search files and folders"
                  className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
                />
              </label>
              <div className="min-h-0 overflow-y-auto px-1.5 pb-2 [scrollbar-width:thin]">
                <Tree
                  nodes={tree}
                  open={open}
                  chosen={chosen}
                  query={looking.trim().toLowerCase()}
                  onChoose={setChosen}
                  onToggle={(path) =>
                    setOpen((now) => {
                      const next = new Set(now)
                      if (!next.delete(path)) next.add(path)
                      return next
                    })
                  }
                />
              </div>
            </Panel>
          )}
          {panels.tasks && (
            <Panel title="Background tasks" className="min-h-0 flex-1" onClose={() => setPanels((now) => ({ ...now, tasks: false }))}>
              <div className="min-h-0 overflow-y-auto [scrollbar-width:thin]">
                <p className="px-3 pb-1 text-[11.5px] text-muted-foreground/80">Running{running.length ? "" : " · none"}</p>
                <ul className="flex flex-col gap-1.5 px-1.5">
                  {running.map((task) => (
                    <TaskBoard
                      key={task.title}
                      task={task}
                      onStop={() => setTasks((all) => all.map((each) => (each.title === task.title ? { ...each, running: false, state: "Stopped" } : each)))}
                    />
                  ))}
                </ul>
                <button
                  type="button"
                  aria-expanded={ended}
                  onClick={() => setEnded((now) => !now)}
                  className="mt-2 ml-1.5 flex items-center gap-1 rounded-sm px-1.5 py-1 text-[11.5px] text-muted-foreground/80 transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:bg-accent"
                >
                  Ended {over.length} <ChevronRightIcon className={cn("size-3 transition-transform", ended && "rotate-90")} />
                </button>
                {ended && (
                  <ul className="flex flex-col gap-1.5 px-1.5 pt-1 pb-2">
                    {over.map((task) => (
                      <TaskBoard key={task.title} task={task} onStop={() => {}} />
                    ))}
                  </ul>
                )}
              </div>
            </Panel>
          )}
        </aside>
      )}
    </div>
  )
}
