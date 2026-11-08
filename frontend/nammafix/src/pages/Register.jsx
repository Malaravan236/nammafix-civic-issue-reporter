import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PublicNav from '../components/layout/PublicNav'
import Footer from '../components/layout/Footer'
import Logo from '../components/common/Logo'
import { AuthArt } from './Login'

export default function Register() {
  const { register, isAuthed } = useAuth()
  const nav = useNavigate()
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '', agree: true })
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = async (e) => {
    e.preventDefault(); setErr('')
    if (f.password.length < 8) return setErr('Password must be at least 8 characters long.')
    if (f.password !== f.confirm) return setErr('Passwords do not match.')
    if (!f.agree) return setErr('Please accept the Terms and Privacy Policy.')
    try { await register(f.email, f.password, f.email, f.name); nav('/dashboard') }
    catch (x) { setErr(x.message || 'Could not create the account.') }
  }
  if (isAuthed) return <Navigate to="/dashboard" replace />
  return (
    <>
      <PublicNav />
      <div className="auth">
        <AuthArt tag="JOIN NAMMAFIX" title={<>Be a Part of a<br />Better Community</>} />
        <div className="auth-pane">
          <form className="auth-box" onSubmit={submit}>
            <Logo />
            <h2>Create Your Account</h2>
            {err && <div className="err">{err}</div>}
            <div className="two">
              <input className="input" placeholder="Full Name *" value={f.name} onChange={set('name')} required />
              <input className="input" placeholder="Username (optional)" />
            </div>
            <input className="input" type="email" placeholder="Email Address *" value={f.email} onChange={set('email')} required />
            <input className="input" type="password" placeholder="Password *" value={f.password} onChange={set('password')} required />
            <small className="muted">Password must be at least 8 characters long.</small>
            <input className="input" type="password" placeholder="Confirm Password *" value={f.confirm} onChange={set('confirm')} required />
            <label><input type="checkbox" checked={f.agree} onChange={(e) => setF({ ...f, agree: e.target.checked })} /> I agree to the Terms and Conditions and Privacy Policy</label>
            <button className="btn btn-primary btn-block">Register</button>
            <div className="sep">OR</div>
            <button type="button" className="btn btn-block">G &nbsp;Continue with Google</button>
            <div className="sep">Already have an account? <Link to="/login" style={{ color: 'var(--g7)', fontWeight: 700 }}>Login</Link></div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  )
}
