const { getInstanceDatabase } = require('../config/db')
const { PrefixSchema } = require('../models/Prefix')

const createNewPrefixInAdministrator = async (req, objectId) => {
  const connection = await getInstanceDatabase()

  // NOTE: Create and store new prefix
  const PrefixModel = connection.model('Prefix', PrefixSchema)
  await PrefixModel.create({
    ...req.body,
    _id: objectId,
  })
}

module.exports = { createNewPrefixInAdministrator }
