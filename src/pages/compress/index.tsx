import { useEffect, useRef, useState } from "react"
import { useUnmount, useMount } from "ahooks"

import SimpleBar from "simplebar-react"
import "simplebar-react/dist/simplebar.min.css"

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
    <div
      className="w-full h-full bg-theme-gradient text-[var(--color-text-primary)] flex flex-col"
      style={{ backgroundColor: isHover ? "red" : "" }}
    >
      <header className="px-[var(--spacing-page)] py-2.5 text-left flex items-center justify-around">
        <span className="flex-1">名称</span>
        <span className="flex-1">状态</span>
        <span className="flex-1">原始大小</span>
        <span className="flex-1">压缩后大小</span>
        <span className="flex-1">压缩率</span>
        <span className="flex-1">操作</span>
      </header>

      <div className="overflow-y-scroll h-full">
        <SimpleBar className="h-inherit">
          {list.length === 0 && (
            <div className="h-inherit w-max text-6xl mx-auto blur-[2px]">
              拖 放 图 片
            </div>
          )}

          {list.map((info) => {
            return (
              <div
                className="flex items-center justify-around h-[50px] bg-[var(--color-bg-card)] text-[var(--color-text-dark)] mb-0.5 p-[var(--spacing-box)] last:mb-0 hover:bg-[var(--color-bg-card-hover)]"
                key={info.id}
              >
                <span className="flex-1">{info.name || "--"}</span>
                <span className="flex-1">{CompressStateChinese[info.state] || "--"}</span>
                <span className="flex-1">{formartFileSize(info.origin) || "--"}</span>
                <span className="flex-1">{formartFileSize(info.compress) || "--"}</span>
                <span className="flex-1">{info.rate + "%" || "--"}</span>
                <span
                  className={`flex-1 text-[var(--color-text-danger)] text-xs ${info.state === CompressState.Done ? "cursor-pointer" : ""}`}
                  onClick={() => downloadImg(info.mem, info.name, info.type)}
                >
                  {info.state === CompressState.Done ? "保存" : "--"}
                </span>
              </div>
            )
          })}
        </SimpleBar>
      </div>

      <footer className="w-full flex items-center justify-between px-[var(--spacing-page)] py-2.5">
        <div>🔔 拖放图片文件到上方区域</div>

        <div className="flex items-center">
          <div className="inline-block mx-1.5">
            <span>质量</span>
            <input
              className="m-1.5 rounded-[var(--radius-input)] px-3 py-1 w-[45px] text-sm leading-5 border border-[var(--color-border-input)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              type='number'
              min={"1"}
              max={"100"}
              required
              value={quality}
              onChange={getQuality}
            />%
          </div>

          <div
            className="inline-block cursor-pointer mx-1.5 rounded-[var(--radius-btn)] border border-white px-1.5 py-0.5"
            onClick={handleClear}
          >
            清理
          </div>

          <div
            className="inline-block cursor-pointer mx-1.5 rounded-[var(--radius-btn)] border border-white px-1.5 py-0.5"
            onClick={handleCover}
          >
            {isCover ? "覆盖" : "不覆盖"}
          </div>

          <div
            className="inline-block cursor-pointer mx-1.5 rounded-[var(--radius-btn)] border border-white px-1.5 py-0.5"
            onClick={handleDownload}
          >
            一键打包
          </div>
        </div>
      </footer>
    </div>
  )
}
