import { UserModel } from '../models/user.model.js'
import bcrypt from 'bcrypt'
import genToken from '../utils/generateToken.js'
import validator from 'validator'

const isProduction = process.env.NODE_ENV === 'production'
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
}

// register controller
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Bad Request', message: 'All Fields Required' })
    }

    if (!validator.isEmail(email)) return res.status(400).json({ message: 'Invalid email id' })

    if (password.length < 6) {
      return res.status(400).json({ error: 'Bad Request', message: 'Password must be at least 6 characters' })
    }

    const emailExists = await UserModel.findOne({ email })

    if (emailExists) {
      return res.status(409).json({ error: 'Conflict', message: 'Email already registered' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = await UserModel.create({
      fullName,
      email,
      password: hashedPassword,
    })

    const { _id } = newUser
    const userData = { _id, fullName, email, bio: newUser.bio, avatar: newUser.avatar }
    const token = genToken(_id)
    res.cookie('token', token, cookieOptions)

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userData,
      authenticatedUser: userData,
    })
  } catch (err) {
    return res.status(500).json({ error: err, message: 'Server Crashed' })
  }
}

// login controller
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) return res.status(400).json({ message: 'All fields required' })

    const user = await UserModel.findOne({ email })

    if (!user) return res.status(404).json({ message: 'User not found' })

    const passwordMatched = await bcrypt.compare(password, user.password)
    if (!passwordMatched) return res.status(401).json({ message: 'Incorrect password' })

    const token = genToken(user._id)
    res.cookie('token', token, cookieOptions)

    const userData = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userData,
      authenticatedUser: userData,
    })
  } catch (err) {
    return res.status(500).json({ error: err, message: 'Server Crashed' })
  }
}

// get current user
const getMe = (req, res) => {
  const { _id, fullName, email, bio, avatar } = req.user
  const userData = { _id, fullName, email, bio, avatar }
  res.status(200).json({
    ...userData,
    user: userData,
    authenticatedUser: userData,
  })
}

// logout controller
const logoutUser = (req, res) => {
  res.clearCookie('token', cookieOptions)
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  })
}

// update profile
const updateProfile = async (req, res) => {
  try {
    const { fullName, bio, avatar } = req.body
    const user = req.user

    if (fullName) user.fullName = fullName
    if (bio !== undefined) user.bio = bio
    if (avatar !== undefined) user.avatar = avatar

    await user.save()

    const userData = { _id: user._id, fullName: user.fullName, email: user.email, bio: user.bio, avatar: user.avatar }
    return res.status(200).json({
      success: true,
      message: 'Profile updated',
      user: userData,
      authenticatedUser: userData,
    })
  } catch (err) {
    return res.status(500).json({ error: err, message: 'Server Crashed' })
  }
}

// change password
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields required' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Bad Request', message: 'Password too short' })
    }

    const user = req.user
    const passwordMatched = await bcrypt.compare(oldPassword, user.password)
    if (!passwordMatched) {
      return res.status(401).json({ message: 'Old password did not match' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    const dbUser = await UserModel.findById(user._id)
    dbUser.password = hashedPassword
    await dbUser.save()

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    })
  } catch (err) {
    return res.status(500).json({ error: err, message: 'Server Crashed' })
  }
}

// get user by ID (public profile)
const getUserById = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.status(200).json({ user })
  } catch (err) {
    return res.status(500).json({ error: err, message: 'Server Crashed' })
  }
}

export {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  updateProfile,
  changePassword,
  getUserById,
}
