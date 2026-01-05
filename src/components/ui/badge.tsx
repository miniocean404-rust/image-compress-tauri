import { tv, type VariantProps } from "tailwind-variants"

export const badge = tv({
  base: [
    "inline-flex items-center gap-1",
    "px-2.5 py-1",
    "text-xs font-medium",
    "rounded-full",
  ],
  variants: {
    variant: {
      default: "bg-neutral-100 text-neutral-700",
      success: "bg-green-500/20 text-green-600",
      warning: "bg-amber-500/20 text-amber-600",
      danger: "bg-red-500/20 text-red-600",
      info: "bg-blue-500/20 text-blue-600",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export type BadgeVariants = VariantProps<typeof badge>

interface BadgeProps extends BadgeVariants {
  children: React.ReactNode
  className?: string
}

export function Badge({ className, variant, children }: BadgeProps) {
  return <span className={badge({ variant, className })}>{children}</span>
}
