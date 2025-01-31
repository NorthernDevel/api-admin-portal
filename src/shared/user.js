const redis = require('../config/radisClient')
const { UserSchema } = require('../models/User')
const { getInstanceDatabase } = require('../config/db')

const userById = async (id) => {
  const cachedUser = await redis.get(`user:${id}`)
  if (cachedUser) {
    return JSON.parse(cachedUser)
  }

  const connection = await getInstanceDatabase()
  const UserModel = connection.model('User', UserSchema)
  const userData = await UserModel.findById(id)
    .select('-password -lastLogin')
    .lean()
    .exec()

  if (userData) {
    await redis.set(`user:${id}`, JSON.stringify(userData), 'EX', 60 * 60 * 24) // Cache 1 วัน.
  }
  return userData
}

const updateLastLogin = async (id) => {
  const connection = await getInstanceDatabase()
  const UserModel = connection.model('User', UserSchema)

  const userData = await UserModel.findByIdAndUpdate(
    id,
    { $set: { lastLogin: Date.now() } },
    {
      new: true,
    }
  )

  return userData
}

module.exports = {
  userById,
  updateLastLogin,
}
