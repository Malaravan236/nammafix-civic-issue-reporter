import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { notifications, markAllRead } from '../services/issueService'

const ICON = { status: '🔔', comment: '💬', support: '📣', nearby: '📍' }

export default function Notifications() {
  const [items, setItems] = useState([])
  const load = () => notifications().then(setItems).catch(() => {})
  useEffect(() => { load() }, [])
  const count = (k) => items.filter((i) => i.kind === k).length
  return (
    <>
      <div className="ph"><div><h2>Notifications</h2><span className="muted">Stay updated with the latest activities on your reports and community.</span></div>
        <button className="btn" onClick={async () => { await markAllRead(); load() }}>✓ Mark All as Read</button></div>
      <div className="cols">
        <div className="card">
          {items.map((n) => <div key={n.id} className="rep" style={{ gridTemplateColumns: '46px 1fr auto', opacity: n.is_read ? .65 : 1 }}>
            <span className="ic">{ICON[n.kind] || '🔔'}</span><div><b>{n.title}</b><br /><small className="muted">{n.message}</small></div>
            <small className="muted">{new Date(n.created_at).toLocaleString()}</small></div>)}
          {!items.length && <p className="muted">You're all caught up.</p>}
        </div>
        <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
          <div className="card"><h3>Notification Summary</h3><div className="two" style={{ marginTop: 10 }}>
            <div className="stat g"><div><b>{items.length}</b><small>Total</small></div></div><div className="stat b"><div><b>{count('comment')}</b><small>Comments</small></div></div>
            <div className="stat a"><div><b>{count('support')}</b><small>Supports</small></div></div><div className="stat r"><div><b>{count('status')}</b><small>Status updates</small></div></div></div></div>
          <div className="card"><h3>Quick Actions</h3><div style={{ display: 'grid', gap: 8, marginTop: 10 }}><Link className="btn" to="/my-reports">View My Reports</Link><Link className="btn" to="/map">Open Map</Link><Link className="btn" to="/report">Create New Report</Link></div></div>
        </div>
      </div>
    </>
  )
}
