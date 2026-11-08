import { useEffect, useState } from 'react'
import { notifications } from '../services/issueService'

export default function useUnread(enabled) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (enabled) notifications().then((d) => setN(d.filter((x) => !x.is_read).length)).catch(() => {})
  }, [enabled])
  return n
}
