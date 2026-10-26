import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

function Profile() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  })
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' })
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' })
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setProfileMsg({ type: '', text: '' })
    setProfileLoading(true)
    try {
      const res = await axiosInstance.patch('/users/update-profile', profileForm)
      setUser(res.data.authenticatedUser || res.data.user)
      setProfileMsg({ type: 'success', text: '✅ Profile updated successfully!' })
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Update failed' })
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordMsg({ type: '', text: '' })

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPasswordMsg({ type: 'error', text: 'New passwords do not match' })
    }
    if (passwordForm.newPassword.length < 6) {
      return setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters' })
    }

    setPasswordLoading(true)
    try {
      await axiosInstance.patch('/users/change-password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordMsg({ type: 'success', text: '✅ Password changed successfully!' })
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Password change failed' })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/users/logout')
      setUser(null)
      navigate('/login')
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="profile-main">
        <div className="profile-container">
          {/* Profile Header */}
          <div className="profile-header-card">
            <div className="profile-avatar-lg">
              {(profileForm.avatar || user?.avatar) ? (
                <img src={profileForm.avatar || user?.avatar} alt={user?.fullName}
                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
              ) : null}
              <span style={{ display: (profileForm.avatar || user?.avatar) ? 'none' : 'flex' }}>
                {getInitials(user?.fullName)}
              </span>
            </div>
            <div className="profile-header-info">
              <h1 className="profile-name">{user?.fullName}</h1>
              <p className="profile-email">{user?.email}</p>
              {user?.bio && <p className="profile-bio">{user?.bio}</p>}
            </div>
          </div>

          {/* Tabs */}
          <div className="profile-tabs">
            <button className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              👤 Edit Profile
            </button>
            <button className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>
              🔒 Change Password
            </button>
          </div>

          {/* Profile Form */}
          {activeTab === 'profile' && (
            <div className="profile-form-card">
              <h2 className="profile-section-title">Profile Information</h2>
              {profileMsg.text && (
                <div className={`write-alert ${profileMsg.type}`}>{profileMsg.text}</div>
              )}
              <form onSubmit={handleProfileUpdate} className="auth-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileForm.fullName}
                    onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Bio <span className="write-label-hint">(optional)</span></label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={profileForm.bio}
                    onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Tell readers about yourself..."
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Avatar URL <span className="write-label-hint">(optional)</span></label>
                  <input
                    type="url"
                    className="form-input"
                    value={profileForm.avatar}
                    onChange={e => setProfileForm({ ...profileForm, avatar: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={profileLoading}>
                  {profileLoading ? <span className="btn-spinner"></span> : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Password Form */}
          {activeTab === 'password' && (
            <div className="profile-form-card">
              <h2 className="profile-section-title">Change Password</h2>
              {passwordMsg.text && (
                <div className={`write-alert ${passwordMsg.type}`}>{passwordMsg.text}</div>
              )}
              <form onSubmit={handlePasswordChange} className="auth-form">
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordForm.oldPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Min. 6 characters"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={passwordLoading}>
                  {passwordLoading ? <span className="btn-spinner"></span> : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {/* Danger Zone */}
          <div className="danger-zone">
            <h3 className="danger-title">Session</h3>
            <button className="btn-danger" onClick={handleLogout}>🚪 Logout</button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Profile
