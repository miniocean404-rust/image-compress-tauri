import { tv } from "tailwind-variants"

export const glass = tv({
  base: [
    "bg-white/10",
    "backdrop-blur-[10px]",
    "border border-white/20",
  ],
  variants: {
    rounded: {
      none: "",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      full: "rounded-full",
      box: "rounded-[var(--radius-box)]",
      btn: "rounded-[var(--radius-btn)]",
    },
  },
  defaultVariants: {
    rounded: "box",
  },
})

interface GlassProps {
  children: React.ReactNode
  className?: string
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full" | "box" | "btn"
}

export function Glass({ className, rounded, children }: GlassProps) {
  return <div className={glass({ rounded, className })}>{children}</div>
}
