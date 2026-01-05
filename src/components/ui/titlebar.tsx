import { getCurrentWindow } from "@tauri-apps/api/window"
import { useState } from "react"

interface TitleBarProps {
  title?: string
  showTitle?: boolean
}

export function TitleBar({ title = "图片压缩", showTitle = false }: TitleBarProps) {
  const [isHovered, setIsHovered] = useState(false)
  const appWindow = getCurrentWindow()

  const handleMinimize = () => appWindow.minimize()
  const handleMaximize = () => appWindow.toggleMaximize()
  const handleClose = () => appWindow.close()

  return (
    <div
      data-tauri-drag-region
      className='drag-region flex h-[var(--height-titlebar)] w-full items-center justify-between bg-black/10 backdrop-blur-sm bg-white'
    >
      {/* Mac 风格控制按钮 - 左侧 */}
      <div className='no-drag-region flex items-center gap-2 pl-3' onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        {/* 关闭按钮 - 红色 */}
        <button
          onClick={handleClose}
          className='group flex h-3 w-3 items-center justify-center rounded-full bg-[#ff5f57] transition-all hover:bg-[#ff5f57]/80'
          title='关闭'
        >
          {isHovered && (
            <svg className='h-2 w-2 text-[#4d0000]' viewBox='0 0 12 12' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M3 3l6 6M9 3l-6 6' />
            </svg>
          )}
        </button>

        {/* 最小化按钮 - 黄色 */}
        <button
          onClick={handleMinimize}
          className='group flex h-3 w-3 items-center justify-center rounded-full bg-[#febc2e] transition-all hover:bg-[#febc2e]/80'
          title='最小化'
        >
          {isHovered && (
            <svg className='h-2 w-2 text-[#995700]' viewBox='0 0 12 12' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M2 6h8' />
            </svg>
          )}
        </button>

        {/* 最大化按钮 - 绿色 */}
        <button
          onClick={handleMaximize}
          className='group flex h-3 w-3 items-center justify-center rounded-full bg-[#28c840] transition-all hover:bg-[#28c840]/80'
          title='最大化'
        >
          {isHovered && (
            <svg className='h-2 w-2 text-[#006500]' viewBox='0 0 12 12' fill='none' stroke='currentColor' strokeWidth='1.5'>
              <path d='M2 4l4-2 4 2M2 8l4 2 4-2M2 4v4M10 4v4' />
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
