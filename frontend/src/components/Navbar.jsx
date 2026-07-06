import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Logo from '../assets/Logo.png';
import '../styles/navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <img src={Logo} alt="Lost & Found" className="navbar-logo" />
        <span>
          Lost<span className="navbar-accent">&amp;</span>Found
        </span>
      </Link>

      <div className="navbar-links">
        <Link to="/browse">Browse Found Items</Link>
        <Link to="/post-lost">Report Lost</Link>
        <Link to="/post-found">Report Found</Link>

        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={handleLogout} className="navbar-logout">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="navbar-cta">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;