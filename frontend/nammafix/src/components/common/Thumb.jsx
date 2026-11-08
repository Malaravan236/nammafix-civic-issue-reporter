import { useState } from 'react'
import { CATEGORY_ICONS } from '../../utils/constants'

const TINT = { pothole: '#e3e8ee', water: '#d8ecfb', garbage: '#d9f0e0', streetlight: '#fdeec6', parks: '#dcf3d8', safety: '#e0f0e8', transport: '#e3e6fb', other: '#ebe6fa' }

export default function Thumb({ issue, w = 76, h = 60 }) {
  const [bad, setBad] = useState(false)
  if (issue.photo && !bad) return <img src={issue.photo} alt={issue.title} onError={() => setBad(true)} style={{ width: w, height: h, borderRadius: 8, objectFit: 'cover' }} />
  return <div style={{ width: w, height: h, borderRadius: 8, background: TINT[issue.category] || '#e6eee9', display: 'grid', placeItems: 'center', fontSize: Math.min(w, h) / 2 }}>{CATEGORY_ICONS[issue.category] || '📍'}</div>
}
