import mongoose from 'mongoose'
import { subSchema } from '../utils/helper.js'

const { Schema } = mongoose
const option = { versionKey: false }

const SettingSchema = new Schema(
  {
    prefix: { type: Schema.Types.ObjectId, ref: 'Prefix' },
    info: subSchema({
      language: subSchema({
        en: { type: Boolean, default: true },
        th: { type: Boolean, default: true },
      }),
      title: subSchema({
        en: { type: String },
        th: { type: String },
      }),
      description: subSchema({
        en: { type: String },
        th: { type: String },
      }),
    }),
    contacts: subSchema(
      {
        provider: {
          type: String,
          enum: ['LINE', 'TELEGRAM', 'FACEBOOK'],
          default: 'LINE',
        },
        display: subSchema({
          en: { type: String, default: 'Contact' },
          th: { type: String, default: 'ติดต่อเรา' },
        }),
        options: subSchema({
          link: { type: String, default: 'https://' },
          lineId: { type: String },
        }),
      },
      true
    ),
    assets: subSchema({
      logo: { type: String },
      logoHeader: { type: String },
      favicon: { type: String },
      socialShare: { type: String },
    }),
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
    theme: { type: String, default: 'BLUE_THEME' },
    announcement: subSchema({
      display: subSchema({
        en: { type: String },
        th: { type: String },
      }),
      isActive: { type: Boolean, default: true },
    }),
    appMedia: subSchema({
      appIcon: { type: String },
      linkDownload: { type: String },
      isActive: { type: Boolean, default: false },
    }),
    banners: subSchema(
      {
        image: { type: String },
        seq: { type: Number },
        createdAt: { type: Date, default: Date.now },
      },
      true
    ),
    promotions: subSchema(
      {
        image: { type: String },
        seq: { type: Number },
        createdAt: { type: Date, default: Date.now },
      },
      true
    ),
    popups: subSchema(
      {
        image: { type: String },
        route: { type: String },
        isInternal: { type: Boolean, default: true },
        isLogin: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
      },
      true
    ),
    imageUrl: subSchema({
      appIcon: { type: String },
      banner: { type: String },
      icon: { type: String },
      logo: { type: String },
      popup: { type: String },
      promotion: { type: String },
    }),
    url: { type: String },
    createAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date, default: Date.now() },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  option
)

const Setting = mongoose.model('Setting', SettingSchema)

export { Setting, SettingSchema }
