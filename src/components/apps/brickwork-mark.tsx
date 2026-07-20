/** Databricks brickwork logomark (brand red) — used in the apps top bars. */
export function BrickworkMark({ height = 18 }: { height?: number }) {
  const width = Math.round((105 / 113) * height)
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 105 113"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M98.9 46.6L52.3 72.9L2.4 44.8L0 46.1V66.5L52.3 95.9L98.9 69.7V80.5L52.3 106.8L2.4 78.7L0 80V83.5L52.3 112.9L104.5 83.5V63.1L102.1 61.8L52.3 89.8L5.6 63.6V52.8L52.3 79L104.5 49.6V29.5L101.9 28L52.3 55.9L8 31.1L52.3 6.2L88.7 26.7L91.9 24.9V22.4L52.3 0.1L0 29.5V32.7L52.3 62.1L98.9 35.8V46.6Z"
        fill="#FF3621"
      />
    </svg>
  )
}
