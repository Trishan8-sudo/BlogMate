import mongoose from 'mongoose'
import { PostModel } from '../models/post.model.js'

// Create a new post (saved as draft by default)
const createPost = async (req, res) => {
  try {
    const { title, content, excerpt, tags, coverImage, published } = req.body

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' })
    }

    const newPost = await PostModel.create({
      title,
      content,
      excerpt,
      tags: tags || [],
      coverImage: coverImage || '',
      author: req.user._id,
      published: published || false,
    })

    await newPost.populate('author', 'fullName email avatar bio')

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: newPost,
    })
  } catch (err) {
    return res.status(500).json({ error: err, message: 'Server Crashed' })
  }
}

// Get all published posts (public feed)
const getAllPublishedPosts = async (req, res) => {
  try {
    const { tag, search, page = 1, limit = 10 } = req.query
    const skip = (page - 1) * limit

    let query = { published: true }

    if (tag) {
      query.tags = { $in: [tag] }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ]
    }

    const posts = await PostModel.find(query)
      .populate('author', 'fullName avatar bio')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    const total = await PostModel.countDocuments(query)

    return res.status(200).json({
      success: true,
      posts,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    return res.status(500).json({ error: err, message: 'Server Crashed' })
  }
}

// Get a single post by ID
const getPostById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const post = await PostModel.findById(req.params.id)
      .populate('author', 'fullName avatar bio email')
      .populate('comments.author', 'fullName avatar')

    if (!post) return res.status(404).json({ message: 'Post not found' })

    // Allow author to see their unpublished posts
    if (!post.published) {
      // If no user is authenticated or user is not the author, deny
      if (!req.user || String(post.author?._id || post.author) !== String(req.user._id)) {
        return res.status(403).json({ message: 'This post is not published yet' })
      }
    }

    return res.status(200).json({ success: true, post })
  } catch (err) {
    return res.status(500).json({ error: err, message: 'Server Crashed' })
  }
}

// Get posts by logged-in user (my posts — includes drafts)
const getMyPosts = async (req, res) => {
  try {
    const posts = await PostModel.find({ author: req.user._id })
      .populate('author', 'fullName avatar bio')
      .sort({ createdAt: -1 })

    return res.status(200).json({ success: true, posts })
  } catch (err) {
    return res.status(500).json({ error: err, message: 'Server Crashed' })
  }
}

// Update a post
const updatePost = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const post = await PostModel.findById(req.params.id)

    if (!post) return res.status(404).json({ message: 'Post not found' })

    if (String(post.author) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized: You can only edit your own posts' })
    }

    const { title, content, excerpt, tags, coverImage, published } = req.body

    if (title !== undefined) post.title = title
    if (content !== undefined) post.content = content
    if (excerpt !== undefined) post.excerpt = excerpt
    if (tags !== undefined) post.tags = tags
    if (coverImage !== undefined) post.coverImage = coverImage
    if (published !== undefined) post.published = published

    await post.save()
    await post.populate('author', 'fullName avatar bio')

    return res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post,
    })
  } catch (err) {
    return res.status(500).json({ error: err, message: 'Server Crashed' })
  }
}

// Delete a post
const deletePost = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const post = await PostModel.findById(req.params.id)

    if (!post) return res.status(404).json({ message: 'Post not found' })

    if (String(post.author) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized: You can only delete your own posts' })
    }

    await PostModel.findByIdAndDelete(req.params.id)

    return res.status(200).json({ success: true, message: 'Post deleted successfully' })
  } catch (err) {
    return res.status(500).json({ error: err, message: 'Server Crashed' })
  }
}

// Toggle like on a post
const toggleLike = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id)

    if (!post) return res.status(404).json({ message: 'Post not found' })
    if (!post.published) return res.status(403).json({ message: 'Cannot like an unpublished post' })

    const userId = req.user._id
    const alreadyLiked = post.likes.some((id) => String(id) === String(userId))

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => String(id) !== String(userId))
    } else {
      post.likes.push(userId)
    }

    await post.save()

    return res.status(200).json({
      success: true,
      message: alreadyLiked ? 'Post unliked' : 'Post liked',
      likes: post.likes.length,
      liked: !alreadyLiked,
    })
  } catch (err) {
    return res.status(500).json({ error: err, message: 'Server Crashed' })
  }
}

// Add a comment to a post
const addComment = async (req, res) => {
  try {
    const { content } = req.body

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Comment content is required' })
    }

    const post = await PostModel.findById(req.params.id)

    if (!post) return res.status(404).json({ message: 'Post not found' })
    if (!post.published) return res.status(403).json({ message: 'Cannot comment on an unpublished post' })

    const newComment = {
      author: req.user._id,
      content: content.trim(),
    }

    post.comments.push(newComment)
    await post.save()
    await post.populate('comments.author', 'fullName avatar')

    const addedComment = post.comments[post.comments.length - 1]

    return res.status(201).json({
      success: true,
      message: 'Comment added',
      comment: addedComment,
    })
  } catch (err) {
    return res.status(500).json({ error: err, message: 'Server Crashed' })
  }
}

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params
    const post = await PostModel.findById(postId)

    if (!post) return res.status(404).json({ message: 'Post not found' })

    const comment = post.comments.id(commentId)
    if (!comment) return res.status(404).json({ message: 'Comment not found' })

    if (String(comment.author) !== String(req.user._id) && String(post.author) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized to delete this comment' })
    }

    post.comments.pull({ _id: commentId })
    await post.save()

    return res.status(200).json({ success: true, message: 'Comment deleted' })
  } catch (err) {
    return res.status(500).json({ error: err, message: 'Server Crashed' })
  }
}

export {
  createPost,
  getAllPublishedPosts,
  getPostById,
  getMyPosts,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
}
