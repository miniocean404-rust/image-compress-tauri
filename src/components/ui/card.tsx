import { tv, type VariantProps } from "tailwind-variants"

export const card = tv({
  base: [
    "flex items-center",
    "p-4",
    "bg-white/95",
    "rounded-[var(--radius-card)]",
    "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]",
    "transition-all duration-150 ease-out",
    "animate-[fade-in-up_0.3s_ease-out]",
  ],
  variants: {
    hoverable: {
      true: [
        "hover:bg-white/85",
        "hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]",
        "hover:-translate-y-px",
      ],
    },
  },
  defaultVariants: {
    hoverable: true,
  },
})

export type CardVariants = VariantProps<typeof card>

interface CardProps extends CardVariants {
  children: React.ReactNode
  className?: string
}

export function Card({ className, hoverable, children }: CardProps) {
  return <div className={card({ hoverable, className })}>{children}</div>
}
