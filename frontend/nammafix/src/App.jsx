import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ReportIssue from './pages/ReportIssue'
import MapView from './pages/MapView'
import IssueList from './pages/IssueList'
import IssueDetail from './pages/IssueDetail'
import MyReports from './pages/MyReports'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'
import AdminReports from './pages/AdminReports'
import AdminUsers from './pages/AdminUsers'
import Notifications from './pages/Notifications'
import NotFound from './pages/NotFound'

const user = (el) => <ProtectedRoute role="user">{el}</ProtectedRoute>
const admin = (el) => <ProtectedRoute role="admin">{el}</ProtectedRoute>

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute role="public"><Home /></ProtectedRoute>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/login" element={<Login admin />} />

      <Route element={<AppLayout />}>
        {/* open to guests, users and admins */}
        <Route path="/issues/:id" element={<IssueDetail />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/issues" element={<ProtectedRoute role="public"><IssueList /></ProtectedRoute>} />

        {/* registered users only */}
        <Route path="/dashboard" element={user(<Dashboard />)} />
        <Route path="/report" element={user(<ReportIssue />)} />
        <Route path="/my-reports" element={user(<MyReports />)} />
        <Route path="/notifications" element={user(<Notifications />)} />
        <Route path="/profile" element={user(<Profile />)} />

        {/* admins only */}
        <Route path="/admin" element={admin(<AdminPanel />)} />
        <Route path="/admin/reports" element={admin(<AdminReports />)} />
        <Route path="/admin/users" element={admin(<AdminUsers />)} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
