const { getInstanceDatabase } = require('../config/db')
const { SettingSchema } = require('../models/Setting')
const { settingDefaultData } = require('../data/setting')

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

module.exports = { pipnelineJoinPrefix, createSettings }
