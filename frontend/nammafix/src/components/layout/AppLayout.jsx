import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import useUnread from '../../hooks/useUnread'
import Sidebar from './Sidebar'
import PublicNav from './PublicNav'
import Footer from './Footer'

export default function AppLayout() {
  const { isAuthed, user, isStaff } = useAuth()
  const unread = useUnread(isAuthed && !isStaff)
  if (!isAuthed) return (<><PublicNav /><Outlet /><Footer /></>)
  const name = user.first_name || user.username
  const Chip = isStaff ? 'div' : Link
  return (
    <div className="app">
      <Sidebar />
      <div>
        <div className="topbar">
          <input className="input search" placeholder={isStaff ? 'Search reports, users, or locations...' : 'Search reports, locations, or keywords...'} />
          <span className="sp" />
          {!isStaff && <Link to="/notifications" className="bell">🔔{unread > 0 && <i>{unread}</i>}</Link>}
          <Chip to="/profile" className="chip">
            <span className="avatar">{user.avatar ? <img src={user.avatar} alt="" className="av-img" /> : name[0].toUpperCase()}</span>
            <span><b>{name}</b><br /><small className="muted">{isStaff ? 'Administrator' : 'User'}</small></span>
          </Chip>
        </div>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  )
}
