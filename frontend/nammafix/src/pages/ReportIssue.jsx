import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { createIssue } from '../services/issueService'
import { CATEGORIES, CATEGORY_ICONS, DEFAULT_CENTER } from '../utils/constants'

const Pick = ({ onPick }) => { useMapEvents({ click: (e) => onPick([e.latlng.lat, e.latlng.lng]) }); return null }

export default function ReportIssue() {
  const nav = useNavigate()
  const [f, setF] = useState({ title: '', description: '', category: 'pothole', address: '' })
  const [pos, setPos] = useState(DEFAULT_CENTER)
  const [files, setFiles] = useState([])
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const here = () => navigator.geolocation?.getCurrentPosition((p) => setPos([p.coords.latitude, p.coords.longitude]), () => setErr('Could not read your location.'))
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true)
    const d = new FormData()
    Object.entries(f).forEach(([k, v]) => d.append(k, v))
    d.append('latitude', pos[0].toFixed(6)); d.append('longitude', pos[1].toFixed(6))
    files.forEach((x) => d.append('photos', x))
    try { const i = await createIssue(d); nav(`/issues/${i.id}`) } catch (x) { setErr(x.message || 'Could not submit the report.') } finally { setBusy(false) }
  }
  return (
    <>
      <div><h2>Create a New Report</h2><span className="muted">Share the problem in your area and help your community.</span></div>
      <div className="cols">
        <form className="card" onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
          {err && <div className="err">{err}</div>}
          <b>1. Problem Details</b>
          <input className="input" placeholder="Title * — a short title for the problem" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required />
          <textarea className="input" rows={4} maxLength={500} placeholder="Description * — describe the issue in detail" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} required />
          <b>2. Category</b>
          <div className="cat-grid">
            {Object.entries(CATEGORIES).map(([k, l]) => (
              <button type="button" key={k} className={'cat-tile' + (f.category === k ? ' on' : '')} onClick={() => setF({ ...f, category: k })}><span className="ic">{CATEGORY_ICONS[k]}</span>{l}</button>
            ))}
          </div>
          <b>3. Location</b>
          <div style={{ display: 'flex', gap: 10 }}>
            <input className="input" placeholder="Address / landmark (optional)" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
            <button type="button" className="btn" onClick={here}>📍 Use my location</button>
          </div>
          <b>4. Upload Photos <small className="muted">(Optional)</small></b>
          <label className="drop">Click to upload · JPG, PNG (max 5MB)
            <input type="file" accept="image/*" multiple hidden onChange={(e) => setFiles([...e.target.files].slice(0, 3))} />
          </label>
          <div style={{ display: 'flex', gap: 10 }}>{files.map((x) => <img key={x.name} className="thumb" src={URL.createObjectURL(x)} alt="" />)}</div>
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Submitting…' : 'Submit Report'}</button>
        </form>
        <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
          <div className="card"><div className="ph"><h3>Location Preview</h3><small className="muted">Click map to set</small></div>
            <MapContainer center={pos} zoom={14} className="map" key={pos.join()}><TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" /><Pick onPick={setPos} /><Marker position={pos} /></MapContainer>
          </div>
          <div className="card tips"><h3>Quick Tips</h3>
            {['Add a clear and descriptive title.', 'Include photos for better visibility.', 'Select the correct category.', 'Use exact location for faster action.', 'Be respectful and follow community guidelines.'].map((t) => <p key={t}>✅ {t}</p>)}
          </div>
        </div>
      </div>
    </>
  )
}
