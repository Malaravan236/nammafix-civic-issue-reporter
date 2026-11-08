import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listIssues, resolveIssue, deleteIssue } from '../services/issueService'
import { CATEGORIES, STATUSES } from '../utils/constants'
import Thumb from '../components/common/Thumb'

export default function AdminReports() {
  const [d, setD] = useState({ results: [], count: 0 })
  const [f, setF] = useState({ search: '', status: '', category: '' })
  const [page, setPage] = useState(1)
  const [msg, setMsg] = useState('')
  const load = () => listIssues({ ...f, page, page_size: 10 }).then(setD).catch((e) => setMsg(e.message))
  useEffect(() => { load() }, [f, page]) // eslint-disable-line react-hooks/exhaustive-deps
  const setStatus = async (id, status) => { try { await resolveIssue(id, status, `Status set to ${STATUSES[status]} by admin`); load() } catch (e) { setMsg(e.message) } }
  const remove = async (id) => { if (confirm('Delete this report permanently?')) { await deleteIssue(id).catch((e) => setMsg(e.message)); load() } }
  const pages = Math.max(1, Math.ceil(d.count / 10))
  const sel = (k, o, all) => <select className="input" value={f[k]} onChange={(e) => { setPage(1); setF({ ...f, [k]: e.target.value }) }}><option value="">{all}</option>{Object.entries(o).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
  return (
    <>
      <div><h2>Manage Reports</h2><span className="muted">Review every report and update its status.</span></div>
      {msg && <div className="err">{msg}</div>}
      <div className="card">
        <div className="two" style={{ gridTemplateColumns: '2fr 1fr 1fr', marginBottom: 8 }}>
          <input className="input" placeholder="Search reports..." value={f.search} onChange={(e) => { setPage(1); setF({ ...f, search: e.target.value }) }} />
          {sel('category', CATEGORIES, 'All Categories')}{sel('status', STATUSES, 'All Status')}
        </div>
        {d.results.map((i) => (
          <div key={i.id} className="rep" style={{ gridTemplateColumns: '76px 1fr 150px 90px' }}>
            <Thumb issue={i} />
            <div><Link to={`/issues/${i.id}`}><b>{i.title}</b></Link><br /><span className="tag-c">{CATEGORIES[i.category]}</span><br /><small className="muted">by {i.user} · 📍 {i.address || '—'} · 👍 {i.support_count}</small></div>
            <select className="input" value={i.status} onChange={(e) => setStatus(i.id, e.target.value)}>{Object.entries(STATUSES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            <button className="btn" onClick={() => remove(i.id)}>🗑 Delete</button>
          </div>
        ))}
        {!d.results.length && <p className="muted">No reports match these filters.</p>}
        <div className="tabs" style={{ marginTop: 12, justifyContent: 'center' }}>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ Prev</button><span style={{ padding: '6px 10px' }}>Page {page} of {pages}</span><button disabled={page >= pages} onClick={() => setPage(page + 1)}>Next ›</button>
        </div>
      </div>
    </>
  )
}
