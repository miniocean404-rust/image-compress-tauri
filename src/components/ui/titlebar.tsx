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
            <svg className='h-1.5 w-1.5' viewBox='0 0 6 6' fill='none' stroke='#4d0000' strokeWidth='1.2' strokeLinecap='round'>
              <path d='M1 1L5 5M5 1L1 5' />
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
            <svg className='h-1.5 w-1.5' viewBox='0 0 6 6' fill='none' stroke='#995700' strokeWidth='1.2' strokeLinecap='round'>
              <path d='M1 3H5' />
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
