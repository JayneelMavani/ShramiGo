import { Outlet } from 'react-router-dom'
import { BottomNavigation } from '../components/navigation/BottomNavigation'

export function CustomerLayout() {
  return <div className="app-shell"><Outlet /><BottomNavigation role="customer" /></div>
}
