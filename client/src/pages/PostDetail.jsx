import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { axiosInstance } from '../axiosCalls/axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

function PostDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [comment, setComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [deletingComment, setDeletingComment] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingPost, setDeletingPost] = useState(false)

  const handleDeletePost = async () => {
    try {
      setDeletingPost(true)
      await axiosInstance.delete(`/posts/${id}`)
      navigate('/my-posts')
    } catch (err) {
      console.error('Delete post failed', err)
      setDeletingPost(false)
      setShowDeleteModal(false)
    }
  }

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axiosInstance.get(`/posts/${id}`)
        const p = res.data.post
        setPost(p)
        setLikeCount(p.likes?.length || 0)
        setLiked(user && p.likes?.some(l => String(l) === String(user._id)))
      } catch (err) {
        console.error('Failed to fetch post', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [id, user])

  const handleLike = async () => {
    if (!user) return
    try {
      const res = await axiosInstance.post(`/posts/${id}/like`)
      setLiked(res.data.liked)
      setLikeCount(res.data.likes)
    } catch (err) {
      console.error('Like failed', err)
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setSubmittingComment(true)
    try {
      const res = await axiosInstance.post(`/posts/${id}/comments`, { content: comment })
      setPost(prev => ({
        ...prev,
        comments: [...(prev.comments || []), res.data.comment]
      }))
      setComment('')
    } catch (err) {
      console.error('Comment failed', err)
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    setDeletingComment(commentId)
    try {
      await axiosInstance.delete(`/posts/${id}/comments/${commentId}`)
      setPost(prev => ({
        ...prev,
        comments: prev.comments.filter(c => c._id !== commentId)
      }))
    } catch (err) {
      console.error('Delete comment failed', err)
    } finally {
      setDeletingComment(null)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    })
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const isAuthor = user && post && String(post.author?._id) === String(user._id)

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="post-detail-loading">
          <div className="skeleton-detail-header"></div>
          <div className="skeleton-detail-body"></div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="not-found">
          <h2>Post not found 😔</h2>
          <Link to="/home" className="btn-primary">Back to Feed</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="post-detail-main">
        <div className="post-detail-container">
          {/* Back button */}
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>

          <article className="post-detail-article">
            {/* Cover Image */}
            {post.coverImage && (
              <div className="post-detail-cover">
                <img src={post.coverImage} alt={post.title} />
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="post-tags">
                {post.tags.map((tag, i) => <span key={i} className="tag">{tag}</span>)}
              </div>
            )}

            {/* Title */}
            <h1 className="post-detail-title">{post.title}</h1>

            {!post.published && (
              <div className="draft-notice">📝 This post is saved as a Draft</div>
            )}

            {/* Author + Meta */}
            <div className="post-detail-meta">
              <div className="post-detail-author">
                <div className="author-avatar-md">
                  {post.author?.avatar ? (
                    <img src={post.author.avatar} alt={post.author.fullName} />
                  ) : (
                    <span>{getInitials(post.author?.fullName)}</span>
                  )}
                </div>
                <div>
                  <p className="author-name-lg">{post.author?.fullName}</p>
                  <p className="post-meta-detail">
                    {formatDate(post.createdAt)} · {post.readTime} min read
                  </p>
                </div>
              </div>

              {/* Action buttons for author */}
              {isAuthor && (
                <div className="author-actions">
                  <Link to={`/edit/${post._id}`} className="btn-outline-sm">✏️ Edit</Link>
                  <button
                    type="button"
                    className="btn-danger-sm"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>

            <div className="post-detail-divider" />

            {/* Markdown Content */}
            <div className="post-detail-content markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Like Section */}
            {post.published && (
              <div className="post-reactions">
                <button
                  className={`like-btn-lg ${liked ? 'liked' : ''}`}
                  onClick={handleLike}
                >
                  <span>{liked ? '❤️' : '🤍'}</span>
                  <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
                </button>
                <span className="comment-count-lg">💬 {post.comments?.length || 0} comments</span>
              </div>
            )}
          </article>

          {/* Comments Section */}
          {post.published && (
            <section className="comments-section">
              <h3 className="comments-title">
                Comments <span className="comments-badge">{post.comments?.length || 0}</span>
              </h3>

              {/* Comment form */}
              {user ? (
                <form className="comment-form" onSubmit={handleCommentSubmit}>
                  <div className="comment-input-wrapper">
                    <div className="comment-avatar">
                      <span>{getInitials(user.fullName)}</span>
                    </div>
                    <textarea
                      className="comment-textarea"
                      placeholder="Share your thoughts..."
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="comment-form-footer">
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={submittingComment || !comment.trim()}
                    >
                      {submittingComment ? '⏳ Posting...' : '💬 Post Comment'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="comment-login-prompt">
                  <Link to="/login" className="auth-link">Sign in</Link> to leave a comment
                </div>
              )}

              {/* Comment List */}
              <div className="comments-list">
                {post.comments?.length === 0 ? (
                  <div className="no-comments">
                    <span>🌱</span>
                    <p>Be the first to comment!</p>
                  </div>
                ) : (
                  [...(post.comments || [])].reverse().map((c) => (
                    <div key={c._id} className="comment-item">
                      <div className="comment-avatar">
                        {c.author?.avatar ? (
                          <img src={c.author.avatar} alt={c.author.fullName} />
                        ) : (
                          <span>{getInitials(c.author?.fullName)}</span>
                        )}
                      </div>
                      <div className="comment-body">
                        <div className="comment-header">
                          <span className="comment-author">{c.author?.fullName || 'Unknown'}</span>
                          <span className="comment-date">
                            {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          {(user && (String(c.author?._id) === String(user._id) || isAuthor)) && (
                            <button
                              className="comment-delete-btn"
                              onClick={() => handleDeleteComment(c._id)}
                              disabled={deletingComment === c._id}
                            >
                              {deletingComment === c._id ? '...' : '🗑️'}
                            </button>
                          )}
                        </div>
                        <p className="comment-text">{c.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">🗑️</div>
            <h3 className="modal-title">Delete Post?</h3>
            <p className="modal-desc">Are you sure you want to delete "{post?.title}"? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingPost}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleDeletePost}
                disabled={deletingPost}
              >
                {deletingPost ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PostDetail
