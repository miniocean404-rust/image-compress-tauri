import { PropsWithChildren, ReactNode, useEffect, useState } from "react"
import { Outlet, ScrollRestoration } from "react-router-dom"
import { type as osType } from "@tauri-apps/plugin-os"

function DefaultLayout({ children }: PropsWithChildren<any>): ReactNode {
  const [isMac, setIsMac] = useState(false)
  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    const isMac = osType() === "macos"
    setIsMac(isMac)
  }

  return (
    <div className="h-inherit">
      {/* 需要开启 allowlist.windows.startDragging = true */}
      {/* {isMac && (
        <div className='clearfix'>
          <div data-tauri-drag-region className="float-left select-none h-[var(--height-titlebar)] w-full bg-[var(--color-bg-header)]"></div>
        </div>
      )} */}

      <div className="h-full overflow-y-scroll scrollbar-hide">
        <ScrollRestoration getKey={(location, matches) => location.pathname} />
        <Outlet />
      </div>
    </div>
  )
}

export default DefaultLayout
