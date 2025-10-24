import { cn } from "./utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse bg-gray-800 rounded-lg", className)}
      {...props}
    />
  )
}

export { Skeleton }
