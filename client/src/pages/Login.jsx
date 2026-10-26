import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axiosInstance.post('/users/login', form)
      if (res.data.token) {
        localStorage.setItem('token', res.data.token)
      }
      setUser(res.data.authenticatedUser || res.data.user)
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-blob blob-1"></div>
        <div className="auth-blob blob-2"></div>
      </div>

      <div className="auth-container">
        {/* Left Panel */}
        <div className="auth-left">
          <div className="auth-brand">
            <span className="auth-logo">✍️</span>
            <h1 className="auth-brand-name">BlogMate</h1>
          </div>
          <h2 className="auth-tagline">Share your thoughts with the world</h2>
          <p className="auth-desc">Join thousands of writers crafting beautiful stories, tutorials, and insights.</p>
          <div className="auth-features">
            <div className="auth-feature"><span>✨</span> Markdown editor</div>
            <div className="auth-feature"><span>❤️</span> Likes & comments</div>
            <div className="auth-feature"><span>🚀</span> Publish instantly</div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="auth-right">
          <div className="auth-card">
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-subtitle">Sign in to continue writing</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="btn-primary btn-full" disabled={loading}>
                {loading ? <span className="btn-spinner"></span> : 'Sign In'}
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">Create one free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
