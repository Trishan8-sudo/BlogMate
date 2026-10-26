import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    excerpt: {
        type: String,
        default: ''
    },
    coverImage: {
        type: String,
        default: ''
    },
    tags: [
        {
            type: String,
            trim: true
        }
    ],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    published: {
        type: Boolean,
        default: false
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    comments: [commentSchema],
    readTime: {
        type: Number,
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

// Auto-calculate read time before saving
postSchema.pre('save', function () {
    const wordsPerMinute = 200
    const wordCount = (this.content || '').split(/\s+/).filter(Boolean).length
    this.readTime = Math.ceil(wordCount / wordsPerMinute) || 1

    // Auto-generate excerpt if not provided
    if (!this.excerpt && this.content) {
        const plainText = this.content.replace(/[#*_`\[\]()>-]/g, '')
        this.excerpt = plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '')
    }

    this.updatedAt = Date.now()
})

const PostModel = mongoose.model('Post', postSchema)

export { PostModel }
