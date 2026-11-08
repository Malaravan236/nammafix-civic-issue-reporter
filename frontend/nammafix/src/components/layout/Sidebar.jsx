import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import useUnread from '../../hooks/useUnread'
import Logo from '../common/Logo'

const USER = [
  ['/dashboard', '🏠', 'Dashboard'], ['/report', '＋', 'Create Report'], ['/my-reports', '📄', 'My Reports'],
  ['/map', '🗺', 'Map'], ['/notifications', '🔔', 'Notifications'], ['/profile', '👤', 'Profile'],
]
const ADMIN = [
  ['/admin', '🏠', 'Dashboard'], ['/admin/reports', '📄', 'Manage Reports'], ['/admin/users', '👥', 'Manage Users'], ['/map', '🗺', 'Map'],
]

export default function Sidebar() {
  const { isStaff, logout } = useAuth()
  const nav = useNavigate()
  const unread = useUnread(!isStaff)
  return (
    <aside className="sidebar">
      <Logo to={isStaff ? '/admin' : '/'} />
      {(isStaff ? ADMIN : USER).map(([to, ic, label]) => (
        <NavLink key={to} to={to} end={to === '/admin'} className="side-link">
          <span>{ic}</span>{label}
          {label === 'Notifications' && unread > 0 && <span className="badge">{unread}</span>}
        </NavLink>
      ))}
      <div className="side-spacer" />
      <button className="side-link" onClick={() => { logout(); nav(isStaff ? '/admin/login' : '/') }}>⎋ Logout</button>
      <div className="side-note">{isStaff ? 'Admin Portal' : <>Better Community<br />Brighter Tomorrow</>}</div>
    </aside>
  )
}
