import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// role: 'user' = registered users only, 'admin' = admins only, 'public' = guests and users (admins go to their panel)
export default function ProtectedRoute({ children, role = 'user' }) {
  const { isAuthed, isStaff } = useAuth()
  const loc = useLocation()
  if (role === 'admin') {
    if (!isAuthed) return <Navigate to="/admin/login" state={{ from: loc.pathname }} replace />
    if (!isStaff) return <Navigate to="/dashboard" replace />
  } else if (role === 'user') {
    if (!isAuthed) return <Navigate to="/login" state={{ from: loc.pathname }} replace />
    if (isStaff) return <Navigate to="/admin" replace />
  } else if (isStaff) return <Navigate to="/admin" replace />
  return children
}
