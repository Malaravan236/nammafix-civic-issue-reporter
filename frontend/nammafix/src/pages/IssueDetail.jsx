import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getIssue, addComment, supportIssue, resolveIssue } from '../services/issueService'
import Thumb from '../components/common/Thumb'
import StatusBadge from '../components/issues/StatusBadge'
import IssueMap from '../components/map/IssueMap'
import { CATEGORIES, STATUSES } from '../utils/constants'

export default function IssueDetail() {
  const { id } = useParams()
  const { isAuthed, isStaff } = useAuth()
  const citizen = isAuthed && !isStaff
  const [i, setI] = useState(null)
  const [text, setText] = useState('')
  const [st, setSt] = useState({ status: 'in_progress', remarks: '' })
  const [msg, setMsg] = useState('')
  const load = () => getIssue(id).then(setI).catch(() => setMsg('Report not found.'))
  useEffect(() => { load() }, [id])
  if (!i) return <p className="muted">{msg || 'Loading…'}</p>
  const act = (fn) => async () => { try { await fn(); setMsg(''); load() } catch (e) { setMsg(e.message || 'Something went wrong.') } }
  return (
    <>
      <Link to={isStaff ? '/admin/reports' : isAuthed ? '/my-reports' : '/issues'} className="muted">← Back to Reports</Link>
      {msg && <div className="err">{msg}</div>}
      <div className="card" style={{ display: 'flex', gap: 18 }}>
        <Thumb issue={i} w={130} h={100} />
        <div style={{ flex: 1 }}><h2>{i.title}</h2><span className="tag-c">{CATEGORIES[i.category]}</span><br /><small className="muted">📍 {i.address || `${i.latitude}, ${i.longitude}`} · {new Date(i.created_at).toLocaleString()}</small></div>
        <div style={{ textAlign: 'right' }}><StatusBadge status={i.status} /><br /><br />
          {citizen ? <button className="btn" onClick={act(() => supportIssue(i.id))}>👍 {i.support_count} Support</button> : <span className="muted">👍 {i.support_count} Support</span>}</div>
      </div>
      <div className="cols">
        <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
          <div className="card"><h3>Description</h3><p>{i.description}</p>
            {i.images.length > 0 && <div className="gallery">{i.images.map((u) => <a key={u} href={u} target="_blank" rel="noreferrer"><img src={u} alt={i.title} /></a>)}</div>}
            <small className="muted">Reported by {i.user}</small></div>
          <div className="card"><h3>Comments &amp; Suggestions</h3>
            {citizen && <div style={{ display: 'flex', gap: 8, margin: '10px 0' }}><input className="input" placeholder="Add a comment or suggestion..." value={text} onChange={(e) => setText(e.target.value)} /><button className="btn btn-primary" onClick={act(async () => { if (text.trim()) { await addComment(i.id, text); setText('') } })}>Post</button></div>}
            {i.comments.map((c) => <div key={c.id} className="cmt"><span className="avatar">{c.user[0]?.toUpperCase()}</span><div><b>{c.user}</b>{c.user === i.user && ' (Author)'}<br />{c.text}<br /><small className="muted">{new Date(c.created_at).toLocaleString()}</small></div></div>)}
            {!i.comments.length && <p className="muted">No comments yet.</p>}
          </div>
        </div>
        <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
          <div className="card"><h3>Location</h3><IssueMap issues={[i]} height={180} /></div>
          <div className="card"><h3>Status History</h3>
            {i.history.map((h, k) => <div key={k} className="cmt"><span className="dot" /><div><b>{h.label}</b><br /><small className="muted">{new Date(h.at).toLocaleString()}{h.note ? ` · ${h.note}` : ''}</small></div></div>)}
          </div>
          {isStaff && <div className="card" style={{ display: 'grid', gap: 10 }}><h3>Admin Actions</h3>
            <select className="input" value={st.status} onChange={(e) => setSt({ ...st, status: e.target.value })}>{Object.entries(STATUSES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            <input className="input" placeholder="Remarks" value={st.remarks} onChange={(e) => setSt({ ...st, remarks: e.target.value })} />
            <button className="btn btn-primary" onClick={act(() => resolveIssue(i.id, st.status, st.remarks))}>Update status</button></div>}
        </div>
      </div>
    </>
  )
}
