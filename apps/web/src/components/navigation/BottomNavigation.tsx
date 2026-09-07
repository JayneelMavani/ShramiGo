import { BarChart3, BriefcaseBusiness, CalendarDays, Home, Plus, Search, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'

interface NavItem {
  label: string
  path: string
  icon: React.ElementType
  isCenter?: boolean
  end?: boolean
}

const customerItems: NavItem[] = [
  { label: 'Home', path: '/customer', icon: Home, end: true },
  { label: 'Search', path: '/customer/search', icon: Search },
  { label: 'Bookings', path: '/customer/bookings', icon: CalendarDays },
  { label: 'Profile', path: '/customer/profile', icon: UserRound }
]

const workerItems: NavItem[] = [
  { label: 'Home', path: '/worker', icon: Home, end: true },
  { label: 'Jobs', path: '/worker/job-requests', icon: BriefcaseBusiness },
  { label: 'Add', path: '/worker/skills', icon: Plus, isCenter: true },
  { label: 'Earnings', path: '/worker/earnings', icon: BarChart3 },
  { label: 'Profile', path: '/worker/profile', icon: UserRound }
]

export function BottomNavigation({ role }: { role: 'customer' | 'worker' }) {
  const items = role === 'customer' ? customerItems : workerItems
  const activeColorClass = role === 'worker' ? 'text-[#087F7A]' : 'text-[#FF5A00]'

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]" 
      aria-label={`${role} navigation`}
    >
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const Icon = item.icon

          if (item.isCenter) {
            return (
              <NavLink
                key={item.label}
                to={item.path}
                className="flex flex-col items-center justify-center flex-1 h-full relative -top-3"
                title="Add Skills & Services"
              >
                <div className="w-12 h-12 rounded-full bg-[#087F7A] text-white flex items-center justify-center shadow-lg shadow-teal-700/30 hover:bg-[#066C68] transition-transform active:scale-95">
                  <Plus size={24} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-semibold text-[#087F7A] mt-0.5">
                  {item.label}
                </span>
              </NavLink>
            )
          }

          return (
            <NavLink 
              key={item.label} 
              to={item.path} 
              end={item.end}
              className={({ isActive }) => 
                `flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-all duration-200 ${
                  isActive 
                    ? `${activeColorClass} font-semibold` 
                    : 'text-gray-500 hover:text-gray-900'
                }`
              }
            >
              <Icon size={20} className="mb-0.5" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
