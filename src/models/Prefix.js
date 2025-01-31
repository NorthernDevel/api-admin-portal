const mongoose = require('mongoose')
const Schema = mongoose.Schema
const option = { versionKey: false }

const PrefixSchema = new Schema(
  {
    prefix: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
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
    isActive: { type: Boolean, default: true },
  },
  option
)

const Prefix = mongoose.model('Prefix', PrefixSchema)

module.exports = { Prefix, PrefixSchema }
