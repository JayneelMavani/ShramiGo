import { BarChart3, BriefcaseBusiness, CalendarDays, Home, Search, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const customerItems = [
  ['Home', '/customer', Home],
  ['Search', '/customer/search', Search],
  ['Bookings', '/customer/bookings', CalendarDays],
  ['Profile', '/customer/profile', UserRound]
] as const

const workerItems = [
  ['Home', '/worker', Home],
  ['Jobs', '/worker/job-requests', BriefcaseBusiness],
  ['Earnings', '/worker/earnings', BarChart3],
  ['Profile', '/worker/profile', UserRound]
] as const

export function BottomNavigation({ role }: { role: 'customer' | 'worker' }) {
  const items = role === 'customer' ? customerItems : workerItems

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]" 
      aria-label={`${role} navigation`}
    >
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {items.map(([label, path, Icon]) => (
          <NavLink 
            key={label} 
            to={path} 
            end={label === 'Home'}
            className={({ isActive }) => 
              `flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-all duration-200 ${
                isActive 
                  ? 'text-[#087F7A] font-semibold scale-105' 
                  : 'text-gray-500 hover:text-gray-900'
              }`
            }
          >
            <Icon size={20} className="mb-0.5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
