import { tv, type VariantProps } from "tailwind-variants"

export const progress = tv({
  slots: {
    root: "relative",
    circle: "transform -rotate-90",
    bgCircle: "text-white/20",
    fillCircle: "text-white transition-all duration-300 ease-out",
    text: "absolute inset-0 flex items-center justify-center text-xs font-semibold text-white",
  },
  variants: {
    size: {
      sm: { root: "w-8 h-8" },
      md: { root: "w-12 h-12" },
      lg: { root: "w-16 h-16" },
    },
  },
  defaultVariants: {
    size: "md",
  },
})

export type ProgressVariants = VariantProps<typeof progress>

interface CircleProgressProps extends ProgressVariants {
  value: number
  max?: number
  showValue?: boolean
  strokeWidth?: number
  className?: string
}

export function CircleProgress({
  value,
  max = 100,
  showValue = true,
  strokeWidth = 3,
  size,
  className,
}: CircleProgressProps) {
  const styles = progress({ size })
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizeMap = { sm: 32, md: 48, lg: 64 }
  const svgSize = sizeMap[size || "md"]
  const radius = (svgSize - strokeWidth * 2) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className={styles.root({ className })}>
      <svg className={styles.circle()} width={svgSize} height={svgSize}>
        <circle
          className={styles.bgCircle()}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          r={radius}
          cx={svgSize / 2}
          cy={svgSize / 2}
        />
        <circle
          className={styles.fillCircle()}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          r={radius}
          cx={svgSize / 2}
          cy={svgSize / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {showValue && <span className={styles.text()}>{Math.round(percentage)}%</span>}
    </div>
  )
}
