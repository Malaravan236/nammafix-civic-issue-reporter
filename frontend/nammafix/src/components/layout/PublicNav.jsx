import { NavLink, Link } from 'react-router-dom'
import Logo from '../common/Logo'
export default function PublicNav() {
  return (
    <header className="pub-nav">
      <Logo />
      <nav>
        <NavLink end to="/">Home</NavLink>
        <NavLink to="/issues">Reports</NavLink>
        <NavLink to="/map">Map</NavLink>
        <a href="/#about">About</a>
      </nav>
      <span className="btn">🌐 English ⌄</span>
      <Link to="/login" className="btn">Login</Link>
      <Link to="/register" className="btn btn-primary">Register</Link>
    </header>
  )
}
