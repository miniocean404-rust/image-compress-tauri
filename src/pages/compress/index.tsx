import { useEffect, useRef, useState } from "react"

import SimpleBar from "simplebar-react"
import "simplebar-react/dist/simplebar.min.css"

import { invoke } from "@tauri-apps/api/core"
import { UnlistenFn, Event } from "@tauri-apps/api/event"
import { getCurrentWindow, DragDropEvent } from "@tauri-apps/api/window"

import { ImageCompreessInfo, CompressState } from "@/typings/compress"
import { formartFileSize } from "@/utils/file"
import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs"

import { Button, Badge, Card, Dropzone, DropzoneIcon, Glass, Slider, Tooltip } from "@/components/ui"
import {
  ImageIcon,
  CheckIcon,
  LoadingIcon,
  DownloadIcon,
  TrashIcon,
  PackageIcon,
  CloseIcon,
  SparklesIcon,
  ArrowDownIcon,
  FileImageIcon,
  InfoIcon,
} from "@/components/icons"

// DOM 内容加载完成之后，通过 invoke 调用 在 Rust 中已经注册的命令
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(async () => await invoke("close_splashscreen"), 1000)
})

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

  const getQuality = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="w-full h-full bg-[image:var(--color-bg-gradient)] text-white flex flex-col">
      {/* 头部区域 */}
      <header className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo 和标题 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-wide">图片压缩</h1>
              <p className="text-xs text-white/50">轻松压缩，保持质量</p>
            </div>
          </div>
        </div>

        {/* 统计信息 */}
        {list.length > 0 && (
          <div className="flex items-center gap-5">
            {/* 进度指示 */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/15 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
              <span className="text-sm text-white/90">
                {stats.done}<span className="text-white/50 mx-1">/</span>{stats.total}
              </span>
            </div>

            {/* 节省空间 */}
            {stats.totalSaved > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/20">
                <ArrowDownIcon className="w-4 h-4 text-green-300" />
                <span className="text-sm font-medium text-green-300">节省 {formartFileSize(stats.totalSaved)}</span>
              </div>
            )}
          </div>
        )}
      </header>

      {/* 主内容区域 */}
      <div className="flex-1 overflow-hidden px-5 pb-4">
        {list.length === 0 ? (
          /* 空状态 - 拖放区域 */
          <Dropzone active={isHover} className="h-full">
            {/* 装饰背景 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
            </div>

            <DropzoneIcon>
              <ImageIcon />
            </DropzoneIcon>

            <h2 className="text-2xl font-medium mb-2 mt-6 text-white/90">拖放图片到这里</h2>
            <p className="text-white/50 text-sm mb-6">支持 PNG、JPEG、GIF、WebP 格式</p>

            {/* 格式标签 */}
            <div className="flex items-center gap-2">
              {["PNG", "JPEG", "GIF", "WebP"].map((format) => (
                <span key={format} className="px-2.5 py-1 text-xs font-medium bg-white/10 rounded-full text-white/60">
                  {format}
                </span>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3 text-white/40 text-xs">
              <span className="w-12 h-px bg-gradient-to-r from-transparent to-white/20" />
              <span>或点击选择文件</span>
              <span className="w-12 h-px bg-gradient-to-l from-transparent to-white/20" />
            </div>
          </Dropzone>
        ) : (
          /* 文件列表 */
          <Glass className="h-full flex flex-col overflow-hidden">
            {/* 表头 */}
            <div className="flex items-center px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider border-b border-white/10">
              <span className="flex-[2]">文件</span>
              <span className="flex-1 text-center">状态</span>
              <span className="flex-1 text-right">原始</span>
              <span className="flex-1 text-right">压缩后</span>
              <span className="flex-1 text-right">节省</span>
              <span className="w-24 text-center">操作</span>
            </div>

            {/* 列表内容 */}
            <SimpleBar className="flex-1">
              <div className="p-2 space-y-2">
                {list.map((info, index) => (
                  <Card key={info.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                    {/* 文件信息 */}
                    <div className="flex-[2] flex items-center gap-3 pr-4">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center flex-shrink-0">
                        <FileImageIcon className="w-4 h-4 text-orange-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-neutral-800 truncate text-sm" title={info.name}>
                          {info.name || "--"}
                        </div>
                        <div className="text-xs text-neutral-400">{info.type?.toUpperCase() || "IMAGE"}</div>
                      </div>
                    </div>

                    {/* 状态 */}
                    <span className="flex-1 flex justify-center">
                      {info.state === CompressState.Done ? (
                        <Badge variant="success">
                          <CheckIcon className="w-3 h-3" />
                          完成
                        </Badge>
                      ) : (
                        <Badge variant="warning">
                          <LoadingIcon className="w-3 h-3" />
                          压缩中
                        </Badge>
                      )}
                    </span>

                    {/* 原始大小 */}
                    <span className="flex-1 text-right text-neutral-400 text-sm">{formartFileSize(info.origin) || "--"}</span>

                    {/* 压缩后大小 */}
                    <span className="flex-1 text-right text-neutral-700 text-sm font-medium">{formartFileSize(info.compress) || "--"}</span>

                    {/* 压缩率 */}
                    <span className="flex-1 text-right">
                      {info.rate !== undefined && info.rate > 0 ? (
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-600">
                          <ArrowDownIcon className="w-3 h-3" />
                          {info.rate}%
                        </span>
                      ) : (
                        <span className="text-neutral-300">--</span>
                      )}
                    </span>

                    {/* 操作 */}
                    <span className="w-24 flex justify-center">
                      {info.state === CompressState.Done ? (
                        <Tooltip content="保存到桌面" position="left">
                          <Button variant="success" size="sm" onClick={() => downloadImg(info.mem, info.name, info.type)}>
                            <DownloadIcon className="w-3.5 h-3.5" />
                            保存
                          </Button>
                        </Tooltip>
                      ) : (
                        <span className="text-neutral-300 text-sm">--</span>
                      )}
                    </span>
                  </Card>
                ))}
              </div>
            </SimpleBar>
          </Glass>
        )}
      </div>

      {/* 底部工具栏 */}
      <footer className="px-5 py-4 flex items-center justify-between border-t border-white/10">
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <InfoIcon />
          <span>拖放图片文件到上方区域开始压缩</span>
        </div>

        <div className="flex items-center gap-3">
          {/* 质量滑块 */}
          <Glass rounded="btn" className="flex items-center gap-3 px-3 py-1.5">
            <span className="text-sm text-white/70">质量</span>
            <Slider className="w-24" value={quality} min={1} max={100} onChange={getQuality} />
          </Glass>

          {/* 覆盖选项 */}
          <Tooltip content={isCover ? "将覆盖原文件" : "保留原文件"} position="top">
            <Button variant={isCover ? "primary" : "ghost"} onClick={handleCover}>
              {isCover ? <CheckIcon className="w-4 h-4" /> : <CloseIcon className="w-4 h-4" />}
              {isCover ? "覆盖原文件" : "不覆盖"}
            </Button>
          </Tooltip>

          {/* 清理按钮 */}
          <Tooltip content="清空列表" position="top">
            <Button variant="ghost" onClick={handleClear}>
              <TrashIcon className="w-4 h-4" />
              清理
            </Button>
          </Tooltip>

          {/* 一键打包 */}
          <Tooltip content="打包下载所有文件" position="top">
            <Button variant="primary" onClick={handleDownload}>
              <PackageIcon className="w-4 h-4" />
              一键打包
            </Button>
          </Tooltip>
        </div>
      </footer>
    </div>
  )
}
