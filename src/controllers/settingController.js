import redis from '../config/radisClient.js'
import mongoose from 'mongoose'
import { getInstanceDatabase } from '../config/db.js'
import { SettingSchema } from '../models/Setting.js'
import { pipnelineJoinPrefix, createSettings } from '../shared/setting.js'
import { getFormData } from '../utils/helper.js'
import { uploadImage, deleteImage } from '../utils/file-manager.js'

const { ObjectId } = mongoose.Types

/**
 * @desc Create setting manual
 * @route POST /setting
 * @access Private
 */
const createNewSettings = async (req, res) => {
  try {
    const settingData = await createSettings(req, '')

    if (!settingData) {
      return res.status(400).json({
        status: false,
        message: 'No setting found',
      })
    }

    return res.json({
      status: true,
      message: 'Success',
      data: settingData,
    })
  } catch (e) {
    return res.status(400).json({
      status: false,
      message: e,
    })
  }
}

/**
 * @desc Get setting
 * @route GET /setting
 * @access Private
 */
const getSettings = async (req, res) => {
  try {
    const dbName = req.headers.siteid
    const cachedSetting = await redis.get(`setting:${dbName}`)
    if (cachedSetting) {
      return res.json({
        status: true,
        message: 'Success',
        data: JSON.parse(cachedSetting),
      })
    }
    const connection = await getInstanceDatabase(req)
    const SettingModel = connection.model('Setting', SettingSchema)
    const settingFound = await SettingModel.aggregate(pipnelineJoinPrefix)

    if (!settingFound.length) {
      return res.status(400).json({
        status: false,
        message: 'No setting found',
      })
    }

    const settingData = settingFound[0]

    if (settingData) {
      await redis.set(
        `setting:${dbName}`,
        JSON.stringify(settingData),
        'EX',
        60 * 60 * 24
      ) // Cache 1 เดือน.
    }

    return res.json({
      status: true,
      message: 'Success',
      data: settingData,
    })
  } catch (e) {
    return res.status(400).json({
      status: false,
      message: e,
    })
  }
}

/**
 * @desc Get Update setting info
 * @route PATCH /setting/info/:id
 * @access Private
 */
const updateInfo = async (req, res) => {
  try {
    const { id } = req.params
    const connection = await getInstanceDatabase(req)
    const SettingModel = connection.model('Setting', SettingSchema)
    const settingData = await SettingModel.findByIdAndUpdate(
      id,
      {
        $set: { info: req.body },
      },
      { new: true }
    )

    if (!settingData) {
      return res.status(400).json({
        status: false,
        message: 'Setting update failure',
      })
    }

    // NOTE: Clear cacheSetting by dbName.
    const dbName = req.headers.siteid
    redis.del(`setting:${dbName}`)

    return res.json({
      status: true,
      message: 'Success',
      data: settingData,
    })
  } catch (e) {
    return res.status(500).json({
      status: false,
      message: e.message,
    })
  }
}

/**
 * @desc Get Update setting register type
 * @route PATCH /setting/register/:id
 * @access Private
 */
const updateRegisterType = async (req, res) => {
  try {
    const { id } = req.params
    const { registerType } = req.body

    const connection = await getInstanceDatabase(req)
    const SettingModel = connection.model('Setting', SettingSchema)
    const settingData = await SettingModel.findByIdAndUpdate(
      id,
      {
        $set: { registerType },
      },
      { new: true }
    )

    if (!settingData) {
      return res.status(400).json({
        status: false,
        message: 'Setting update failure',
      })
    }

    // NOTE: Clear cacheSetting by dbName.
    const dbName = req.headers.siteid
    redis.del(`setting:${dbName}`)

    return res.json({
      status: true,
      message: 'Success',
      data: settingData,
    })
  } catch (e) {
    return res.status(500).json({
      status: false,
      message: e.message,
    })
  }
}

const updateBanners = async (req, res) => {
  try {
    const { id } = req.params
    const dbName = req.headers.siteid
    const { fields, files } = await getFormData(req)

    const banners = JSON.parse(fields.banners[0]) // 🔹 banners ที่ส่งมาจาก frontend
    const uploadedFiles = files.images || [] // 🔹 รูปที่อัปโหลดมาใหม่
    let newImages = []
    // 📌 ดึง `banners` เดิมจาก DB
    const connection = await getInstanceDatabase(req)
    const SettingModel = connection.model('Setting', SettingSchema)
    const settingFound = await SettingModel.aggregate(pipnelineJoinPrefix)
    if (!settingFound.length) {
      return res.status(400).json({
        status: false,
        message: 'No setting found',
      })
    }

    const oldBanners = settingFound[0].banners || []

    // 📌 สร้าง `Map` ของ banners เก่า (ใช้ image เป็น key)
    const oldBannersMap = new Map(oldBanners.map((b) => [b.image, b]))

    // 📌 อัปโหลดรูปใหม่
    for (const file of uploadedFiles) {
      const { newImageName } = await uploadImage(file, dbName, 'banners')
      newImages.push(newImageName)
    }

    // 📌 ตรวจสอบว่ารูปที่ส่งมาใหม่ เป็นรูปเก่าหรือรูปใหม่
    let imgIndex = 0
    banners.forEach((banner) => {
      if (!oldBannersMap.has(banner.image)) {
        // 🔹 ถ้า `image` ไม่อยู่ใน `oldBannersMap` แปลว่าเป็นรูปใหม่ → ใช้ชื่อใหม่
        banner.image = newImages[imgIndex]
        imgIndex++
      }
    })

    // 📌 หาไฟล์ที่ถูกลบออก
    const newImageNames = new Set(banners.map((b) => b.image))
    const deletedImages = oldBanners
      .map((b) => b.image)
      .filter((oldImg) => !newImageNames.has(oldImg))
    
    // 📌 ลบไฟล์ที่ไม่ได้ใช้งาน
    for (const img of deletedImages) {
      await deleteImage(img, dbName, 'banners')
    }

    // 📌 บันทึก banners ลง MongoDB
    const settingData = await SettingModel.findByIdAndUpdate(
      id,
      {
        $set: { banners },
      },
      { new: true, upsert: true }
    )

    if (!settingData) {
      return res.status(400).json({
        status: false,
        message: 'Setting update failure',
      })
    }

    // NOTE: Clear cacheSetting by dbName.
    redis.del(`setting:${dbName}`)

    return res.json({
      status: true,
      message: 'Success',
      data: settingData,
    })
  } catch (e) {
    return res.status(500).json({
      status: false,
      message: e.message,
    })
  }
}

export default {
  getSettings,
  createNewSettings,
  updateInfo,
  updateRegisterType,
  updateBanners,
}
