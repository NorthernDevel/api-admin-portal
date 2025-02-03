import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const { Schema } = mongoose
const option = { versionKey: false }

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
    role: { type: String, enum: ['USER', 'ADMIN', 'MANAGER'], default: 'USER' },
    siteIds: { type: Array, default: [] },
    createdAt: { type: Date, default: Date.now() },
    createdBy: {
      type: {
        _id: { type: Schema.Types.ObjectId },
        username: { type: String },
        name: { type: String },
        role: {
          type: String,
          enum: ['USER', 'ADMIN', 'MANAGER'],
        },
      },
      required: true,
    },
    updatedAt: { type: Date, default: Date.now() },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: true },
    lastLogin: { type: Date, default: Date.now() },
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

export { User, UserSchema }
