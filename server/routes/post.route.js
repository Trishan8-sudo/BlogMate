import express from 'express'
import {
  createPost,
  getAllPublishedPosts,
  getPostById,
  getMyPosts,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
} from '../controllers/post.controller.js'
import isAuthenticated, { optionalAuth } from '../middlewares/authMiddleware.js'

const postRoutes = express.Router()

// User posts (must be before /:id to prevent route shadowing)
postRoutes.get('/user/my-posts', isAuthenticated, getMyPosts)

// Public post feed and single post view
postRoutes.get('/', getAllPublishedPosts)
postRoutes.get('/:id', optionalAuth, getPostById)

// Protected post actions
postRoutes.post('/', isAuthenticated, createPost)
postRoutes.put('/:id', isAuthenticated, updatePost)
postRoutes.delete('/:id', isAuthenticated, deletePost)
postRoutes.post('/:id/like', isAuthenticated, toggleLike)
postRoutes.post('/:id/comments', isAuthenticated, addComment)
postRoutes.delete('/:postId/comments/:commentId', isAuthenticated, deleteComment)

export default postRoutes
