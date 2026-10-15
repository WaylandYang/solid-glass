/**
 * A headless Chromium driven over the DevTools protocol, shared by the scripts that look at pages:
 * shot.mjs (one picture) and record.mjs (a film, frame by frame).
 */
import { spawn } from "node:child_process"
import { existsSync, readdirSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

/** The browser to run: $CHROME, Playwright's headless shell, or an installed Chrome. */
export function findBrowser() {
  if (process.env.CHROME) return process.env.CHROME
  for (const dir of [join(homedir(), "Library/Caches/ms-playwright"), join(homedir(), ".cache/ms-playwright")]) {
    if (!existsSync(dir)) continue
    for (const name of readdirSync(dir).filter((entry) => entry.startsWith("chromium_headless_shell")).sort().reverse()) {
      for (const sub of readdirSync(join(dir, name))) {
        const bin = join(dir, name, sub, "chrome-headless-shell")
        if (existsSync(bin)) return bin
      }
    }
  }
  for (const bin of ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"]) {
    if (existsSync(bin)) return bin
  }
  console.error("No browser found. Set CHROME, or run: npx playwright install chromium-headless-shell")
  process.exit(2)
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** Start the browser and connect to its page. `send(method, params)` speaks the protocol; `close()` ends it. */
export async function openBrowser() {
  const port = 9300 + Math.floor(Math.random() * 500)
  const flags = ["--headless=new", "--no-sandbox", "--hide-scrollbars", `--remote-debugging-port=${port}`]
  if (process.env.PROXY) flags.push(`--proxy-server=${process.env.PROXY}`)
  const chrome = spawn(findBrowser(), [...flags, "about:blank"], { stdio: "ignore" })
  let target
  for (let i = 0; i < 80 && !target; i++) {
    await sleep(100)
    try {
      target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((entry) => entry.type === "page")
    } catch {
      // not listening yet
    }
  }
  if (!target) {
    chrome.kill()
    throw new Error("the browser did not start")
  }
  const socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve) => (socket.onopen = resolve))
  let id = 0
  const pending = new Map()
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data)
    if (message.id && pending.has(message.id)) pending.get(message.id)(message.result)
  }
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      pending.set(++id, resolve)
      socket.send(JSON.stringify({ id, method, params }))
    })
  return { send, close: () => chrome.kill() }
}
