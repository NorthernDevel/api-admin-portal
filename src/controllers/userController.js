const redis = require('../config/radisClient')
const bcrypt = require('bcrypt')
const { User, UserSchema } = require('../models/User')
const { getInstanceDatabase } = require('../config/db')
const { userById } = require('../shared/user')

/**
 * @desc Create users
 * @route POST /user
 * @access Private
 */
const createNewUser = async (req, res) => {
  try {
    // NOTE: Create and stroe new user
    const connection = await getInstanceDatabase()
    const UserModel = connection.model('User', UserSchema)
    const userData = await UserModel.create(req.body)

    if (userData) {
      res.status(201).json({
        status: true,
        message: `New user ${userData.username} created.`,
        data: userData,
      })
    } else {
      res.status(400).json({
        status: false,
        message: 'Invalid user data recived.',
      })
    }
  } catch (e) {
    return res.status(400).json({
      status: false,
      message: e.message,
    })
  }
}

/**
 * @desc Get all users
 * @route GET /user
 * @access Private
 */
const getAllUsers = async (req, res) => {
  try {
    const connection = await getInstanceDatabase()
    const UserModel = connection.model('User', UserSchema)
    const findUser = UserModel.find()
    const usersData = await findUser.select('-password').lean()

    if (!usersData.length) {
      return res.status(400).json({
        status: false,
        message: 'No users found.',
        data: [],
      })
    }
    return res.status(200).json({
      status: true,
      message: 'Success',
      data: usersData,
    })
  } catch (e) {
    return res.status(400).json({
      status: false,
      message: e.message,
    })
  }
}

/**
 * @desc Get user by id
 * @route GET /user/:id
 * @access Private
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params
    const userData = await userById(id)

    if (!userData) {
      return res.status(400).json({
        status: false,
        message: 'No user found.',
      })
    }
    return res.status(200).json({
      status: true,
      message: 'Success',
      data: userData,
    })
  } catch (e) {
    return res.status(400).json({
      status: false,
      message: e.message,
    })
  }
}

/**
 * @desc Get Update user (not update password)
 * @route PATCH /user/:id
 * @access Private
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const connection = await getInstanceDatabase()
    const UserModel = connection.model('User', UserSchema)
    const { username, name, role, siteIds } = req.body
    const userData = await UserModel.findByIdAndUpdate(
      id,
      { $set: { username, name, role, siteIds } },
      {
        new: true,
      }
    )

    if (!userData) {
      res.status(400).json({
        status: false,
        message: 'User not found.',
      })
    }

    // NOTE: Clear cacheUser by id & username.
    redis.del(`user:${id}`)
    redis.del(`user:${username}`)

    res.status(200).json({
      status: true,
      message: `${userData.username} updated`,
      data: userData,
    })
  } catch (e) {
    res.status(400).json({
      status: false,
      message: e.message,
    })
  }
}

/**
 * @desc Get Update user password
 * @route PATCH /user/change-password/:id
 * @access Private
 */
const changeUserPassword = async (req, res) => {
  try {
    const { id } = req.params
    const connection = await getInstanceDatabase()
    const UserModel = connection.model('User', UserSchema)

    const { currentPassword, password } = req.body
    const foundUser = await UserModel.findById(id).exec()

    if (!foundUser || !foundUser.isActive) {
      return res.status(400).json({
        status: false,
        message: 'User not found.',
      })
    }

    const match = await bcrypt.compare(currentPassword, foundUser.password)

    if (!match)
      return res
        .status(401)
        .json({ status: false, message: 'Current password is not match.' })

    if (password) {
      foundUser.password = bcrypt.hashSync(password, 10)
    }

    const userData = await foundUser.save()

    if (!userData) {
      res.status(400).json({
        status: false,
        message: 'Change password failure.',
      })
    }

    // NOTE: Clear cacheUser by id & username.
    redis.del(`user:${id}`)
    redis.del(`user:${userData.username}`)

    res.status(200).json({
      status: true,
      message: `${userData.username} password updated.`,
    })
  } catch (e) {
    res.status(400).json({
      status: false,
      message: e.message,
    })
  }
}

/**
 * @desc Get Delete a user
 * @route DELETE /user
 * @access Private
 */
const deleteUser = async (req, res) => {
  const { id } = req.body

  if (!id) {
    return res.status(400).json({
      status: false,
      message: 'User ID Required',
    })
  }

  const user = await User.findById(id).exec()

  if (!user) {
    return res.status(400).json({
      status: false,
      message: 'User not found',
    })
  }

  const result = await user.deleteOne()

  const reply = `Username ${result.username} with ID ${result._id}`

  res.status(200).json({
    status: true,
    message: reply,
  })
}

module.exports = {
  getAllUsers,
  getUserById,
  createNewUser,
  updateUser,
  changeUserPassword,
  deleteUser,
}
