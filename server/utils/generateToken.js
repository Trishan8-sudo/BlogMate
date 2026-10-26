import jwt from 'jsonwebtoken'

const genToken = (userId) => {
    const secret = process.env.JWT_SECRET || process.env.jwt_secret
    return jwt.sign({ userId },
        secret,
        { expiresIn: '10d' }
    )
}

export default genToken
