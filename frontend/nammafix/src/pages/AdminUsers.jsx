import { useEffect, useState } from 'react'
import { adminUsers, setUserActive } from '../services/issueService'

export default function AdminUsers() {
  const [rows, setRows] = useState([])
  const [msg, setMsg] = useState('')
  const load = () => adminUsers().then(setRows).catch((e) => setMsg(e.message))
  useEffect(() => { load() }, [])
  const toggle = async (u) => { try { await setUserActive(u.id, !u.is_active); load() } catch (e) { setMsg(e.message) } }
  return (
    <>
      <div><h2>Manage Users</h2><span className="muted">Registered users. Block an account to stop it from logging in.</span></div>
      {msg && <div className="err">{msg}</div>}
      <div className="card">
        {rows.map((u) => (
          <div key={u.id} className="rep" style={{ gridTemplateColumns: '44px 1fr 110px 120px 110px' }}>
            <span className="avatar">{u.name[0]?.toUpperCase()}</span>
            <div><b>{u.name}</b><br /><small className="muted">{u.email}</small></div>
            <small className="muted">Joined {new Date(u.joined).toLocaleDateString()}</small>
            <span>📄 {u.reports} reports</span>
            <button className="btn" onClick={() => toggle(u)}>{u.is_active ? 'Block' : 'Unblock'}</button>
          </div>
        ))}
        {!rows.length && <p className="muted">No registered users yet.</p>}
      </div>
    </>
  )
}
