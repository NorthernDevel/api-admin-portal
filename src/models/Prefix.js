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
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
  },
  option
)

const Prefix = mongoose.model('Prefix', PrefixSchema)

module.exports = { Prefix, PrefixSchema }