const mongoose = require('mongoose')
const Schema = mongoose.Schema
const option = { versionKey: false }

const BannerSchema = new Schema(
  {
    image: {
      type: String,
    },
    seq: { type: Number, require: true },
    createdAt: { type: Date, default: Date.now() },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  option
)

const Banner = mongoose.model('Banner', BannerSchema)

module.exports = { Banner, BannerSchema }
