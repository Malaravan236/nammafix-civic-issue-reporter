export const CATEGORIES = { pothole: 'Road', water: 'Water', garbage: 'Garbage', streetlight: 'Streetlight', parks: 'Parks & Environment', safety: 'Safety', transport: 'Public Transport', other: 'Other' }
export const CATEGORY_ICONS = { pothole: '🛣', water: '💧', garbage: '🗑', streetlight: '💡', parks: '🌳', safety: '🛡', transport: '👥', other: '⋯' }
export const STATUSES = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', duplicate: 'Duplicate', rejected: 'Rejected' }
export const STATUS_COLORS = { open: '#e5484d', in_progress: '#f5a524', resolved: '#16a362', duplicate: '#6b7280', rejected: '#9a3412' }
export const DEFAULT_CENTER = [11.0168, 76.9558]
export const list = (d) => (Array.isArray(d) ? d : d?.results || [])
