import { PropsWithChildren, ReactNode } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";

import styles from "./defaylt.module.scss";

function Default({ children }: PropsWithChildren<any>): ReactNode {
  return (
    <>
      {/* 需要开启 allowlist.windows.startDragging = true */}
      <div data-tauri-drag-region className={styles.header}></div>

      <ScrollRestoration getKey={(location, matches) => location.pathname} />
      <Outlet />
    </>
  );
}

export default Default;
