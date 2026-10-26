import express from 'express'
import {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  updateProfile,
  changePassword,
  getUserById,
} from '../controllers/user.controller.js'
import isAuthenticated from '../middlewares/authMiddleware.js'

const userRoutes = express.Router()

userRoutes.post('/register', registerUser)
userRoutes.post('/login', loginUser)
userRoutes.get('/me', isAuthenticated, getMe)
userRoutes.post('/logout', isAuthenticated, logoutUser)
userRoutes.patch('/update-profile', isAuthenticated, updateProfile)
userRoutes.patch('/change-password', isAuthenticated, changePassword)
userRoutes.get('/:id', getUserById)

export default userRoutes
