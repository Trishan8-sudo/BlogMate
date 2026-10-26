import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios'
import PostCard from '../components/PostCard'
import Navbar from '../components/Navbar'

function MyPosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | published | drafts
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const res = await axiosInstance.get('/posts/user/my-posts')
        setPosts(res.data.posts || [])
      } catch (err) {
        console.error('Failed to fetch my posts', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMyPosts()
  }, [])

  const handleDelete = async (postId) => {
    try {
      await axiosInstance.delete(`/posts/${postId}`)
      setPosts(prev => prev.filter(p => p._id !== postId))
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Delete failed', err)
    }
  }

  const filteredPosts = posts.filter(p => {
    if (filter === 'published') return p.published
    if (filter === 'drafts') return !p.published
    return true
  })

  const publishedCount = posts.filter(p => p.published).length
  const draftCount = posts.filter(p => !p.published).length
  const totalLikes = posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0)
  const totalComments = posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0)

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="my-posts-main">
        <div className="my-posts-container">
          {/* Header */}
          <div className="my-posts-header">
            <div>
              <h1 className="my-posts-title">📝 My Posts</h1>
              <p className="my-posts-subtitle">Manage your writing — published and drafts</p>
            </div>
            <Link to="/write" className="btn-primary">
              ✍️ Write New Post
            </Link>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{posts.length}</div>
              <div className="stat-label">Total Posts</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{publishedCount}</div>
              <div className="stat-label">Published</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{draftCount}</div>
              <div className="stat-label">Drafts</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{totalLikes}</div>
              <div className="stat-label">❤️ Total Likes</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{totalComments}</div>
              <div className="stat-label">💬 Total Comments</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            {['all', 'published', 'drafts'].map(f => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? `All (${posts.length})` : f === 'published' ? `Published (${publishedCount})` : `Drafts (${draftCount})`}
              </button>
            ))}
          </div>

          {/* Posts */}
          {loading ? (
            <div className="posts-loading">
              {[1,2,3].map(i => (
                <div key={i} className="post-card-skeleton">
                  <div className="skeleton-body">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-text"></div>
                    <div className="skeleton-footer"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{filter === 'drafts' ? '📝' : '🚀'}</div>
              <h3 className="empty-title">
                {filter === 'drafts' ? 'No drafts yet' : filter === 'published' ? 'No published posts yet' : 'No posts yet'}
              </h3>
              <p className="empty-desc">Start writing your first post!</p>
              <Link to="/write" className="btn-primary" style={{ marginTop: '1rem' }}>✍️ Write Now</Link>
            </div>
          ) : (
            <div className="posts-grid">
              {filteredPosts.map(post => (
                <PostCard
                  key={post._id}
                  post={post}
                  showActions={true}
                  onDelete={(postId) => setDeleteConfirm(postId)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">🗑️</div>
            <h3 className="modal-title">Delete Post?</h3>
            <p className="modal-desc">This action cannot be undone. The post will be permanently deleted.</p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyPosts
