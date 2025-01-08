const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types
const { PrefixSchema } = require('../models/Prefix')
const { getInstanceDatabase, closeAllConnections } = require('../config/db')

/**
 * @desc Get all prefixs
 * @route GET /prefix
 * @access Private
 */
const getAllPrefixes = async (req, res) => {
  try {
    const connection = await getInstanceDatabase(req)
    const PrefixModel = connection.model('Prefix', PrefixSchema)
    const prefixesData = await PrefixModel.find().exec()

    if (!prefixesData.length) {
      return res.status(400).json({
        success: false,
        message: 'No users found',
        data: [],
      })
    }
    return res.status(200).json({
      success: true,
      data: prefixesData,
    })
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: e.message,
    })
  }
}

/**
 * @desc Create prefix
 * @route POST /prefix
 * @access Private
 */
const createNewPrefix = async (req, res) => {
  try {
    // สร้าง ObjectId ใหม่
    const objectId = new ObjectId()
    const dbName = objectId.toString()

    // เชื่อมต่อไปยัง Database ที่กำหนด
    const connection = await getInstanceDatabase({
      headers: { siteid: dbName },
    })

    // NOTE: Create and store new prefix
    const PrefixModel = connection.model('Prefix', PrefixSchema)
    const prefixData = await PrefixModel.create(req.body)

    if (!prefixData) {
      res.status(400).json({
        success: false,
        message: 'Invalid prefix data recived',
      })
    }
    res.status(201).json({
      success: true,
      message: `New prefix ${prefixData.prefix} created`,
      data: prefixData,
    })
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: e.message,
    })
  }
}

module.exports = {
  getAllPrefixes,
  createNewPrefix,
}
