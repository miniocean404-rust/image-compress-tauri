import { PropsWithChildren, ReactNode } from "react"
import { Outlet, ScrollRestoration } from "react-router-dom"
import { type } from "@tauri-apps/api/os"

import styles from "./defaylt.module.scss"

async function DefaultLayout({ children }: PropsWithChildren<any>): Promise<ReactNode> {
  const typeOs = await type()
  const isMac = typeOs === "Darwin"

  return (
    <div className={styles.layouBox}>
      {/* 需要开启 allowlist.windows.startDragging = true */}
      {isMac && (
        <div className='clearfix'>
          <div data-tauri-drag-region className={`${styles.header} `}></div>
        </div>
      )}

      <div className={isMac ? styles.routerWindowsBox : styles.routerMacBox}>
        <ScrollRestoration getKey={(location, matches) => location.pathname} />
        <Outlet />
      </div>
    </div>
  )
}

export default DefaultLayout
