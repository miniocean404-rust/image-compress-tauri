import { getCurrentWindow } from "@tauri-apps/api/window"
import { platform } from "@tauri-apps/plugin-os"
import { useState } from "react"

interface TitleBarProps {
  title?: string
  showTitle?: boolean
}

// Mac 风格标题栏
function MacTitleBar({
  title,
  showTitle,
  onMinimize,
  onMaximize,
  onClose,
}: TitleBarProps & { onMinimize: () => void; onMaximize: () => void; onClose: () => void }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      data-tauri-drag-region
      className='drag-region flex h-[var(--height-titlebar)] w-full items-center justify-between bg-black/10 backdrop-blur-sm bg-white'
    >
      {/* Mac 风格控制按钮 - 左侧 */}
      <div className='no-drag-region flex items-center gap-2 pl-3' onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        {/* 关闭按钮 - 红色 */}
        <button
          onClick={onClose}
          className='group flex h-3 w-3 items-center justify-center rounded-full bg-[#ff5f57] transition-all hover:bg-[#ff5f57]/80'
          title='关闭'
        >
          {isHovered && (
            <svg className='h-1.5 w-1.5' viewBox='0 0 6 6' fill='none' stroke='#4d0000' strokeWidth='1.2' strokeLinecap='round'>
              <path d='M1 1L5 5M5 1L1 5' />
            </svg>
          )}
        </button>

        {/* 最小化按钮 - 黄色 */}
        <button
          onClick={onMinimize}
          className='group flex h-3 w-3 items-center justify-center rounded-full bg-[#febc2e] transition-all hover:bg-[#febc2e]/80'
          title='最小化'
        >
          {isHovered && (
            <svg className='h-1.5 w-1.5' viewBox='0 0 6 6' fill='none' stroke='#995700' strokeWidth='1.2' strokeLinecap='round'>
              <path d='M1 3H5' />
            </svg>
          )}
        </button>

        {/* 最大化按钮 - 绿色 */}
        <button
          onClick={onMaximize}
          className='group flex h-3 w-3 items-center justify-center rounded-full bg-[#28c840] transition-all hover:bg-[#28c840]/80'
          title='最大化'
        >
          {isHovered && (
            <svg className='h-1.5 w-1.5' viewBox='0 0 6 6' fill='none' stroke='#006500' strokeWidth='1.2' strokeLinecap='round'>
              <path d='M1 1.5L3 0.5L5 1.5M1 4.5L3 5.5L5 4.5M1 1.5V4.5M5 1.5V4.5' />
            </svg>
          )}
        </button>
      </div>

      {/* 标题 - 居中 */}
      {showTitle && <span className='pointer-events-none absolute left-1/2 -translate-x-1/2 text-xs font-medium text-white/70'>{title}</span>}

      {/* 右侧占位 */}
      <div className='w-[60px]' />
    </div>
  )
}

// Windows 风格标题栏
function WindowsTitleBar({
  title,
  showTitle,
  onMinimize,
  onMaximize,
  onClose,
}: TitleBarProps & { onMinimize: () => void; onMaximize: () => void; onClose: () => void }) {
  return (
    <div data-tauri-drag-region className='drag-region flex h-titlebar w-full items-center justify-between backdrop-blur-sm bg-white'>
      {/* 左侧占位 */}
      <div className='w-[12px]' />

      {/* 标题 - 居中 */}
      {showTitle && <span className='pointer-events-none absolute left-1/2 -translate-x-1/2 text-xs font-medium text-gray-600'>{title}</span>}

      {/* Windows 风格控制按钮 - 右侧 */}
      <div className='no-drag-region flex h-full items-center'>
        {/* 最小化按钮 */}
        <button onClick={onMinimize} className='flex h-full w-11.5 items-center justify-center transition-colors hover:bg-black/10' title='最小化'>
          <svg className='h-2.5 w-2.5' viewBox='0 0 10 10' fill='none'>
            <path d='M0 5H10' stroke='currentColor' strokeWidth='1' />
          </svg>
        </button>

        {/* 最大化按钮 */}
        <button onClick={onMaximize} className='flex h-full w-11.5 items-center justify-center transition-colors hover:bg-black/10' title='最大化'>
          <svg width='10' height='10' viewBox='0 0 10 10' fill='none' style={{ shapeRendering: "geometricPrecision" }}>
            <path d='M1 1h8v8H1z' stroke='currentColor' strokeWidth='1' fill='none' />
          </svg>
        </button>

        {/* 关闭按钮 */}
        <button onClick={onClose} className='flex h-full w-11.5 items-center justify-center transition-colors hover:bg-[#e81123] hover:text-white' title='关闭'>
          <svg className='h-2.5 w-2.5' viewBox='0 0 10 10' fill='none'>
            <path d='M0 0L10 10M10 0L0 10' stroke='currentColor' strokeWidth='1' />
          </svg>
        </button>
      </div>
    </div>
  )
}

export function TitleBar({ title = "图片压缩", showTitle = false }: TitleBarProps) {
  const appWindow = getCurrentWindow()
  const currentPlatform = platform()

  const handleMinimize = () => appWindow.minimize()
  const handleMaximize = () => appWindow.toggleMaximize()
  const handleClose = () => appWindow.close()

  // macOS 使用 Mac 风格，其他系统使用 Windows 风格
  if (currentPlatform === "macos") {
    return <MacTitleBar title={title} showTitle={showTitle} onMinimize={handleMinimize} onMaximize={handleMaximize} onClose={handleClose} />
  }

  return <WindowsTitleBar title={title} showTitle={showTitle} onMinimize={handleMinimize} onMaximize={handleMaximize} onClose={handleClose} />
}
