/**
 * Record the promotional film (/dev/promo) frame by frame into a video.
 *
 *   node scripts/record.mjs <out.mp4> [url] [fps]
 *
 * The page draws every frame from one clock. This sets the clock to each frame's time, lets the
 * page draw, and photographs it, so the film comes out the same every time and as smooth as its
 * frame rate, however long a frame takes to draw. The browser's own clocks are stood in for by the
 * same time (requestAnimationFrame, performance.now, Date.now, CSS animations), so parts that animate
 * themselves, like the status glyphs, keep time with the rest.
 *
 * Needs ffmpeg: $FFMPEG, or one on the PATH. url defaults to the dev server's /dev/promo, fps to 30.
 *
 * Environment:
 *   FFMPEG       the ffmpeg to run
 *   SCALE        device pixels per CSS pixel (default 1: a 1920 by 1080 film)
 *   FROM, TO     record only part of the film, in ms
 */
import { spawn } from "node:child_process"

import { openBrowser, sleep } from "./browser.mjs"

const [out, url = "http://localhost:5191/dev/promo?capture", fps = "30"] = process.argv.slice(2)
if (!out) {
  console.error("usage: node scripts/record.mjs <out.mp4> [url] [fps]")
  process.exit(2)
}

// Stand-ins for the browser's clocks, put in place before the page's own scripts run.
const CLOCK = `(() => {
  let now = 0
  const base = Date.now()
  const queue = new Map()
  let next = 0
  window.requestAnimationFrame = (callback) => (queue.set(++next, callback), next)
  window.cancelAnimationFrame = (handle) => queue.delete(handle)
  performance.now = () => now
  Date.now = () => base + now
  window.__frame = (t) => {
    now = t
    const callbacks = [...queue.values()]
    queue.clear()
    for (const callback of callbacks) {
      try { callback(t) } catch (error) { console.error(error) }
    }
    for (const animation of document.getAnimations()) {
      try { animation.pause(); animation.currentTime = t } catch {}
    }
  }
})()`

const { send, close } = await openBrowser()
const ffmpeg = spawn(
  process.env.FFMPEG ?? "ffmpeg",
  ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", fps, "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out],
  { stdio: ["pipe", "inherit", "inherit"] }
)

try {
  await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: +(process.env.SCALE ?? 1), mobile: false })
  await send("Page.enable")
  await send("Page.addScriptToEvaluateOnNewDocument", { source: CLOCK })
  await send("Page.navigate", { url })
  await sleep(3500) // the fonts, and the first draw

  const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }))?.result?.value
  const duration = await evaluate("window.__promoDuration")
  if (!duration) throw new Error("the page has no film on it: is the dev server running, and the url /dev/promo?capture?")
  const from = +(process.env.FROM ?? 0)
  const to = Math.min(+(process.env.TO ?? duration), duration)
  const frames = Math.round(((to - from) / 1000) * +fps)

  for (let frame = 0; frame < frames; frame++) {
    const t = from + (frame * 1000) / +fps
    // twice: what the clock sets off (a glyph's next frame) is drawn on the second pass
    await evaluate(`(async () => { window.__seek(${t}); window.__frame(${t}); await new Promise((r) => setTimeout(r, 0)); window.__frame(${t}); await new Promise((r) => setTimeout(r, 16)); return 1 })()`)
    const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 95 })
    if (!ffmpeg.stdin.write(Buffer.from(shot.data, "base64"))) await new Promise((resolve) => ffmpeg.stdin.once("drain", resolve))
    if (frame % +fps === 0) process.stdout.write(`\r${Math.round(t / 1000)}s / ${Math.round(to / 1000)}s`)
  }
  process.stdout.write("\n")
} finally {
  ffmpeg.stdin.end()
  await new Promise((resolve) => ffmpeg.on("close", resolve))
  close()
}
