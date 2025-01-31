const redis = require('../config/radisClient')
const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types
const { getInstanceDatabase } = require('../config/db')
const { SettingSchema } = require('../models/Setting')
const { pipnelineJoinPrefix, createSettings } = require('../shared/setting')

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
      return JSON.parse(cachedSetting)
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
    await SettingModel.findByIdAndUpdate(id, { $set: { info: req.body } })

    const settingFound = await SettingModel.aggregate([
      {
        $match: { _id: new ObjectId(id) },
      },
      ...pipnelineJoinPrefix,
    ])

    if (!settingFound) {
      return res.status(400).json({
        status: false,
        message: 'No setting found',
      })
    }
    
    const settingData = settingFound

    // NOTE: Clear cacheSetting by dbName.
    const dbName = req.headers.siteid
    redis.del(`setting:${dbName}`)

    return res.json({
      status: true,
      message: 'Success',
      data: settingData,
    })
  } catch (e) {
    return res.status(400).json({
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
    await SettingModel.findByIdAndUpdate(id, {
      $set: { registerType },
    })

    const settingFound = await SettingModel.aggregate([
      {
        $match: { _id: new ObjectId(id) },
      },
      ...pipnelineJoinPrefix,
    ])

    if (!settingFound) {
      return res.status(400).json({
        status: false,
        message: 'No setting found',
      })
    }

    const settingData = settingFound

    // NOTE: Clear cacheSetting by dbName.
    const dbName = req.headers.siteid
    redis.del(`setting:${dbName}`)

    return res.json({
      status: true,
      message: 'Success',
      data: settingData,
    })
  } catch (e) {
    return res.status(400).json({
      status: false,
      message: e.message,
    })
  }
}

module.exports = {
  getSettings,
  createNewSettings,
  updateInfo,
  updateRegisterType,
}
