import { NavLink } from 'react-router-dom'
import { useApp } from '../context/AppState'
import { IconChat, IconSpark, IconSun, IconWeb } from './Icons'

const links = [
  { to: '/app/chats', label: 'Сети', icon: IconChat },
  { to: '/app/web', label: 'Паутина', icon: IconWeb },
  { to: '/app/profile', label: 'Профиль', icon: IconSpark },
  { to: '/app/settings', label: 'Настройки', icon: IconSun },
]

export default function Sidebar() {
  const { user } = useApp()
  const letter = (user?.name || 'Я').slice(0, 1).toUpperCase()

  return (
    <aside className="sidebar">
      <NavLink to="/app/chats" className="side-logo" aria-label="VAMSilk">
        V
      </NavLink>
      <nav className="side-nav">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-btn${isActive ? ' on' : ''}`} aria-label={link.label}>
              <Icon />
            </NavLink>
          )
        })}
      </nav>
      <NavLink to="/app/profile" className="side-me" aria-label="Мой аккаунт">
        {letter}
      </NavLink>
    </aside>
  )
}
