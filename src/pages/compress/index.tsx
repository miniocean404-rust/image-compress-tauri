import styles from "./index.module.scss"
import { useEffect, useRef, useState } from "react"
import { useUnmount, useMount } from "ahooks"

import SimpleBar from "simplebar-react"
import "simplebar-react/dist/simplebar.min.css"
import "./scrollbar.scss"

import { invoke } from "@tauri-apps/api/core"
import { UnlistenFn, Event } from "@tauri-apps/api/event"
import { getCurrentWindow, DragDropEvent } from "@tauri-apps/api/window"

import { ImageCompreessInfo, CompressState } from "@/typings/compress"
import { formartFileSize } from "@/utils/file"
import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs"

// DOM 内容加载完成之后，通过 invoke 调用 在 Rust 中已经注册的命令
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(async () => await invoke("close_splashscreen"), 1000)
})

const CompressStateChinese = {
  compressing: "压缩中",
  done: "完成",
}

export default function Home() {
  let unlistenRef = useRef<Promise<UnlistenFn>>(null)
  const [isHover, setIsHover] = useState<boolean>(false)
  const [list, setList] = useState<ImageCompreessInfo[]>([])
  const [quality, setQuality] = useState<number>(80)
  const [isCover, setIsCover] = useState<boolean>(false)

  useEffect(() => {
    // 监听拖拽事件
    // 旧: 或者监听拖拽结束事件  listen("tauri://file-drop", () => {});
    const appWindow = getCurrentWindow()
    unlistenRef.current = appWindow.onDragDropEvent(onFileDrop)

    return () => {
      unlistenRef.current && unlistenRef.current.then((un) => un())
    }
  }, [isCover, quality, list])

  const onFileDrop = async (event: Event<DragDropEvent>) => {
    const payload = event.payload
    switch (payload.type) {
      case "enter":
        setIsHover(true)
        break
      case "leave":
        setIsHover(false)
        break
      case "drop":
        setIsHover(false)
        const infos = await invoke<ImageCompreessInfo[]>("get_drag_files", { files: payload.paths, quality })

        let total = [...list, ...infos]
        setList(total)

        infos.forEach((info) => {
          invoke<ImageCompreessInfo>("start_compress", { info, is_cover: isCover }).then((done) => {
            const index = total.findIndex((find) => find.id === done.id)
            if (index) {
              total.splice(index, 1, done)
              setList([...total])
            }
          })
        })

        break
    }
  }

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

    await writeFile(name, new Uint8Array(mem), { baseDir: BaseDirectory.Desktop })
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
              <div className={styles.image_info} key={info.id}>
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
