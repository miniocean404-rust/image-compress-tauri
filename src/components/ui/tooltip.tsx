import { tv, type VariantProps } from "tailwind-variants"
import { useState, useRef, ReactNode } from "react"

export const tooltip = tv({
  slots: {
    trigger: "relative inline-flex",
    content: [
      "absolute z-50",
      "px-2.5 py-1.5",
      "text-xs font-medium",
      "bg-neutral-900 text-white",
      "rounded-md shadow-lg",
      "whitespace-nowrap",
      "opacity-0 invisible",
      "transition-all duration-150",
      "group-hover:opacity-100 group-hover:visible",
    ],
    arrow: [
      "absolute w-2 h-2",
      "bg-neutral-900",
      "rotate-45",
    ],
  },
  variants: {
    position: {
      top: {
        content: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        arrow: "top-full left-1/2 -translate-x-1/2 -mt-1",
      },
      bottom: {
        content: "top-full left-1/2 -translate-x-1/2 mt-2",
        arrow: "bottom-full left-1/2 -translate-x-1/2 -mb-1",
      },
      left: {
        content: "right-full top-1/2 -translate-y-1/2 mr-2",
        arrow: "left-full top-1/2 -translate-y-1/2 -ml-1",
      },
      right: {
        content: "left-full top-1/2 -translate-y-1/2 ml-2",
        arrow: "right-full top-1/2 -translate-y-1/2 -mr-1",
      },
    },
  },
  defaultVariants: {
    position: "top",
  },
})

export type TooltipVariants = VariantProps<typeof tooltip>

interface TooltipProps extends TooltipVariants {
  content: ReactNode
  children: ReactNode
  className?: string
}

export function Tooltip({ content, children, position, className }: TooltipProps) {
  const styles = tooltip({ position })

  return (
    <div className={`group ${styles.trigger({ className })}`}>
      {children}
      <div className={styles.content()}>
        {content}
        <div className={styles.arrow()} />
      </div>
    </div>
  )
}
