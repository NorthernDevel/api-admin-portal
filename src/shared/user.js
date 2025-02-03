import redis from '../config/radisClient.js'
import { UserSchema } from '../models/User.js'
import { getInstanceDatabase } from '../config/db.js'

const userById = async (id) => {
  const cachedUser = await redis.get(`user:${id}`)
  if (cachedUser) {
    return res.json({
      status: true,
      message: 'Success',
      data: JSON.parse(cachedUser),
    })
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

export { userById, updateLastLogin }
