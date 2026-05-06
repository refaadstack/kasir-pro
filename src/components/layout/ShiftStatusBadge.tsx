import { Badge } from '@/components/ui/badge'

type ShiftStatusBadgeProps = {
  isActive: boolean
  startedAt?: string
}

export function ShiftStatusBadge({ isActive, startedAt }: ShiftStatusBadgeProps) {
  if (!isActive) {
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
        Shift Belum Dimulai
      </Badge>
    )
  }

  return (
    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
      <span className="inline-block w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse" />
      Shift Aktif
      {startedAt && (
        <span className="ml-2 text-xs opacity-75">
          sejak {new Date(startedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </Badge>
  )
}
