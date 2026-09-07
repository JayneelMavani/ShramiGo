import { Outlet } from 'react-router-dom'
import { BottomNavigation } from '../components/navigation/BottomNavigation'

export function CustomerLayout() {
  return (
    <div className="min-h-screen pb-20 bg-[#F7F8F8]">
      <Outlet />
      <BottomNavigation role="customer" />
    </div>
  )
}
