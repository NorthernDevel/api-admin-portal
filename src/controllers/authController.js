const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { UserSchema } = require('../models/User')
const { getInstanceDatabase } = require('../config/db')

/**
 * @desc Login
 * @route POST /auth
 * @access Public
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body
    const connection = await getInstanceDatabase()
    const UserModel = connection.model('User', UserSchema)
    const foundUser = await UserModel.findOne({ username }).exec()

    if (!foundUser || !foundUser.isActive) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const match = await bcrypt.compare(password, foundUser.password)

    if (!match)
      return res.status(401).json({ success: false, message: 'Unauthorized' })

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
      { expiresIn: '1d' }
    )

    // Create secure cookie with refresh token
    res.cookie('jwt', refreshToken, {
      httpOnly: true, //accessible only by web server
      secure: true, //https
      sameSite: 'None', //cross-site cookie
      maxAge: 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
    })

    // Send accessToken containing username and roles
    res.json({ success: true, accessToken, user: foundUser })
  } catch (e) {
    return res.status(400).json({
      success: false,
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
  const cookies = req.cookies

  if (!cookies?.jwt)
    return res.status(401).json({ success: false, message: 'Unauthorized' })

  const refreshToken = cookies.jwt

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err)
        return res.status(403).json({ success: false, message: 'Forbidden' })

      const connection = await getInstanceDatabase()
      const UserModel = connection.model('User', UserSchema)
      const foundUser = await UserModel.findOne({
        username: decoded.username,
      })
        .select('-password')
        .lean()
        .exec()

      if (!foundUser)
        return res.status(401).json({ success: false, message: 'Unauthorized' })

      const accessToken = jwt.sign(
        {
          userInfo: {
            username: foundUser.username,
            name: foundUser.name,
            role: foundUser.role,
            siteIds: foundUser.siteIds,
            isActive: foundUser.isActive,
            isVerified: foundUser.isVerified,
            createdAt: foundUser.createdAt,
            updatedAt: foundUser.updatedAt,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
      )

      res.json({ success: true, accessToken, user: foundUser })
    }
  )
}

/**
 * @desc Logout
 * @route POST /auth/logout
 * @access Public - just to clear cookie if exists
 */
const logout = (req, res) => {
  // const cookies = req.cookies
  // if (!cookies?.jwt) return res.sendStatus(204) //No content
  // res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
  res.json({ success: true, message: 'Cookie cleared' })
}

module.exports = {
  login,
  refresh,
  logout,
}
