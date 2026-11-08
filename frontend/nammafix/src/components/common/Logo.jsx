import { Link } from 'react-router-dom'
export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="logo">
      <span className="pin"><i>❀</i></span>
      <span><b>NammaFix</b><small>Report • Connect • Solve</small></span>
    </Link>
  )
}
