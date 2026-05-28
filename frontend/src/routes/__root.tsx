import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import {
  createRootRoute,
  HeadContent,
  Outlet,
  useRouterState,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import ErrorComponent from "@/components/Common/ErrorComponent"
import NotFound from "@/components/Common/NotFound"

export const Route = createRootRoute({
  component: () => (
    <>
      <HeadContent />
      <Outlet />
      <Devtools />
    </>
  ),
  notFoundComponent: () => <NotFound />,
  errorComponent: () => <ErrorComponent />,
})

function Devtools() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isPublicTryWorkspace = pathname.startsWith("/try/")

  if (!import.meta.env.DEV || isPublicTryWorkspace) {
    return null
  }

  return (
    <>
      <TanStackRouterDevtools position="bottom-right" />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  )
}
