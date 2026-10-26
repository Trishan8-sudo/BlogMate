import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { axiosInstance } from '../axiosCalls/axios'

function Navbar() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await axiosInstance.post('/users/logout')
    } catch (err) {
      console.error('Logout failed', err)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
      navigate('/login')
      setLoggingOut(false)
    }
  }

  const isActive = (path) => location.pathname === path

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/home" className="navbar-logo">
          <span className="logo-icon">✍️</span>
          <span className="logo-text">Blog<span className="logo-accent">Mate</span></span>
        </Link>

        {/* Desktop Nav */}
        {user && (
          <div className="navbar-links">
            <Link to="/home" className={`nav-link ${isActive('/home') ? 'active' : ''}`}>
              🏠 Feed
            </Link>
            <Link to="/my-posts" className={`nav-link ${isActive('/my-posts') ? 'active' : ''}`}>
              📄 My Posts
            </Link>
            <Link to="/write" className={`nav-link nav-link-write ${isActive('/write') ? 'active' : ''}`}>
              ✍️ Write
            </Link>
          </div>
        )}

        {/* User Section */}
        <div className="navbar-user">
          {user ? (
            <div className="user-menu-wrapper">
              <button
                className="user-avatar-btn"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.fullName} />
                  ) : (
                    <span>{getInitials(user.fullName)}</span>
                  )}
                </div>
                <span className="user-name-short">{user.fullName?.split(' ')[0]}</span>
                <svg className={`chevron ${menuOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {menuOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      {user.avatar ? <img src={user.avatar} alt={user.fullName} /> : <span>{getInitials(user.fullName)}</span>}
                    </div>
                    <div>
                      <p className="dropdown-name">{user.fullName}</p>
                      <p className="dropdown-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                    👤 Profile
                  </Link>
                  <Link to="/my-posts" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                    📝 My Posts
                  </Link>
                  <div className="dropdown-divider" />
                  <button
                    className="dropdown-item dropdown-logout"
                    onClick={handleLogout}
                    disabled={loggingOut}
                  >
                    {loggingOut ? '⏳ Logging out...' : '🚪 Logout'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-ghost">Login</Link>
              <Link to="/register" className="btn-primary">Get Started</Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span><span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && user && (
        <div className="mobile-menu">
          <Link to="/home" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>🏠 Feed</Link>
          <Link to="/my-posts" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>📄 My Posts</Link>
          <Link to="/write" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>✍️ Write</Link>
          <Link to="/profile" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>👤 Profile</Link>
          <button className="mobile-nav-link mobile-logout" onClick={handleLogout}>🚪 Logout</button>
        </div>
      )}
    </nav>
  )
}

export default Navbar
