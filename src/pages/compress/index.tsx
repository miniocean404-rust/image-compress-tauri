import { useEffect, useRef, useState } from "react"

import SimpleBar from "simplebar-react"
import "simplebar-react/dist/simplebar.min.css"

import { invoke } from "@tauri-apps/api/core"
import { UnlistenFn, Event } from "@tauri-apps/api/event"
import { getCurrentWindow, DragDropEvent } from "@tauri-apps/api/window"

import { ImageCompreessInfo, CompressState } from "@/typings/compress"
import { formartFileSize } from "@/utils/file"
import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs"

import { Button, Badge, Card, Dropzone, DropzoneIcon, Glass, Input } from "@/components/ui"
import { ImageIcon, CheckIcon, LoadingIcon, DownloadIcon, TrashIcon, PackageIcon, InfoIcon, CloseIcon } from "@/components/icons"

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
    <div className="w-full h-full bg-theme-gradient text-white flex flex-col">
      {/* 头部统计区域 */}
      <header className="px-5 py-4 flex items-center justify-between">
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
      <div className="flex-1 overflow-hidden px-5 pb-4">
        {list.length === 0 ? (
          /* 空状态 - 拖放区域 */
          <Dropzone active={isHover} className="h-full">
            <DropzoneIcon>
              <ImageIcon />
            </DropzoneIcon>
            <h2 className="text-2xl font-medium mb-2 mt-6 text-white/90">拖放图片到这里</h2>
            <p className="text-white/50 text-sm">支持 PNG、JPEG、GIF、WebP 格式</p>
            <div className="mt-8 flex items-center gap-2 text-white/40 text-xs">
              <span className="w-8 h-px bg-white/20" />
              <span>或点击选择文件</span>
              <span className="w-8 h-px bg-white/20" />
            </div>
          </Dropzone>
        ) : (
          /* 文件列表 */
          <Glass className="h-full flex flex-col overflow-hidden">
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
                  <Card key={info.id}>
                    {/* 文件名 */}
                    <span className="flex-[2] font-medium text-neutral-800 truncate pr-4" title={info.name}>
                      {info.name || "--"}
                    </span>

                    {/* 状态 */}
                    <span className="flex-1 flex justify-center">
                      {info.state === CompressState.Done ? (
                        <Badge variant="success">
                          <CheckIcon />
                          完成
                        </Badge>
                      ) : (
                        <Badge variant="warning">
                          <LoadingIcon />
                          压缩中
                        </Badge>
                      )}
                    </span>

                    {/* 原始大小 */}
                    <span className="flex-1 text-right text-neutral-500 text-sm">
                      {formartFileSize(info.origin) || "--"}
                    </span>

                    {/* 压缩后大小 */}
                    <span className="flex-1 text-right text-neutral-800 text-sm font-medium">
                      {formartFileSize(info.compress) || "--"}
                    </span>

                    {/* 压缩率 */}
                    <span className="flex-1 text-right">
                      {info.rate !== undefined ? (
                        <span className={`text-sm font-semibold ${info.rate > 0 ? "text-green-600" : "text-neutral-400"}`}>
                          {info.rate > 0 ? `-${info.rate}%` : `${info.rate}%`}
                        </span>
                      ) : (
                        "--"
                      )}
                    </span>

                    {/* 操作 */}
                    <span className="w-20 flex justify-center">
                      {info.state === CompressState.Done ? (
                        <Button variant="success" size="sm" onClick={() => downloadImg(info.mem, info.name, info.type)}>
                          <DownloadIcon />
                          保存
                        </Button>
                      ) : (
                        <span className="text-neutral-300">--</span>
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
          {/* 质量设置 */}
          <Glass rounded="btn" className="flex items-center gap-2 px-3 py-1.5">
            <span className="text-sm text-white/70">质量</span>
            <Input
              className="w-14 text-center py-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              inputSize="sm"
              type="number"
              min="1"
              max="100"
              required
              value={quality}
              onChange={getQuality}
            />
            <span className="text-sm text-white/70">%</span>
          </Glass>

          {/* 覆盖选项 */}
          <Button variant={isCover ? "primary" : "ghost"} onClick={handleCover}>
            {isCover ? <CheckIcon /> : <CloseIcon />}
            {isCover ? "覆盖原文件" : "不覆盖"}
          </Button>

          {/* 清理按钮 */}
          <Button variant="ghost" onClick={handleClear}>
            <TrashIcon />
            清理
          </Button>

          {/* 一键打包 */}
          <Button variant="primary" onClick={handleDownload}>
            <PackageIcon />
            一键打包
          </Button>
        </div>
      </footer>
    </div>
  )
}
