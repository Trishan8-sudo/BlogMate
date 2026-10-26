import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import userRoutes from './routes/user.route.js'
import postRoutes from './routes/post.route.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'

dotenv.config()

const PORT = process.env.PORT || 8068
const app = express()

// Trust reverse proxy (required for Render / Vercel HTTPS cookies and headers)
app.set('trust proxy', 1)

app.use(express.json())
app.use(cookieParser()) // needed for parsing cookie into json objects

// setting up cors middleware to accept request from client
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true)

      // allow localhost / local network
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true)
      }

      // allow explicitly configured frontend URLs if set
      if (allowedOrigins.length > 0 && allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      // fallback to allow client requests while supporting credentials
      return callback(null, true)
    },
    credentials: true,
  })
)

const dbUri = process.env.dbUri || process.env.DB_URI || process.env.MONGO_URI || process.env.MONGODB_URI

if (!dbUri) {
  console.error('⚠️ WARNING: No database URI provided. Please set dbUri or MONGO_URI in your environment variables.')
} else {
  mongoose
    .connect(dbUri)
    .then(() => {
      console.log('DB connected successfully')
    })
    .catch((err) => {
      console.error('DB connection error:', err.message)
    })
}

app.use('/users', userRoutes)
app.use('/posts', postRoutes)

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() })
})

app.get('/', (req, res) => {
  res.send('Welcome to BlogMate API 📝')
})

// Listen on 0.0.0.0 for Render port routing
app.listen(PORT, '0.0.0.0', () => {
  console.log(`BlogMate server running on port ${PORT}`)
})
