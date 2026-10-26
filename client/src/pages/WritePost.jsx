import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MDEditor from '@uiw/react-md-editor'
import { axiosInstance } from '../axiosCalls/axios'
import Navbar from '../components/Navbar'

function WritePost() {
  const { id } = useParams() // if id exists, we are editing
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [form, setForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    coverImage: '',
    published: false,
  })
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(isEditing)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('write') // write | preview
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await axiosInstance.delete(`/posts/${id}`)
      navigate('/my-posts')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete post')
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  useEffect(() => {
    if (isEditing) {
      const fetchPost = async () => {
        try {
          const res = await axiosInstance.get(`/posts/${id}`)
          const p = res.data.post
          setForm({
            title: p.title || '',
            content: p.content || '',
            excerpt: p.excerpt || '',
            tags: p.tags?.join(', ') || '',
            coverImage: p.coverImage || '',
            published: p.published || false,
          })
        } catch (err) {
          setError('Failed to load post')
        } finally {
          setFetchLoading(false)
        }
      }
      fetchPost()
    }
  }, [id])

  const handleSubmit = async (e, publishOverride = null) => {
    if (e) e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.title.trim() || !form.content.trim()) {
      return setError('Title and content are required')
    }

    setLoading(true)
    try {
      const isPublished = publishOverride !== null ? publishOverride : form.published
      const tagsArray = typeof form.tags === 'string'
        ? form.tags.split(',').map(t => t.trim()).filter(Boolean)
        : (Array.isArray(form.tags) ? form.tags : [])

      const payload = {
        title: form.title,
        content: form.content,
        excerpt: form.excerpt,
        tags: tagsArray,
        coverImage: form.coverImage,
        published: isPublished,
      }

      let res
      if (isEditing) {
        res = await axiosInstance.put(`/posts/${id}`, payload)
        setSuccess(isPublished ? 'Post updated successfully!' : 'Draft updated successfully!')
      } else {
        res = await axiosInstance.post('/posts', payload)
        setSuccess(isPublished ? 'Post published successfully!' : 'Draft saved successfully!')
      }

      setTimeout(() => {
        navigate(`/posts/${res.data.post._id}`)
      }, 800)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save post')
    } finally {
      setLoading(false)
    }
  }

  const wordCount = form.content.trim().split(/\s+/).filter(Boolean).length
  const readTime = Math.ceil(wordCount / 200) || 1

  if (fetchLoading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="write-loading">
          <div className="loading-spinner"></div>
          <p>Loading post...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="write-main">
        <div className="write-container">
          {/* Header */}
          <div className="write-header">
            <div>
              <h1 className="write-title">{isEditing ? '✏️ Edit Post' : '✍️ Write a New Post'}</h1>
              <div className="write-stats">
                <span>{wordCount} words</span>
                <span>·</span>
                <span>{readTime} min read</span>
              </div>
            </div>
            <div className="write-header-actions">
              {isEditing && (
                <button
                  type="button"
                  className="btn-danger-sm"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={loading || deleting}
                >
                  🗑️ Delete
                </button>
              )}
              <button
                type="button"
                className="btn-ghost"
                onClick={() => handleSubmit(null, false)}
                disabled={loading || deleting}
              >
                💾 Save Draft
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleSubmit(null, true)}
                disabled={loading || deleting}
              >
                {loading ? <span className="btn-spinner"></span> : (form.published ? '🚀 Update' : '🚀 Publish')}
              </button>
            </div>
          </div>

          {error && <div className="write-alert error">{error}</div>}
          {success && <div className="write-alert success">✅ {success}</div>}

          <div className="write-form">
            {/* Title */}
            <input
              type="text"
              className="write-title-input"
              placeholder="Your post title..."
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />

            {/* Metadata row */}
            <div className="write-meta-row">
              <div className="write-meta-field">
                <label className="write-label">Tags <span className="write-label-hint">(comma separated)</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="javascript, react, tutorial"
                  value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                />
              </div>
              <div className="write-meta-field">
                <label className="write-label">Cover Image URL <span className="write-label-hint">(optional)</span></label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://example.com/image.jpg"
                  value={form.coverImage}
                  onChange={e => setForm({ ...form, coverImage: e.target.value })}
                />
              </div>
            </div>

            <div className="write-meta-field">
              <label className="write-label">Excerpt <span className="write-label-hint">(short description, auto-generated if empty)</span></label>
              <input
                type="text"
                className="form-input"
                placeholder="A brief summary of your post..."
                value={form.excerpt}
                onChange={e => setForm({ ...form, excerpt: e.target.value })}
              />
            </div>

            {/* Cover Image Preview */}
            {form.coverImage && (
              <div className="cover-image-preview">
                <img src={form.coverImage} alt="Cover preview" onError={e => e.target.style.display = 'none'} />
              </div>
            )}

            {/* Markdown Editor */}
            <div className="write-editor-section">
              <label className="write-label">Content <span className="write-label-hint">(Markdown supported)</span></label>
              <div data-color-mode="dark">
                <MDEditor
                  value={form.content}
                  onChange={val => setForm({ ...form, content: val || '' })}
                  height={500}
                  preview="live"
                  style={{ borderRadius: '12px', overflow: 'hidden' }}
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="write-footer">
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => navigate(-1)}
                  disabled={loading || deleting}
                >
                  Cancel
                </button>
                {isEditing && (
                  <button
                    type="button"
                    className="btn-danger-sm"
                    onClick={() => setShowDeleteModal(true)}
                    disabled={loading || deleting}
                  >
                    🗑️ Delete Post
                  </button>
                )}
              </div>
              <div className="write-footer-right">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => handleSubmit(null, false)}
                  disabled={loading || deleting}
                >
                  💾 Save Draft
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleSubmit(null, true)}
                  disabled={loading || deleting}
                >
                  {loading ? <span className="btn-spinner"></span> : (form.published ? '🚀 Update' : '🚀 Publish')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">🗑️</div>
            <h3 className="modal-title">Delete Post?</h3>
            <p className="modal-desc">Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WritePost
