import { Outlet } from 'react-router-dom'
import { BottomNavigation } from '../components/navigation/BottomNavigation'

export function WorkerLayout() {
  return <div className="app-shell"><Outlet /><BottomNavigation role="worker" /></div>
}
