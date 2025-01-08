const mongoose = require('mongoose')
const Schema = mongoose.Schema
const option = { versionKey: false }
const bcrypt = require('bcrypt')

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
    role: { type: String, enum: ['USER', 'ADMIN', 'MANAGER'], default: 'USER' },
    siteIds: { type: Array, default: [] },
    profilePicture: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  option
)

UserSchema.pre('save', function (next) {
  const user = this

  if (!user.isModified('password')) next()

  const hash = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10))
  user.password = hash
  next()
})

const User = mongoose.model('User', UserSchema)

module.exports = { User, UserSchema }
