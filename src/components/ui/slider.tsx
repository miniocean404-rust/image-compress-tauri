import { tv, type VariantProps } from "tailwind-variants"
import { InputHTMLAttributes, forwardRef } from "react"

export const slider = tv({
  slots: {
    root: "flex items-center gap-3",
    track: [
      "relative flex-1 h-2",
      "bg-white/20 rounded-full",
      "overflow-hidden",
    ],
    fill: [
      "absolute inset-y-0 left-0",
      "bg-white/80 rounded-full",
      "transition-all duration-150",
    ],
    thumb: [
      "absolute top-1/2 -translate-y-1/2",
      "w-4 h-4 rounded-full",
      "bg-white shadow-md",
      "border-2 border-white/50",
      "cursor-grab active:cursor-grabbing",
      "transition-transform duration-150",
      "hover:scale-110",
    ],
    input: [
      "absolute inset-0 w-full h-full",
      "opacity-0 cursor-pointer",
    ],
    value: "text-sm font-medium text-white min-w-[3ch] text-right",
  },
})

export type SliderVariants = VariantProps<typeof slider>

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  showValue?: boolean
  suffix?: string
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, min = 0, max = 100, showValue = true, suffix = "%", onChange, ...props }, ref) => {
    const styles = slider()
    const numValue = Number(value) || 0
    const numMin = Number(min)
    const numMax = Number(max)
    const percentage = ((numValue - numMin) / (numMax - numMin)) * 100

    return (
      <div className={styles.root({ className })}>
        <div className={styles.track()}>
          <div className={styles.fill()} style={{ width: `${percentage}%` }} />
          <div className={styles.thumb()} style={{ left: `calc(${percentage}% - 8px)` }} />
          <input
            ref={ref}
            type="range"
            className={styles.input()}
            value={value}
            min={min}
            max={max}
            onChange={onChange}
            {...props}
          />
        </div>
        {showValue && (
          <span className={styles.value()}>
            {numValue}{suffix}
          </span>
        )}
      </div>
    )
  }
)

Slider.displayName = "Slider"
