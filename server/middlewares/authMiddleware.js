import jwt from 'jsonwebtoken'
import { UserModel } from '../models/user.model.js'

const extractToken = (req) => {
  if (req.cookies && req.cookies.token) {
    return req.cookies.token
  }
  if (req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1]
  }
  return null
}

// custom middleware for cookie/header comparison with jwt_secret and login authorization
const isAuthenticated = async (req, res, next) => {
  try {
    const token = extractToken(req)

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized Access. User must be logged in',
      })
    }

    const secret = process.env.jwt_secret || process.env.JWT_SECRET
    const decoded = jwt.verify(token, secret)
    const userId = decoded.userId
    const user = await UserModel.findById(userId)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      })
    }

    req.user = user
    next() // allows us to come out of the middleware and use our controller
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized Access. User must be logged in',
    })
  }
}

export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req)
    if (token) {
      const secret = process.env.jwt_secret || process.env.JWT_SECRET
      const decoded = jwt.verify(token, secret)
      const user = await UserModel.findById(decoded.userId)
      if (user) {
        req.user = user
      }
    }
  } catch (err) {
    // Continue without req.user
  }
  next()
}

export default isAuthenticated
