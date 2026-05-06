import { Badge } from '@/components/ui/badge'

type Role = 'KASIR' | 'SUPERVISOR' | 'MANAGER' | 'SUPERADMIN'

const roleConfig: Record<Role, { label: string; className: string }> = {
  KASIR: {
    label: 'Kasir',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  },
  SUPERVISOR: {
    label: 'Supervisor',
    className: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  },
  MANAGER: {
    label: 'Manager',
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
  SUPERADMIN: {
    label: 'Superadmin',
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
}

export function RoleBadge({ role }: { role: Role }) {
  const config = roleConfig[role]
  return (
    <Badge className={config.className} variant="secondary">
      {config.label}
    </Badge>
  )
}
