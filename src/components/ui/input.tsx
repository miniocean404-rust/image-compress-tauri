import { tv, type VariantProps } from "tailwind-variants"
import { InputHTMLAttributes, forwardRef } from "react"

export const input = tv({
  base: [
    "px-3 py-2",
    "text-sm",
    "rounded-[var(--radius-input)]",
    "border border-white/30",
    "bg-white/90 text-neutral-800",
    "transition-all duration-150 ease-out",
    "outline-none",
    "focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20",
    "placeholder:text-neutral-400",
  ],
  variants: {
    variant: {
      default: "",
      ghost: "bg-transparent text-white border-white/30",
    },
    inputSize: {
      sm: "px-2 py-1 text-xs",
      md: "px-3 py-2 text-sm",
      lg: "px-4 py-2.5 text-base",
    },
  },
  defaultVariants: {
    variant: "default",
    inputSize: "md",
  },
})

export type InputVariants = VariantProps<typeof input>

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">, InputVariants {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, ...props }, ref) => {
    return <input ref={ref} className={input({ variant, inputSize, className })} {...props} />
  }
)

Input.displayName = "Input"
