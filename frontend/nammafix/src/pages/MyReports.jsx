import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { myReports } from '../services/issueService'
import { ReportRow } from './Dashboard'

const TABS = [['all', 'All'], ['open', 'Open'], ['in_progress', 'In Progress'], ['resolved', 'Resolved'], ['duplicate', 'Duplicate']]

export default function MyReports() {
  const [items, setItems] = useState([])
  const [tab, setTab] = useState('all')
  const [q, setQ] = useState('')
  useEffect(() => { myReports().then(setItems).catch(() => {}) }, [])
  const shown = items.filter((i) => (tab === 'all' || i.status === tab) && (i.title + i.description).toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <div className="ph"><div><h2>My Reports</h2><span className="muted">View and manage all your submitted reports.</span></div><Link className="btn btn-primary" to="/report">+ Create New Report</Link></div>
      <div className="cols">
        <div className="card">
          <div className="tabs" style={{ marginBottom: 12 }}>
            {TABS.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l} {k === 'all' ? items.length : items.filter((i) => i.status === k).length}</button>)}
          </div>
          <input className="input" placeholder="Search by title or description..." value={q} onChange={(e) => setQ(e.target.value)} />
          {shown.map((i) => <ReportRow key={i.id} i={i} />)}
          {!shown.length && <p className="muted">Nothing here yet.</p>}
        </div>
        <div className="card"><h3>Report Summary</h3>
          <div className="two" style={{ marginTop: 10 }}>
            <div className="stat g"><div><b>{items.length}</b><small>Total Reports</small></div></div>
            <div className="stat r"><div><b>{items.filter((i) => i.status === 'open').length}</b><small>Open</small></div></div>
            <div className="stat a"><div><b>{items.filter((i) => i.status === 'in_progress').length}</b><small>In Progress</small></div></div>
            <div className="stat g"><div><b>{items.filter((i) => i.status === 'resolved').length}</b><small>Resolved</small></div></div>
          </div>
        </div>
      </div>
    </>
  )
}
