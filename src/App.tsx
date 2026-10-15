import * as React from "react"
import { Navigate, Route, Routes, useLocation } from "react-router-dom"

import { Toaster } from "@/components/ui/sonner"
import { Toaster as ToastToaster } from "@/components/ui/toast"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Home } from "@/pages/home"
import { DevBanner } from "@/pages/dev-banner"
import { DevPromo } from "@/pages/dev-promo"
import { DevExamples } from "@/pages/dev-examples"
import { ComponentsIndex, DocPage, DocsLayout } from "@/site/docs"
import { SiteFooter } from "@/site/site-footer"
import { SiteHeader } from "@/site/site-header"

// The preview on the Create page is a few dozen cards and every icon by name: fetched when the page is.
const Create = React.lazy(() => import("@/pages/create"))
// The blocks carry their own source to show it: fetched with the Blocks page, not with every page.
const Blocks = React.lazy(() => import("@/pages/blocks").then((page) => ({ default: page.Blocks })))
const BlockView = React.lazy(() => import("@/pages/blocks").then((page) => ({ default: page.BlockView })))

/** A new page starts at its top, unless the link was to a place on it. */
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  React.useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export function App() {
  const { pathname } = useLocation()
  // The README's banner is a picture of the material and nothing else: no header, no footer behind it.
  if (import.meta.env.DEV && pathname === "/dev/banner") return <DevBanner />
  // The promotional film, played by the material itself (and recorded by scripts/record.mjs).
  if (import.meta.env.DEV && pathname === "/dev/promo") return <DevPromo />
  // A block by itself, in a window of its own: no header, no footer round it.
  if (pathname.startsWith("/view/")) {
    return (
      <TooltipProvider>
        <Routes>
          <Route
            path="view/:name"
            element={
              <React.Suspense fallback={null}>
                <BlockView />
              </React.Suspense>
            }
          />
        </Routes>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <ScrollToTop />
      <div data-slot="layout" className="group/layout relative z-10 flex min-h-svh flex-col">
        <SiteHeader />
        <main className="flex min-h-0 flex-1 flex-col">
          <Routes>
            <Route index element={<Home />} />
            <Route
              path="create"
              element={
                <React.Suspense fallback={null}>
                  <Create />
                </React.Suspense>
              }
            />
            <Route
              path="blocks"
              element={
                <React.Suspense fallback={null}>
                  <Blocks />
                </React.Suspense>
              }
            />
            <Route path="docs" element={<DocsLayout />}>
              <Route index element={<DocPage section="docs" />} />
              <Route path="components" element={<ComponentsIndex />} />
              <Route path="components/:slug" element={<DocPage section="components" />} />
              <Route path=":slug" element={<DocPage section="docs" />} />
            </Route>
            {import.meta.env.DEV && <Route path="dev/examples" element={<DevExamples />} />}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {pathname !== "/create" && <SiteFooter />}
      </div>
      <Toaster />
      <ToastToaster />
    </TooltipProvider>
  )
}
