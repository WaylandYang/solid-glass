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
import { writeFileSync } from "node:fs"

import { openBrowser, sleep } from "./browser.mjs"

const [out, url, width, height, scale = "2", wait = "2500"] = process.argv.slice(2)
if (!out || !url || !width || !height) {
  console.error("usage: node scripts/shot.mjs <out.png|out.webp> <url> <width> <height> [scale] [waitMs]")
  process.exit(2)
}

const { send, close } = await openBrowser()
try {
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
  close()
}
