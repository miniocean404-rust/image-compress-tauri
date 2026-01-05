import { tv, type VariantProps } from "tailwind-variants"
import { ButtonHTMLAttributes, forwardRef } from "react"

export const button = tv({
  base: [
    "inline-flex items-center justify-center gap-1.5",
    "text-sm font-medium",
    "rounded-[var(--radius-btn)]",
    "cursor-pointer",
    "transition-all duration-150 ease-out",
    "border-none outline-none",
    "active:scale-[0.97]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ],
  variants: {
    variant: {
      primary: [
        "bg-white/20 text-white",
        "border border-white/30",
        "backdrop-blur-sm",
        "hover:bg-white/30 hover:shadow-sm",
      ],
      ghost: [
        "bg-transparent text-white",
        "border border-white/30",
        "hover:bg-white/10",
      ],
      success: [
        "bg-green-600 text-white",
        "hover:bg-green-700",
      ],
      danger: [
        "bg-red-600 text-white",
        "hover:bg-red-700",
      ],
    },
    size: {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-5 py-2.5 text-base",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
})

export type ButtonVariants = VariantProps<typeof button>

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariants {
  children: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button ref={ref} className={button({ variant, size, className })} {...props}>
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
