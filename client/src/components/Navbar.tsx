import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo/rune-ring-edited.svg';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar header-glow">
      <Link to="/" className="navbar-title">
        <img src={logo} alt="Ironset" className="navbar-logo" />
      </Link>
      <nav className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          Dashboard
        </NavLink>
        <NavLink to="/progression" className={({ isActive }) => (isActive ? 'active' : '')}>
          Progression
        </NavLink>
      </nav>
      <div className="navbar-right">
        <span className="navbar-user">{user?.username}</span>
        <button className="navbar-logout" onClick={logout}>
          Log out
        </button>
      </div>
    </header>
  );
}
