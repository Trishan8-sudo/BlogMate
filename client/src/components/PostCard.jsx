import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { axiosInstance } from '../axiosCalls/axios'
import { useState } from 'react'

function PostCard({ post, onLikeToggle, onDelete, showActions = false }) {
  const { user } = useAuth()
  const [liking, setLiking] = useState(false)

  const isLiked = user && post.likes?.some((id) => String(id) === String(user._id))
  const isAuthor = user && String(post.author?._id) === String(user._id)

  const handleLike = async (e) => {
    e.preventDefault()
    if (!user || liking) return
    try {
      setLiking(true)
      const res = await axiosInstance.post(`/posts/${post._id}/like`)
      if (onLikeToggle) onLikeToggle(post._id, res.data.likes, res.data.liked)
    } catch (err) {
      console.error('Like failed', err)
    } finally {
      setLiking(false)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <article className="post-card">
      {post.coverImage && (
        <div className="post-card-image">
          <img src={post.coverImage} alt={post.title} />
        </div>
      )}

      <div className="post-card-body">
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="tag">{tag}</span>
            ))}
          </div>
        )}

        {/* Title */}
        <Link to={`/posts/${post._id}`} className="post-card-title-link">
          <h2 className="post-card-title">{post.title}</h2>
        </Link>

        {/* Excerpt */}
        <p className="post-card-excerpt">{post.excerpt || post.content?.substring(0, 140) + '...'}</p>

        {/* Footer */}
        <div className="post-card-footer">
          <div className="post-card-author">
            <div className="author-avatar-sm">
              {post.author?.avatar ? (
                <img src={post.author.avatar} alt={post.author.fullName} />
              ) : (
                <span>{getInitials(post.author?.fullName)}</span>
              )}
            </div>
            <div>
              <p className="author-name">{post.author?.fullName}</p>
              <p className="post-meta">
                {formatDate(post.createdAt)} · {post.readTime} min read
              </p>
            </div>
          </div>

          <div className="post-card-actions">
            {/* Like button */}
            {post.published && (
              <button
                className={`like-btn ${isLiked ? 'liked' : ''}`}
                onClick={handleLike}
                disabled={liking}
                title={isLiked ? 'Unlike' : 'Like'}
              >
                <span className="like-icon">{isLiked ? '❤️' : '🤍'}</span>
                <span>{post.likes?.length || 0}</span>
              </button>
            )}

            {/* Comment count */}
            <span className="comment-count">
              💬 {post.comments?.length || 0}
            </span>

            {/* Draft badge */}
            {!post.published && (
              <span className="draft-badge">Draft</span>
            )}

            {/* Author actions */}
            {showActions && isAuthor && (
              <>
                <Link to={`/edit/${post._id}`} className="action-btn edit-btn" title="Edit">
                  ✏️
                </Link>
                <button
                  className="action-btn delete-btn"
                  onClick={() => onDelete && onDelete(post._id)}
                  title="Delete"
                >
                  🗑️
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

export default PostCard
