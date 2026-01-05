import { useEffect, useRef, useState } from "react"

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

// 图标组件
const ImageIcon = () => (
  <svg className="w-16 h-16 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)

const LoadingIcon = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
)

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const PackageIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
)

export default function Home() {
  let unlistenRef = useRef<Promise<UnlistenFn>>(null)
  const [isHover, setIsHover] = useState<boolean>(false)
  const [list, setList] = useState<ImageCompreessInfo[]>([])
  const [quality, setQuality] = useState<number>(80)
  const [isCover, setIsCover] = useState<boolean>(false)

  useEffect(() => {
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
    await writeFile(name, new Uint8Array(mem), { baseDir: BaseDirectory.Desktop })
  }

  // 计算统计数据
  const stats = {
    total: list.length,
    done: list.filter((i) => i.state === CompressState.Done).length,
    totalSaved: list.reduce((acc, i) => acc + (i.origin - i.compress), 0),
  }

  return (
    <div className="w-full h-full bg-theme-gradient text-[var(--color-text-primary)] flex flex-col">
      {/* 头部统计区域 */}
      <header className="px-[var(--spacing-page)] py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold tracking-wide">图片压缩</h1>
          {list.length > 0 && (
            <div className="flex items-center gap-4 text-sm text-white/70">
              <span>共 {stats.total} 个文件</span>
              <span className="w-px h-4 bg-white/20" />
              <span>已完成 {stats.done} 个</span>
              {stats.totalSaved > 0 && (
                <>
                  <span className="w-px h-4 bg-white/20" />
                  <span className="text-green-300">节省 {formartFileSize(stats.totalSaved)}</span>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* 主内容区域 */}
      <div className="flex-1 overflow-hidden px-[var(--spacing-page)] pb-4">
        {list.length === 0 ? (
          /* 空状态 - 拖放区域 */
          <div
            className={`dropzone h-full ${isHover ? "dropzone--active" : ""}`}
          >
            <div className="dropzone__icon mb-6">
              <ImageIcon />
            </div>
            <h2 className="text-2xl font-medium mb-2 text-white/90">拖放图片到这里</h2>
            <p className="text-white/50 text-sm">支持 PNG、JPEG、GIF、WebP 格式</p>
            <div className="mt-8 flex items-center gap-2 text-white/40 text-xs">
              <span className="w-8 h-px bg-white/20" />
              <span>或点击选择文件</span>
              <span className="w-8 h-px bg-white/20" />
            </div>
          </div>
        ) : (
          /* 文件列表 */
          <div className="h-full flex flex-col glass rounded-[var(--radius-box)] overflow-hidden">
            {/* 表头 */}
            <div className="flex items-center px-4 py-3 text-sm font-medium text-white/70 border-b border-white/10">
              <span className="flex-[2]">文件名</span>
              <span className="flex-1 text-center">状态</span>
              <span className="flex-1 text-right">原始大小</span>
              <span className="flex-1 text-right">压缩后</span>
              <span className="flex-1 text-right">压缩率</span>
              <span className="w-20 text-center">操作</span>
            </div>

            {/* 列表内容 */}
            <SimpleBar className="flex-1">
              <div className="p-2 space-y-2">
                {list.map((info) => (
                  <div className="card-row" key={info.id}>
                    {/* 文件名 */}
                    <span className="flex-[2] font-medium text-[var(--color-text-dark)] truncate pr-4" title={info.name}>
                      {info.name || "--"}
                    </span>

                    {/* 状态 */}
                    <span className="flex-1 flex justify-center">
                      {info.state === CompressState.Done ? (
                        <span className="status-badge status-badge--done">
                          <CheckIcon />
                          完成
                        </span>
                      ) : (
                        <span className="status-badge status-badge--compressing">
                          <LoadingIcon />
                          压缩中
                        </span>
                      )}
                    </span>

                    {/* 原始大小 */}
                    <span className="flex-1 text-right text-[var(--color-text-dark)]/70 text-sm">
                      {formartFileSize(info.origin) || "--"}
                    </span>

                    {/* 压缩后大小 */}
                    <span className="flex-1 text-right text-[var(--color-text-dark)] text-sm font-medium">
                      {formartFileSize(info.compress) || "--"}
                    </span>

                    {/* 压缩率 */}
                    <span className="flex-1 text-right">
                      {info.rate !== undefined ? (
                        <span className={`text-sm font-semibold ${info.rate > 0 ? "text-green-600" : "text-[var(--color-text-dark)]/50"}`}>
                          {info.rate > 0 ? `-${info.rate}%` : `${info.rate}%`}
                        </span>
                      ) : (
                        "--"
                      )}
                    </span>

                    {/* 操作 */}
                    <span className="w-20 flex justify-center">
                      {info.state === CompressState.Done ? (
                        <button
                          className="btn btn--success text-xs py-1.5 px-3"
                          onClick={() => downloadImg(info.mem, info.name, info.type)}
                        >
                          <DownloadIcon />
                          保存
                        </button>
                      ) : (
                        <span className="text-[var(--color-text-dark)]/30">--</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </SimpleBar>
          </div>
        )}
      </div>

      {/* 底部工具栏 */}
      <footer className="px-[var(--spacing-page)] py-4 flex items-center justify-between border-t border-white/10">
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>拖放图片文件到上方区域开始压缩</span>
        </div>

        <div className="flex items-center gap-3">
          {/* 质量设置 */}
          <div className="flex items-center gap-2 glass rounded-[var(--radius-btn)] px-3 py-1.5">
            <span className="text-sm text-white/70">质量</span>
            <input
              className="input w-14 text-center text-sm py-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              type="number"
              min="1"
              max="100"
              required
              value={quality}
              onChange={getQuality}
            />
            <span className="text-sm text-white/70">%</span>
          </div>

          {/* 覆盖选项 */}
          <button
            className={`btn ${isCover ? "btn--primary" : "btn--ghost"}`}
            onClick={handleCover}
          >
            {isCover ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {isCover ? "覆盖原文件" : "不覆盖"}
          </button>

          {/* 清理按钮 */}
          <button className="btn btn--ghost" onClick={handleClear}>
            <TrashIcon />
            清理
          </button>

          {/* 一键打包 */}
          <button className="btn btn--primary" onClick={handleDownload}>
            <PackageIcon />
            一键打包
          </button>
        </div>
      </footer>
    </div>
  )
}
