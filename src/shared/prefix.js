import { getInstanceDatabase } from '../config/db.js'
import { PrefixSchema } from '../models/Prefix.js'

const createNewPrefixInAdministrator = async (req, objectId) => {
  const connection = await getInstanceDatabase()

  // NOTE: Create and store new prefix
  const PrefixModel = connection.model('Prefix', PrefixSchema)
  await PrefixModel.create({
    ...req.body,
    _id: objectId,
  })
}

export { createNewPrefixInAdministrator }
