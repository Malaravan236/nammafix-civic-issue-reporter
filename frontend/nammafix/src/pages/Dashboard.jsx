import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { myReports } from '../services/issueService'
import IssueMap from '../components/map/IssueMap'
import StatusBadge from '../components/issues/StatusBadge'
import Thumb from '../components/common/Thumb'
import { CATEGORIES } from '../utils/constants'

export const ReportRow = ({ i }) => (
  <Link to={`/issues/${i.id}`} className="rep">
    <Thumb issue={i} />
    <div>
      <h4>{i.title}</h4>
      <span className="tag-c">{CATEGORIES[i.category] || i.category}</span><br />
      <small>📍 {i.address || `${i.latitude?.toFixed?.(3)}, ${i.longitude?.toFixed?.(3)}`} · {new Date(i.created_at).toLocaleString()}</small>
    </div>
    <div style={{ textAlign: 'right' }}>
      <StatusBadge status={i.status} /><br />
      <small className="muted">👍 {i.support_count} Support · 💬 {i.comments?.length || 0}</small>
    </div>
  </Link>
)

export default function Dashboard() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  useEffect(() => { myReports().then(setItems).catch(() => {}) }, [])
  const n = (s) => items.filter((i) => i.status === s).length
  const pct = (v) => (items.length ? ((v / items.length) * 100).toFixed(1) : 0)
  const stats = [['g', '📄', 'Total Reports', items.length, ''], ['r', '❗', 'Open', n('open'), `${pct(n('open'))}% of total`], ['a', '⏱', 'In Progress', n('in_progress'), `${pct(n('in_progress'))}% of total`], ['b', '✅', 'Resolved', n('resolved'), `${pct(n('resolved'))}% of total`]]
  return (
    <>
      <div className="welcome card"><span className="ic">👋</span><div><h2>Welcome back, {user.first_name || user.username}!</h2><span className="muted">Together we can make our community better.</span></div></div>
      <div className="stats">
        {stats.map(([c, ic, l, v, s]) => <div key={l} className={'stat ' + c}><span className="ic">{ic}</span><div><small>{l}</small><b>{v}</b><small className="muted">{s}</small></div></div>)}
      </div>
      <div className="cols">
        <div className="card">
          <div className="ph"><h3>Recent Reports</h3><Link to="/my-reports">View All</Link></div>
          {items.slice(0, 5).map((i) => <ReportRow key={i.id} i={i} />)}
          {!items.length && <p className="muted">No reports yet. <Link to="/report" style={{ color: 'var(--g7)' }}>Create your first report</Link>.</p>}
        </div>
        <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
          <div className="card"><div className="ph"><h3>Reported Problems Near You</h3><Link to="/map">View All</Link></div><IssueMap issues={items} height={220} /></div>
          <div className="card"><h3 style={{ marginBottom: 10 }}>Quick Actions</h3>
            <div className="two">
              <Link className="btn" to="/report">Create New Report</Link><Link className="btn" to="/map">View Map</Link>
              <Link className="btn" to="/my-reports">My Reports</Link><Link className="btn" to="/notifications">View Notifications</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
