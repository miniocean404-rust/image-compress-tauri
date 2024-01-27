import styles from "./index.module.scss"
import { useRef, useState } from "react"
import { useUnmount, useMount } from "ahooks"

import SimpleBar from "simplebar-react"
import "simplebar-react/dist/simplebar.min.css"
import "./scrollbar.scss"

// import { invoke } from "@tauri-apps/api/tauri"
// import { UnlistenFn } from "@tauri-apps/api/event"
// import { appWindow } from "@tauri-apps/api/window"

// import { invoke } from "@tauri-apps/api/tauri";

// DOM 内容加载完成之后，通过 invoke 调用 在 Rust 中已经注册的命令
// window.addEventListener("DOMContentLoaded", () => {
//   setTimeout(async () => await invoke("close_splashscreen"), 1000);
// });

import { ImageCompreessInfo } from "@/typings/compress"

export default function Home() {
  // let unlistenRef = useRef<UnlistenFn | null>()
  const [isHover, setIsHover] = useState<boolean>(false)
  const [list, setList] = useState<ImageCompreessInfo[]>([])
  const [quality, setQuality] = useState<number>(80)

  useMount(async () => {
    setList(
      Array.from(
        [, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ,].fill({
          name: "1.png",
          state: "完成",
          origin: "1.2M",
          compress: "1.2M",
          rate: 0,
        }),
      ),
    )

    // 或者监听拖拽结束事件  listen("tauri://file-drop", () => {});
    // unlistenRef.current = await appWindow.onFileDropEvent(async (event) => {
    //   switch (event.payload.type) {
    //     case "hover":
    //       setIsHover(true)
    //       break
    //     case "cancel":
    //       setIsHover(false)
    //       break
    //     case "drop":
    //       setIsHover(false)
    //       // 读取目录
    //       // const entries = await readDir(event.payload[0], { dir: BaseDirectory.AppData, recursive: true });
    //       await invoke("get_drag_files", { files: event.payload.paths })
    //       break
    //   }
    // })
  })

  useUnmount(() => {
    // unlistenRef.current && unlistenRef.current()
  })

  const getQuality = (e) => {
    setQuality(e.target.value)
  }
  const handleClear = () => {}
  const handleDownload = () => {}

  return (
    <div className={styles.box} style={{ backgroundColor: isHover ? "red" : "" }}>
      <header className={styles.header}>
        <span>名称</span>
        <span>状态</span>
        <span>原始大小</span>
        <span>压缩后大小</span>
        <span>压缩率</span>
        <span>操作</span>
      </header>

      <div className={styles.list}>
        <SimpleBar style={{ height: "100%" }}>
          <div className={styles.list_box}>
            {list.length === 0 && <div className={styles["drop-tip"]}>拖 放 图 片</div>}

            {list.map((info, index) => {
              return (
                <div className={styles.image_info} key={index}>
                  <span>{info.name || "--"}</span>
                  <span>{info.state || "--"}</span>
                  <span>{info.origin || "--"}</span>
                  <span>{info.compress || "--"}</span>
                  <span>{info.rate || "--"}</span>
                  <span className={styles["cell-down"]}>
                    <p onClick={() => {}}>{info.action === "完成" ? "保存" : "--"}</p>
                  </span>
                </div>
              )
            })}
          </div>
        </SimpleBar>
      </div>

      <footer>
        <div className={styles.action_tip}>🔔 拖放图片文件到上方区域</div>

        <div className={styles.action}>
          <div className={styles.quality_box}>
            <span>质量</span>

            <input className={styles.silder} type='range' min='0' max='100' value={quality} onChange={getQuality} />

            <div className={styles.quality_num}>{quality}%</div>
          </div>

          <div className={styles.btn} onClick={handleClear}>
            清除列表
          </div>
          <div className={styles.btn} onClick={handleDownload}>
            一键打包
          </div>
        </div>
      </footer>
    </div>
  )
}
