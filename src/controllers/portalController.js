import redis from '../config/radisClient.js'
import { getInstanceDatabase } from '../config/db.js'
import { SettingSchema } from '../models/Setting.js'
import { pipnelineJoinPrefix } from '../shared/setting.js'

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

    const settingFound = await SettingModel.aggregate([
      ...pipnelineJoinPrefix,
      { $project: { prefix: 0, createAt: 0, updatedAt: 0 } },
    ])

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
        60 * 60 * 24 * 30 * 3
      ) // Cache 3 เดือน.
    }

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
}
