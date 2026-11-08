import { useEffect, useState } from 'react'
import { listIssues } from '../services/issueService'
import { CATEGORIES, STATUSES, list } from '../utils/constants'
import { ReportRow } from './Dashboard'

export default function IssueList() {
  const [items, setItems] = useState([])
  const [f, setF] = useState({ search: '', category: '', status: '' })
  useEffect(() => { listIssues(f).then((d) => setItems(list(d))).catch(() => {}) }, [f])
  return (
    <>
      <div><h2>Reports</h2><span className="muted">Browse every report from the community.</span></div>
      <div className="card">
        <div className="two" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
          <input className="input" placeholder="Search reports..." value={f.search} onChange={(e) => setF({ ...f, search: e.target.value })} />
          <select className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}><option value="">All Categories</option>{Object.entries(CATEGORIES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          <select className="input" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option value="">All Status</option>{Object.entries(STATUSES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        </div>
        {items.map((i) => <ReportRow key={i.id} i={i} />)}
        {!items.length && <p className="muted">No reports match these filters.</p>}
      </div>
    </>
  )
}
