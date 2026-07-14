import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo/ironset-logo.png';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar header-glow">
      <Link to="/" className="navbar-title">
        <img src={logo} alt="Ironset" className="navbar-logo" />
      </Link>
      <div className="navbar-right">
        <span className="navbar-user">{user?.username}</span>
        <button className="navbar-logout" onClick={logout}>
          Log out
        </button>
      </div>
    </header>
  );
}
