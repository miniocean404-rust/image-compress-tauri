import { PropsWithChildren, ReactNode } from "react"
import { Outlet, ScrollRestoration } from "react-router-dom"

function Default({ children }: PropsWithChildren<any>): ReactNode {
  return (
    <>
      <ScrollRestoration getKey={(location, matches) => location.pathname} />
      <Outlet />
    </>
  )
}

export default Default
