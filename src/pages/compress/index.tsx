import styles from "./index.module.scss"
import { useEffect, useRef, useState } from "react"
import { useUnmount, useMount } from "ahooks"

import SimpleBar from "simplebar-react"
import "simplebar-react/dist/simplebar.min.css"
import "./scrollbar.scss"

import { invoke } from "@tauri-apps/api/tauri"
import { UnlistenFn } from "@tauri-apps/api/event"
import { appWindow } from "@tauri-apps/api/window"

import { ImageCompreessInfo, CompressState } from "@/typings/compress"
import { formartFileSize } from "@/utils/file"
import { BaseDirectory, writeBinaryFile } from "@tauri-apps/api/fs"

// DOM 内容加载完成之后，通过 invoke 调用 在 Rust 中已经注册的命令
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(async () => await invoke("close_splashscreen"), 1000)
})

const CompressStateChinese = {
  compressing: "压缩中",
  done: "完成",
}

export default function Home() {
  let unlistenRef = useRef<UnlistenFn | null>()
  const [isHover, setIsHover] = useState<boolean>(false)
  const [list, setList] = useState<ImageCompreessInfo[]>([])
  const [quality, setQuality] = useState<number>(80)
  const [isCover, setIsCover] = useState<boolean>(false)

  useEffect(() => {
    ;(async function () {
      // 或者监听拖拽结束事件  listen("tauri://file-drop", () => {});
      unlistenRef.current = await appWindow.onFileDropEvent(async (event) => {
        switch (event.payload.type) {
          case "hover":
            setIsHover(true)
            break
          case "cancel":
            setIsHover(false)
            break
          case "drop":
            setIsHover(false)
            const infos = await invoke<ImageCompreessInfo[]>("get_drag_files", { files: event.payload.paths, quality })
            setList([...list, ...infos])

            for (let index = 0; index < infos.length; index++) {
              const info = infos[index]

              invoke<ImageCompreessInfo>("start_compress", { info, is_cover: isCover }).then((done) => {
                infos[index] = info.path === done.path ? done : info
                setList([...list, ...infos])
              })
            }

            break
        }
      })
    })()

    return () => {
      unlistenRef.current && unlistenRef.current()
    }
  }, [isCover, quality, list])

  const getQuality = (e) => {
    setQuality(Number(e.target.value))
  }

  const handleCover = () => {
    setIsCover(!isCover)
  }

  const handleClear = () => {
    setList([])
  }

  const handleDownload = () => {}

  const downloadImg = async (mem: number[], name: string, type: string) => {
    console.log(BaseDirectory.Desktop)

    await writeBinaryFile(name, new Uint8Array(mem), { dir: BaseDirectory.Desktop })
  }

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
        <SimpleBar className={styles.scrollbar}>
          {list.length === 0 && <div className={styles.tip}>拖 放 图 片</div>}

          {list.map((info) => {
            return (
              <div className={styles.image_info} key={info.path}>
                <span>{info.name || "--"}</span>
                <span>{CompressStateChinese[info.state] || "--"}</span>
                <span>{formartFileSize(info.origin) || "--"}</span>
                <span>{formartFileSize(info.compress) || "--"}</span>
                <span>{info.rate + "%" || "--"}</span>
                <span
                  className={`${styles.down_file} ${info.state === CompressState.Done && styles.done}`}
                  onClick={() => downloadImg(info.mem, info.name, info.type)}
                >
                  {info.state === CompressState.Done ? "保存" : "--"}
                </span>
              </div>
            )
          })}
        </SimpleBar>
      </div>

      <footer>
        <div className={styles.action_tip}>🔔 拖放图片文件到上方区域</div>

        <div className={styles.action}>
          <div className={styles.quality_box}>
            <span>质量</span>
            <input className={styles.silder} type='number' min={"1"} max={"100"} required value={quality} onChange={getQuality} />%
          </div>

          <div className={styles.btn} onClick={handleClear}>
            清理
          </div>

          <div className={styles.btn} onClick={handleCover}>
            {isCover ? "覆盖" : "不覆盖"}
          </div>

          <div className={styles.btn} onClick={handleDownload}>
            一键打包
          </div>
        </div>
      </footer>
    </div>
  )
}
