import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProfile, saveProfile, myReports } from '../services/issueService'
import StatusBadge from '../components/issues/StatusBadge'

const Avatar = ({ src, name, cls = '' }) => (
  <span className={'avatar ' + cls}>{src ? <img className="av-img" src={src} alt={name} /> : name[0]?.toUpperCase()}</span>
)

export default function Profile() {
  const { user, isStaff, updateUser } = useAuth()
  const [p, setP] = useState({ name: user.first_name || user.username, email: user.email || '', phone: '', location: '', bio: '', avatar: null, joined: null })
  const [items, setItems] = useState([])
  const [edit, setEdit] = useState(false)
  const [file, setFile] = useState(null)
  const [msg, setMsg] = useState('')
  useEffect(() => { getProfile().then((d) => setP((x) => ({ ...x, ...d }))).catch(() => {}); myReports().then(setItems).catch(() => {}) }, [])

  const save = async () => {
    const d = new FormData()
    ;['name', 'email', 'phone', 'location', 'bio'].forEach((k) => d.append(k, p[k] || ''))
    if (file) d.append('avatar', file)
    try {
      const r = await saveProfile(d)
      setP((x) => ({ ...x, ...r })); setFile(null); setEdit(false); setMsg('Profile updated.')
      updateUser({ ...user, first_name: r.name, email: r.email, avatar: r.avatar })
    } catch (e) { setMsg(e.message || 'Could not update the profile.') }
  }
  const f = (k) => (e) => setP({ ...p, [k]: e.target.value })
  const n = (s) => items.filter((i) => i.status === s).length
  const supports = items.reduce((t, i) => t + (i.support_count || 0), 0)
  const joined = p.joined ? new Date(p.joined).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
  const preview = file ? URL.createObjectURL(file) : p.avatar

  if (edit) return (
    <>
      <button className="btn" style={{ width: 'fit-content' }} onClick={() => setEdit(false)}>← Back to Profile</button>
      <div className="card" style={{ display: 'grid', gap: 14, maxWidth: 760 }}>
        <div><h2>Edit Profile</h2><span className="muted">Update your personal information.</span></div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Avatar src={preview} name={p.name} cls="big-av" />
          <div><label className="btn">📷 Change Photo<input type="file" accept="image/png,image/jpeg" hidden onChange={(e) => setFile(e.target.files[0] || null)} /></label><br /><small className="muted">JPG or PNG, max 2MB</small></div>
        </div>
        <div className="two"><label>Full Name *<input className="input" value={p.name} onChange={f('name')} required /></label><label>Email Address *<input className="input" type="email" value={p.email} onChange={f('email')} required /></label></div>
        <div className="two"><label>Phone<input className="input" value={p.phone} onChange={f('phone')} placeholder="+91 98765 43210" /></label><label>Location<input className="input" value={p.location} onChange={f('location')} placeholder="Area, City" /></label></div>
        <label>Bio<textarea className="input" rows={3} maxLength={200} value={p.bio} onChange={f('bio')} placeholder="Tell your neighbours a little about you" /></label>
        <small className="muted">{p.bio.length} / 200</small>
        {msg && <div className="err">{msg}</div>}
        <div style={{ display: 'flex', gap: 10 }}><button className="btn btn-primary" onClick={save}>✓ Save Changes</button><button className="btn" onClick={() => { setEdit(false); setFile(null) }}>✕ Cancel</button></div>
      </div>
    </>
  )

  return (
    <>
      {msg && <div className="welcome card">{msg}</div>}
      <div className="card" style={{ display: 'flex', gap: 22, alignItems: 'center', flexWrap: 'wrap' }}>
        <Avatar src={p.avatar} name={p.name} cls="big-av" />
        <div style={{ flex: 1, minWidth: 220 }}>
          <h2>{p.name} <span style={{ color: 'var(--g5)' }}>✔</span></h2>
          <span className="pill resolved">{isStaff ? 'Administrator' : 'Active'}</span>
          <p className="muted" style={{ margin: '8px 0 0' }}>✉ {p.email || '—'}<br />📍 {p.location || 'Location not set'}<br />📅 Joined {joined}</p>
        </div>
        <div className="stats" style={{ gridTemplateColumns: 'repeat(4,92px)' }}>
          <div className="stat g"><div><b>{items.length}</b><small>Reports</small></div></div>
          <div className="stat b"><div><b>{n('resolved')}</b><small>Resolved</small></div></div>
          <div className="stat a"><div><b>{n('in_progress')}</b><small>In Progress</small></div></div>
          <div className="stat r"><div><b>{supports}</b><small>Supports</small></div></div>
        </div>
      </div>
      <div className="cols">
        <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
          <div className="card"><div className="ph"><h3>About Me</h3></div><p>{p.bio || <span className="muted">Add a short bio so neighbours know who you are.</span>}</p></div>
          <div className="card"><div className="ph"><h3>Personal Information</h3><button className="btn" onClick={() => setEdit(true)}>✎ Edit Profile</button></div>
            {[['Full Name', p.name], ['Email Address', p.email], ['Phone', p.phone], ['Location', p.location], ['Member Since', joined]].map(([k, v]) => <p key={k} style={{ margin: '8px 0' }}><span className="muted" style={{ display: 'inline-block', width: 140 }}>{k}</span>: {v || '—'}</p>)}</div>
          <div className="card"><div className="ph"><h3>Recent Activity</h3><Link to="/my-reports">View All</Link></div>
            {items.slice(0, 5).map((i) => <Link key={i.id} to={`/issues/${i.id}`} className="rep" style={{ gridTemplateColumns: '110px 1fr auto', padding: '8px 0' }}><small className="muted">{new Date(i.created_at).toLocaleDateString()}</small><span>Created a report: <b>{i.title}</b></span><StatusBadge status={i.status} /></Link>)}
            {!items.length && <p className="muted">No activity yet.</p>}</div>
        </div>
        <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
          <div className="card"><h3>Quick Links</h3><div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
            <button className="btn" onClick={() => setEdit(true)}>✎ Edit Profile</button><Link className="btn" to="/my-reports">📄 View My Reports</Link><Link className="btn" to="/notifications">🔔 Notifications</Link></div></div>
          <div className="card"><h3>Account Status</h3><div className="welcome" style={{ marginTop: 10 }}>✅ <b>Your account is active</b></div></div>
        </div>
      </div>
    </>
  )
}
