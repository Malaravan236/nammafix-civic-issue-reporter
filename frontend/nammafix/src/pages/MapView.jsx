import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listIssues } from '../services/issueService'
import IssueMap from '../components/map/IssueMap'
import { CATEGORIES, STATUSES, list } from '../utils/constants'
import { ReportRow } from './Dashboard'

export default function MapView() {
  const [all, setAll] = useState([])
  const [f, setF] = useState({ category: '', status: '' })
  useEffect(() => { listIssues({ page_size: 500 }).then((d) => setAll(list(d))).catch(() => {}) }, [])
  const items = all.filter((i) => (!f.category || i.category === f.category) && (!f.status || i.status === f.status))
  const sel = (k, o, all_) => <select className="input" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })}><option value="">{all_}</option>{Object.entries(o).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
  return (
    <>
      <div><h2>Nearby Problem Map</h2><span className="muted">View and explore all reported problems in your area.</span></div>
      <div className="cols">
        <div className="card"><IssueMap issues={items} big /><p className="muted">💡 Tip: Click on any marker to view more details. Use filters to find specific problems.</p></div>
        <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
          <div className="card" style={{ display: 'grid', gap: 10 }}><h3>Filter Reports</h3>{sel('category', CATEGORIES, 'All Categories')}{sel('status', STATUSES, 'All Status')}<button className="btn" onClick={() => setF({ category: '', status: '' })}>Reset Filters</button></div>
          <div className="card"><div className="ph"><h3>Recent Reports</h3><Link to="/issues">View All</Link></div>{items.slice(0, 5).map((i) => <ReportRow key={i.id} i={i} />)}</div>
        </div>
      </div>
    </>
  )
}
