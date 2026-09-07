import { BarChart3, BriefcaseBusiness, CalendarDays, Home, Search, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const customerItems = [['Home', '/customer', Home], ['Search', '/customer/search', Search], ['Bookings', '/customer/bookings', CalendarDays], ['Profile', '/customer/profile', UserRound]] as const
const workerItems = [['Home', '/worker', Home], ['Jobs', '/worker/job-requests', BriefcaseBusiness], ['Earnings', '/worker/earnings', BarChart3], ['Profile', '/worker/profile', UserRound]] as const

export function BottomNavigation({ role }: { role: 'customer' | 'worker' }) {
  const items = role === 'customer' ? customerItems : workerItems
  return <nav className="bottom-navigation" aria-label={`${role} navigation`}>
    {items.map(([label, path, Icon]) => <NavLink key={label} to={path} end={label === 'Home'}>
      <Icon size={20} /><span>{label}</span>
    </NavLink>)}
  </nav>
}
