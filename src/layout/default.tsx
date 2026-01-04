import { PropsWithChildren, ReactNode, useEffect, useState } from "react"
import { Outlet, ScrollRestoration } from "react-router-dom"
import { type as osType } from "@tauri-apps/plugin-os"

import styles from "./defaylt.module.scss"

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
    <div className={styles.layouBox}>
      {/* 需要开启 allowlist.windows.startDragging = true */}
      {/* {isMac && (
        <div className='clearfix'>
          <div data-tauri-drag-region className={`${styles.header} `}></div>
        </div>
      )} */}

      <div className={styles.routerWindowsBox}>
        <ScrollRestoration getKey={(location, matches) => location.pathname} />
        <Outlet />
      </div>
    </div>
  )
}

export default DefaultLayout
