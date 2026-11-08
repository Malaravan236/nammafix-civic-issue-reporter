import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminStats, listIssues } from '../services/issueService'
import { CATEGORIES, list } from '../utils/constants'
import Thumb from '../components/common/Thumb'
import StatusBadge from '../components/issues/StatusBadge'

const COL = ['#e5484d', '#2f80ed', '#16a362', '#f5a524', '#7c5cd6', '#0e7a4f', '#999', '#555']

export default function AdminPanel() {
  const [s, setS] = useState(null)
  const [rows, setRows] = useState([])
  useEffect(() => { adminStats().then(setS).catch(() => {}); listIssues().then((d) => setRows(list(d).slice(0, 5))).catch(() => {}) }, [])
  if (!s) return <p className="muted">Loading…</p>
  const max = Math.max(1, ...s.months.map((m) => m.total))
  const pt = (k) => s.months.map((m, i) => `${30 + i * 60},${150 - (m[k] / max) * 120}`).join(' ')
  const total = s.total || 1
  const ends = s.by_category.reduce((r, c) => [...r, (r.at(-1) || 0) + (c.count / total) * 100], [])
  const cone = s.by_category.map((c, i) => `${COL[i % 8]} ${ends[i - 1] || 0}% ${ends[i]}%`).join(',')
  const cards = [['g', '👥', 'Total Users', s.users], ['b', '📄', 'Total Reports', s.total], ['g', '✅', 'Resolved', s.resolved], ['a', '⏳', 'Pending', s.pending]]
  return (
    <>
      <div className="welcome card"><span className="ic">👑</span><div><h2>Welcome Back, Admin!</h2><span className="muted">Here's what's happening with NammaFix today.</span></div></div>
      <div className="stats">{cards.map(([c, i, l, v]) => <div key={l} className={'stat ' + c}><span className="ic">{i}</span><div><small>{l}</small><b>{v}</b></div></div>)}</div>
      <div className="cols">
        <div className="card"><h3>Reports Overview</h3>
          <svg viewBox="0 0 380 180" width="100%"><polyline fill="none" stroke="#2f80ed" strokeWidth="2" points={pt('total')} /><polyline fill="none" stroke="#16a362" strokeWidth="2" points={pt('resolved')} />
            {s.months.map((m, i) => <text key={m.label} x={30 + i * 60} y="172" fontSize="10" textAnchor="middle">{m.label.slice(5)}</text>)}</svg>
          <small><span style={{ color: '#2f80ed' }}>● Total Reports</span> &nbsp; <span style={{ color: '#16a362' }}>● Resolved</span></small></div>
        <div className="card"><h3>Reports by Category</h3>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginTop: 10 }}>
            <div className="donut" style={{ background: `conic-gradient(${cone || '#ddd 0 100%'})` }}><span>{s.total}<br />Total</span></div>
            <div>{s.by_category.map((c, i) => <p key={c.category} style={{ margin: '4px 0' }}><span style={{ color: COL[i % 8] }}>●</span> {CATEGORIES[c.category]} — {Math.round((c.count / total) * 100)}%</p>)}</div></div></div>
      </div>
      <div className="card"><div className="ph"><h3>Recent Reports</h3><Link to="/issues">View All</Link></div>
        {rows.map((i, k) => <Link key={i.id} to={`/issues/${i.id}`} className="rep" style={{ gridTemplateColumns: '30px 1fr 120px 120px' }}><span>{k + 1}</span><b style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Thumb issue={i} w={44} h={34} />{i.title}</b><small>{i.address || CATEGORIES[i.category]}</small><StatusBadge status={i.status} /></Link>)}</div>
    </>
  )
}
