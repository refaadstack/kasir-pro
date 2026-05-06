import { Badge } from './badge'

type Status = 'success' | 'warning' | 'error' | 'info' | 'default'

type StatusBadgeProps = {
  status: Status
  children: React.ReactNode
}

const statusVariants: Record<Status, string> = {
  success: 'bg-green-100 text-green-800 hover:bg-green-100',
  warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  error: 'bg-red-100 text-red-800 hover:bg-red-100',
  info: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  default: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  return (
    <Badge className={statusVariants[status]} variant="secondary">
      {children}
    </Badge>
  )
}
