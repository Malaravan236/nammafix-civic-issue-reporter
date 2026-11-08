import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PublicNav from '../components/layout/PublicNav'
import Footer from '../components/layout/Footer'
import Logo from '../components/common/Logo'

export const AuthArt = ({ tag, title }) => (
  <div className="auth-art">
    <div className="tag">{tag}</div>
    <h1>{title}</h1>
    <p>Report local problems, get community support, and track solutions. Together we can build cleaner, safer and better neighborhoods.</p>
    <div className="row">
      {[['📄', 'Report Problems'], ['👥', 'Get Support'], ['📍', 'Track Status'], ['🛡', 'See Impact']].map(([i, t]) => (
        <div key={t}><span className="ic">{i}</span><br />{t}</div>
      ))}
    </div>
  </div>
)

export default function Login({ admin = false }) {
  const { login, isAuthed, isStaff } = useAuth()
  const nav = useNavigate()
  const [f, setF] = useState({ email: '', password: '' })
  const [err, setErr] = useState('')
  const submit = async (e) => {
    e.preventDefault(); setErr('')
    try { const u = await login(f.email, f.password, admin); nav(u.is_staff ? '/admin' : '/dashboard') }
    catch (x) { setErr(x.message?.startsWith('No active') ? 'Invalid email or password.' : x.message || 'Invalid email or password.') }
  }
  if (isAuthed) return <Navigate to={isStaff ? '/admin' : '/dashboard'} replace />
  return (
    <>
      <PublicNav />
      <div className="auth">
        <AuthArt tag={admin ? 'ADMIN PORTAL' : 'A CLEANER • SAFER • BETTER COMMUNITY'} title={admin ? <>NammaFix<br />Admin Login</> : <>Welcome Back to<br />NammaFix</>} />
        <div className="auth-pane">
          <form className="auth-box" onSubmit={submit}>
            <Logo />
            <h2>{admin ? 'Admin Login' : 'Login to Your Account'}</h2>
            <p className="muted" style={{ textAlign: 'center', margin: 0 }}>{admin ? 'Authorised administrators only.' : 'Welcome back! Please login to continue.'}</p>
            {err && <div className="err">{err}</div>}
            <input className="input" placeholder="Email address" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required />
            <input className="input" type="password" placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required />
            <button className="btn btn-primary btn-block">Login</button>
            {admin ? <div className="sep"><Link to="/login" style={{ color: 'var(--g7)', fontWeight: 700 }}>← User login</Link></div> : <>
            <div className="sep">OR</div>
            <button type="button" className="btn btn-block">G &nbsp;Continue with Google</button>
            <div className="sep">Don't have an account? <Link to="/register" style={{ color: 'var(--g7)', fontWeight: 700 }}>Register</Link></div></>}
          </form>
        </div>
      </div>
      <Footer />
    </>
  )
}
