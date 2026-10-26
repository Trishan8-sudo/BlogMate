import { useState, useEffect } from 'react'
import { axiosInstance } from '../axiosCalls/axios'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/PostCard'
import Navbar from '../components/Navbar'

function Home() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [allTags, setAllTags] = useState([])
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params = { page, limit: 9 }
      if (search) params.search = search
      if (selectedTag) params.tag = selectedTag

      const res = await axiosInstance.get('/posts', { params })
      setPosts(res.data.posts || [])
      setTotalPages(res.data.totalPages || 1)

      // Collect unique tags from this batch
      const tags = new Set()
      res.data.posts?.forEach(p => p.tags?.forEach(t => tags.add(t)))
      setAllTags(prev => [...new Set([...prev, ...tags])])
    } catch (err) {
      console.error('Failed to fetch posts', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [page, search, selectedTag])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleLikeToggle = (postId, newCount, liked) => {
    setPosts(prev => prev.map(p =>
      p._id === postId
        ? {
            ...p,
            likes: liked
              ? [...(p.likes || []), user._id]
              : (p.likes || []).filter(id => String(id) !== String(user._id))
          }
        : p
    ))
  }

  const handleTagSelect = (tag) => {
    setSelectedTag(selectedTag === tag ? '' : tag)
    setPage(1)
  }

  const handleDeletePost = async (postId) => {
    try {
      await axiosInstance.delete(`/posts/${postId}`)
      setPosts(prev => prev.filter(p => p._id !== postId))
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Delete failed', err)
    }
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="home-main">
        {/* Hero Banner */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">✨ Welcome back, {user?.fullName?.split(' ')[0]}!</div>
            <h1 className="hero-title">Discover <span className="gradient-text">Amazing</span> Stories</h1>
            <p className="hero-subtitle">Explore the latest posts from writers around the world</p>

            {/* Search Bar */}
            <form className="search-bar" onSubmit={handleSearch}>
              <input
                type="text"
                className="search-input"
                placeholder="Search posts, topics, tags..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit" className="search-btn">
                🔍
              </button>
            </form>
          </div>
        </section>

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <section className="tags-section">
            <div className="tags-container">
              <span className="tags-label">Explore by tag:</span>
              <div className="tags-scroll">
                <button
                  className={`tag-filter ${selectedTag === '' ? 'active' : ''}`}
                  onClick={() => handleTagSelect('')}
                >
                  All
                </button>
                {allTags.slice(0, 12).map((tag, i) => (
                  <button
                    key={i}
                    className={`tag-filter ${selectedTag === tag ? 'active' : ''}`}
                    onClick={() => handleTagSelect(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Posts Grid */}
        <section className="posts-section">
          <div className="posts-container">
            {(search || selectedTag) && (
              <div className="search-results-info">
                {search && <span>Results for "<strong>{search}</strong>"</span>}
                {selectedTag && <span> in <strong>#{selectedTag}</strong></span>}
                <button className="clear-filter" onClick={() => { setSearch(''); setSearchInput(''); setSelectedTag(''); setPage(1) }}>
                  ✕ Clear
                </button>
              </div>
            )}

            {loading ? (
              <div className="posts-loading">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="post-card-skeleton">
                    <div className="skeleton-img"></div>
                    <div className="skeleton-body">
                      <div className="skeleton-tag"></div>
                      <div className="skeleton-title"></div>
                      <div className="skeleton-text"></div>
                      <div className="skeleton-footer"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3 className="empty-title">No posts found</h3>
                <p className="empty-desc">
                  {search || selectedTag ? 'Try a different search or clear filters.' : 'Be the first to write something amazing!'}
                </p>
              </div>
            ) : (
              <div className="posts-grid">
                {posts.map(post => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onLikeToggle={handleLikeToggle}
                    showActions={true}
                    onDelete={(postId) => setDeleteConfirm(postId)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  ← Previous
                </button>
                <div className="page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      className={`page-num ${page === p ? 'active' : ''}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  className="page-btn"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </section>
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
              <button className="btn-danger" onClick={() => handleDeletePost(deleteConfirm)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
