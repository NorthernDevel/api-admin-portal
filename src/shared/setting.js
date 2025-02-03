import { getInstanceDatabase } from '../config/db.js'
import { SettingSchema } from '../models/Setting.js'
import { settingDefaultData } from '../data/setting.js'

const createSettings = async (req, objectId) => {
  const dbName = objectId.toString()

  const connection = await getInstanceDatabase({
    headers: { siteid: dbName },
  })

  const body = settingDefaultData(req, objectId)

  // NOTE: Create and store new setting
  const SettingModel = connection.model('Setting', SettingSchema)
  const settingData = await SettingModel.create(body)

  return settingData
}

const pipnelineJoinPrefix = [
  {
    $lookup: {
      from: 'prefixes',
      localField: 'prefix',
      foreignField: '_id',
      as: 'prefix',
    },
  },
  {
    $unwind: {
      path: '$prefix', // Deconstruct the "prefix" array
      preserveNullAndEmptyArrays: true, // Keep documents with no match
    },
  },
  {
    $limit: 1, // Limit to 1 result, effectively doing a "findOne"
  },
]

export { pipnelineJoinPrefix, createSettings }
