import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar header-glow">
      <Link to="/" className="navbar-title">
        NordCore
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
