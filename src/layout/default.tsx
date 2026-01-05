import { PropsWithChildren, ReactNode } from "react"
import { Outlet, ScrollRestoration } from "react-router"
import { TitleBar } from "../components/ui/titlebar"

function DefaultLayout({ children }: PropsWithChildren<any>): ReactNode {
  return (
    <div className="flex h-[inherit] flex-col overflow-hidden rounded-xl bg-bg-gradient">
      {/* Mac 风格标题栏 */}
      <TitleBar />

      {/* 主内容区域 */}
      <div className="flex-1 overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:w-0">
        <ScrollRestoration getKey={(location, matches) => location.pathname} />
        <Outlet />
      </div>
    </div>
  )
}

export default DefaultLayout
