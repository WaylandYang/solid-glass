/**
 * Photograph a page as it really is, for checking by eye and for the README's pictures.
 *
 *   node scripts/shot.mjs <out.png|out.webp> <url> <width> <height> [scale] [waitMs]
 *
 * It drives a headless Chromium over the DevTools protocol in real time, so animations, charts and
 * lazily loaded parts get to run (a browser's own --screenshot under virtual time never draws a
 * chart's bars). The picture is saved in the format its name ends with.
 *
 * Environment:
 *   CHROME       the browser to run; otherwise Playwright's headless shell or an installed Chrome
 *   EVAL         JavaScript to run in the page before the picture; its value is printed (a promise is awaited)
 *   EVAL_WAIT    how long to wait after EVAL, in ms (default 500)
 *   EVAL2        JavaScript to run after that wait; its value is printed
 *   CLEAR=1      no page colour behind the picture: what the page leaves clear stays clear
 *   QUALITY      for .webp, 0–100 (default 86)
 *   PROXY        a proxy for the browser, e.g. http://127.0.0.1:7897
 *
 * There are no unit tests here: what this repository makes is how things look. This is the tool
 * for looking, and for saying in a pull request what was looked at.
 */
import { spawn } from "node:child_process"
import { existsSync, readdirSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

const [out, url, width, height, scale = "2", wait = "2500"] = process.argv.slice(2)
if (!out || !url || !width || !height) {
  console.error("usage: node scripts/shot.mjs <out.png|out.webp> <url> <width> <height> [scale] [waitMs]")
  process.exit(2)
}

function browser() {
  if (process.env.CHROME) return process.env.CHROME
  const cache = join(homedir(), "Library/Caches/ms-playwright")
  const linux = join(homedir(), ".cache/ms-playwright")
  for (const dir of [cache, linux]) {
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

const port = 9300 + Math.floor(Math.random() * 500)
const flags = ["--headless=new", "--no-sandbox", "--hide-scrollbars", `--remote-debugging-port=${port}`]
if (process.env.PROXY) flags.push(`--proxy-server=${process.env.PROXY}`)
const chrome = spawn(browser(), [...flags, "about:blank"], { stdio: "ignore" })
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

try {
  let target
  for (let i = 0; i < 80 && !target; i++) {
    await sleep(100)
    try {
      target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((entry) => entry.type === "page")
    } catch {
      // not listening yet
    }
  }
  if (!target) throw new Error("the browser did not start")
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
  const run = async (expression) => {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })
    console.log(JSON.stringify(result?.result?.value ?? result?.exceptionDetails?.exception?.description ?? null, null, 1))
  }

  await send("Emulation.setDeviceMetricsOverride", { width: +width, height: +height, deviceScaleFactor: +scale, mobile: false })
  if (process.env.CLEAR) await send("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } })
  await send("Page.enable")
  await send("Page.navigate", { url })
  await sleep(+wait)
  if (process.env.EVAL) {
    await run(process.env.EVAL)
    await sleep(+(process.env.EVAL_WAIT ?? 500))
  }
  if (process.env.EVAL2) await run(process.env.EVAL2)
  const webp = out.endsWith(".webp")
  const shot = await send("Page.captureScreenshot", webp ? { format: "webp", quality: +(process.env.QUALITY ?? 86) } : { format: "png" })
  writeFileSync(out, Buffer.from(shot.data, "base64"))
} finally {
  chrome.kill()
}
