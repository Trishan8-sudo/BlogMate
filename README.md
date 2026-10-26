# ✍️ BlogMate — Personal Blog Platform

> A full-stack MERN personal blogging platform built with modern dark aesthetics, glassmorphism UI, interactive Markdown authoring, comments, likes, and secure JWT authentication.

---

## 🌟 Features

- **Authentication & Security**:
  - JWT authentication using HTTP-only cookies (identical architecture to ShopKart).
  - Bcrypt password hashing.
  - Protected routes on client & server with auto-login session persistence.
- **Post Management**:
  - Rich Markdown editor (`@uiw/react-md-editor`) with real-time preview and syntax highlighting.
  - Full CRUD operations: Write, Edit, Preview, and Delete posts.
  - Draft vs. Published status support (drafts only visible to the author).
  - Auto-generated excerpt and reading time calculation.
  - Tags and optional cover image URL with instant preview.
- **Engagement**:
  - Like / Unlike toggle with real-time like count.
  - Comment system: post comments, author/commenter deletion permissions.
- **Discovery**:
  - Search posts by title, excerpt, or tags.
  - Filter posts by tag chips with active selection.
  - Paginated post feed.
- **User Profile**:
  - Manage profile (name, bio, avatar URL).
  - Change password securely.
  - "My Posts" tab showcasing all published posts and drafts.
- **Design & UI**:
  - Handcrafted dark-mode glassmorphic theme with glowing accents (`#7c5cfc`), smooth micro-interactions, responsive navigation, and mobile menu.

---

## 🏗️ Folder Structure

Mirrors the `ShopKart` architecture:

```
BlogMate/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── axiosCalls/
│   │   │   └── axios.js          # Pre-configured Axios instance with withCredentials
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation bar with user dropdown & mobile menu
│   │   │   ├── PostCard.jsx      # Post card component with like & read time
│   │   │   ├── ProtectedRoute.jsx# Auth guard for private routes
│   │   │   └── PublicRoute.jsx   # Auth guard for guest-only routes
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state provider
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Public feed with search & tag filtering
│   │   │   ├── Login.jsx         # User login page
│   │   │   ├── Register.jsx      # User registration page
│   │   │   ├── PostDetail.jsx    # Full post view with markdown render & comments
│   │   │   ├── WritePost.jsx     # Markdown post editor (create / edit)
│   │   │   ├── MyPosts.jsx       # User's drafts and published articles
│   │   │   └── Profile.jsx       # Profile settings & password change
│   │   ├── App.css               # Complete responsive dark-mode styling
│   │   ├── App.jsx               # Route configuration
│   │   ├── index.css             # Base reset
│   │   └── main.jsx              # React DOM entry point
│   ├── .env                      # Client environment variables (VITE_API_URL)
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── server/
    ├── controllers/
    │   ├── post.controller.js    # Post CRUD, likes, comments
    │   └── user.controller.js    # Register, login, me, profile, change-password
    ├── middlewares/
    │   └── authMiddleware.js     # JWT cookie verification & optionalAuth
    ├── models/
    │   ├── post.model.js         # Post schema with embedded comments & pre-save hook
    │   └── user.model.js         # User schema
    ├── routes/
    │   ├── post.route.js         # /posts routes
    │   └── user.route.js         # /users routes
    ├── utils/
    │   └── generateToken.js      # JWT signing utility
    ├── .env                      # Server environment (dbUri, jwt_secret, PORT)
    ├── index.js                  # Express app entry point & MongoDB connection
    └── package.json
```

---

## 🚀 Getting Started

### 1. Server Setup

```bash
cd "BlogMate/server"
npm install
npm run dev
```

The server runs at: `http://localhost:8068`

### 2. Client Setup

```bash
cd "BlogMate/client"
npm install
npm run dev
```

The client will start at: `http://localhost:5173`

---

## 📡 API Reference

### User Endpoints (`/users`)
- `POST /users/register` - Create new user account
- `POST /users/login` - Authenticate and receive HTTP-only cookie
- `GET  /users/me` - Get currently logged-in user profile (protected)
- `POST /users/logout` - Clear auth cookie
- `PUT  /users/profile` - Update name, bio, avatar (protected)
- `PUT  /users/change-password` - Change account password (protected)
- `GET  /users/:id` - Get public profile of a user

### Post Endpoints (`/posts`)
- `GET    /posts` - List all published posts (supports `?search=`, `?tag=`, `?page=`, `?limit=`)
- `GET    /posts/user/my-posts` - List all posts by the logged-in user (protected)
- `GET    /posts/:id` - Get single post by ID (public for published, author-only for drafts)
- `POST   /posts` - Create post / draft (protected)
- `PUT    /posts/:id` - Update post (protected, author only)
- `DELETE /posts/:id` - Delete post (protected, author only)
- `POST   /posts/:id/like` - Toggle like on post (protected)
- `POST   /posts/:id/comments` - Add comment to post (protected)
- `DELETE /posts/:postId/comments/:commentId` - Delete comment (protected, author/commenter only)
