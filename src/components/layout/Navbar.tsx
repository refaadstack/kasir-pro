'use client'

import { useAuth } from '@/hooks/useAuth'
import { RoleBadge } from './RoleBadge'
import { Button } from '@/components/ui/button'
import { LogOut, User, Bell } from 'lucide-react'

export function Navbar() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <nav className="bg-[rgba(12,12,17,0.96)] backdrop-blur-xl border-b border-white/10 px-4 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-400 rounded-xl flex items-center justify-center">
            <span className="text-lg font-black text-gray-900">⬡</span>
          </div>
          <div className="hidden md:block">
            <h1 className="text-sm font-black text-white">
              KASIR<span className="text-amber-400">PRO</span>
            </h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notification - Desktop only */}
          <button className="hidden md:flex p-2 hover:bg-white/5 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5 text-white/60" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full border-2 border-[#0c0c11]" />
          </button>

          {/* User info - Desktop only */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
            <div className="w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-sm font-black text-gray-900">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white leading-tight">{user.name}</span>
              <span className="text-[10px] text-white/40 leading-tight">{user.role}</span>
            </div>
          </div>

          {/* Logout - Desktop only */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout}
            className="hidden md:flex text-white/60 hover:text-white hover:bg-white/5"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>

          {/* User avatar - Mobile only */}
          <div className="md:hidden w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-sm font-black text-gray-900">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </nav>
  )
}
