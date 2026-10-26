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
app.use(express.json())
app.use(cookieParser()) // needed for parsing cookie into json objects

// setting up cors middleware to accept request from client
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true)
      }
      return callback(null, true)
    },
    credentials: true,
  })
)

mongoose
  .connect(process.env.dbUri)
  .then(() => {
    console.log('DB connected successfully')
  })
  .catch((err) => {
    console.log(err)
  })

app.use('/users', userRoutes)
app.use('/posts', postRoutes)

app.get('/', (req, res) => {
  res.send('Welcome to BlogMate API 📝')
})

app.listen(PORT, () => {
  console.log(`BlogMate server running on port ${PORT}`)
})
