import { Outlet } from 'react-router-dom'
import Radar from './Radar'
import Sidebar from './Sidebar'

export default function Shell() {
  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-main">
        <Radar />
        <Outlet />
      </div>
    </div>
  )
}
