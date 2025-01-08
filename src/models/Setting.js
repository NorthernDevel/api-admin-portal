const mongoose = require('mongoose')
const Schema = mongoose.Schema
const option = { versionKey: false }

const SettingSchema = new Schema(
  {
    prefix_id: { type: Schema.Types.ObjectId, ref: 'Prefix' },
    registerType: {
      type: String,
      enum: [
        'OTP_PHONE_SHORT',
        'OTP_REQUIRE_BANK',
        'CAPTCHA_NO_PHONE',
        'CAPTCHA_REQUIRE_BANK',
      ],
      default: 'OTP_PHONE_SHORT',
    },
    contacts: {
      type: [
        {
          provider: {
            type: String,
            enum: ['LINE', 'TELEGRAM', 'FACEBOOK'],
            default: 'LINE',
          },
          display: {
            type: {
              en: { type: String, default: 'Contact' },
              th: { type: String, default: 'ติดต่อเรา' },
            },
          },
          options: {
            type: {
              link: { type: String, default: 'https://' },
              lineId: { type: String },
              isActive: { type: Boolean, default: true },
            },
          },
        },
      ],
    },
    footer: {
      type: {
        title: {
          type: {
            en: { type: String },
            th: { type: String },
          },
        },
        description: {
          type: {
            en: { type: String },
            th: { type: String },
          },
        },
        tags: {
          type: Array,
          default: [
            'slot',
            'slot online',
            'game slot',
            'สล็อต',
            'สล็อตออนไลน์',
            'เกมสล็อต',
            'ยิงปลา',
            'เกมยิงปลา',
          ],
        },
      },
    },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  option
)

module.exports = mongoose.model('Setting', SettingSchema)
