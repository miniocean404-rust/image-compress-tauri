import { tv, type VariantProps } from "tailwind-variants"

export const dropzone = tv({
  base: [
    "relative",
    "flex flex-col items-center justify-center",
    "min-h-[200px]",
    "border-2 border-dashed border-white/30",
    "rounded-[var(--radius-box)]",
    "bg-white/10",
    "transition-all duration-250 ease-out",
  ],
  variants: {
    active: {
      true: [
        "border-solid border-white/60",
        "bg-white/20",
        "scale-[1.01]",
      ],
      false: [
        "hover:border-white/60",
        "hover:bg-white/20",
      ],
    },
  },
  defaultVariants: {
    active: false,
  },
})

export type DropzoneVariants = VariantProps<typeof dropzone>

interface DropzoneProps extends DropzoneVariants {
  children: React.ReactNode
  className?: string
}

export function Dropzone({ className, active, children }: DropzoneProps) {
  return <div className={dropzone({ active, className })}>{children}</div>
}

// 浮动动画图标容器
export function DropzoneIcon({ children }: { children: React.ReactNode }) {
  return <div className="animate-[float_3s_ease-in-out_infinite]">{children}</div>
}
