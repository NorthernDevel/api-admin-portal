import redis from '../config/radisClient.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { UserSchema } from '../models/User.js'
import { getInstanceDatabase } from '../config/db.js'
import { updateLastLogin } from '../shared/user.js'

/**
 * @desc Login
 * @route POST /auth
 * @access Public
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body
    let foundUser = {}

    const cachedUser = await redis.get(`user:${username}`)
    if (cachedUser) {
      foundUser = JSON.parse(cachedUser)
    } else {
      const connection = await getInstanceDatabase()
      const UserModel = connection.model('User', UserSchema)
      foundUser = await UserModel.findOne({ username }).exec()
      await redis.set(
        `user:${username}`,
        JSON.stringify(foundUser),
        'EX',
        60 * 60 * 24 * 30 * 3
      ) // Cache 3 เดือน.
    }

    if (!foundUser || !foundUser.isActive) {
      return res
        .status(200)
        .json({ status: false, message: 'Username or password invalid' })
    }

    const match = await bcrypt.compare(password, foundUser.password)

    if (!match)
      return res
        .status(200)
        .json({ status: false, message: 'Username or password invalid' })

    // NOTE: Update last login.
    await updateLastLogin(foundUser._id)

    const userData = {
      username: foundUser.username,
      name: foundUser.name,
      role: foundUser.role,
      siteIds: foundUser.siteIds,
      isActive: foundUser.isActive,
      isVerified: foundUser.isVerified,
      createdAt: foundUser.createdAt,
      updatedAt: foundUser.updatedAt,
    }

    const accessToken = jwt.sign(
      {
        userInfo: userData,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '4h' }
    )

    // Create secure cookie with refresh token
    res.cookie('jwt', refreshToken, {
      httpOnly: false, //accessible only by web server
      secure: true, //https
      sameSite: 'strict', //cross-site cookie
      maxAge: 4 * 60 * 60 * 1000, // 4 hours in milliseconds
    })

    res.cookie('auth_token', accessToken, {
      httpOnly: false, //accessible only by web server
      secure: true, //https
      sameSite: 'strict', //cross-site cookie
      maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
    })

    // Send accessToken containing username and roles
    res.json({
      status: true,
      message: 'Success',
    })
  } catch (e) {
    return res.status(500).json({
      status: false,
      message: e.message,
    })
  }
}

/**
 * @desc Refresh
 * @route GET /auth/refresh
 * @access Public - because access token has expired
 */
const refresh = (req, res) => {
  try {
    const cookies = req.cookies

    if (!cookies?.jwt)
      return res.status(401).json({ status: false, message: 'Unauthorized' })

    const refreshToken = cookies.jwt

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err)
          return res.status(403).json({ status: false, message: 'Forbidden' })

        const connection = await getInstanceDatabase()
        const UserModel = connection.model('User', UserSchema)
        const foundUser = await UserModel.findOne({
          username: decoded.username,
        })
          .select('-password')
          .lean()
          .exec()

        if (!foundUser)
          return res
            .status(401)
            .json({ status: false, message: 'Unauthorized' })

        const userData = {
          username: foundUser.username,
          name: foundUser.name,
          role: foundUser.role,
          siteIds: foundUser.siteIds,
          isActive: foundUser.isActive,
          isVerified: foundUser.isVerified,
          createdAt: foundUser.createdAt,
          updatedAt: foundUser.updatedAt,
        }

        const accessToken = jwt.sign(
          {
            userInfo: userData,
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: '15m' }
        )

        res.cookie('auth_token', accessToken, {
          httpOnly: false, //accessible only by web server
          secure: true, //https
          sameSite: 'strict', //cross-site cookie
          maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
        })

        res.json({
          status: true,
          message: 'Success',
          siteId: foundUser.siteIds[0],
        })
      }
    )
  } catch (e) {
    return res.status(500).json({
      status: false,
      message: e.message,
    })
  }
}

/**
 * @desc Logout
 * @route GET /auth/logout
 * @access Public - just to clear cookie if exists
 */
const logout = (req, res) => {
  try {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204) //No content
    res.clearCookie('jwt', {
      httpOnly: false,
      secure: true,
      sameSite: 'strict',
    })
    res.json({ status: true, message: 'Cookie cleared' })
  } catch (e) {
    return res.status(500).json({
      status: false,
      message: e.message,
    })
  }
}

export default { login, refresh, logout }
