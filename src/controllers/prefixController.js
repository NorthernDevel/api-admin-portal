import mongoose from 'mongoose'
import { getInstanceDatabase } from '../config/db.js'
import { createPrefixDirectory } from '../utils/file-manager.js'
import { PrefixSchema } from '../models/Prefix.js'
import { createNewPrefixInAdministrator } from '../shared/prefix.js'
import { createSettings } from '../shared/setting.js'

const { ObjectId } = mongoose.Types

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
    const prefixData = await PrefixModel.create({
      ...req.body,
      _id: objectId,
    })

    // NOTE: For Administrator.
    await createNewPrefixInAdministrator(req, objectId)

    // NOTE: New Site Settings.
    await createSettings(req, objectId)

    // NOTE: Create base directories.
    await createPrefixDirectory(dbName)

    if (!prefixData) {
      res.status(400).json({
        status: false,
        message: 'Invalid prefix data recived',
      })
    }

    res.status(201).json({
      status: true,
      message: `New prefix ${prefixData.prefix} created`,
      data: prefixData,
    })
  } catch (e) {
    return res.status(500).json({
      status: false,
      message: e.message,
    })
  }
}

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
        status: false,
        message: 'No users found',
        data: [],
      })
    }
    return res.status(200).json({
      status: true,
      message: 'Success',
      data: prefixesData,
    })
  } catch (e) {
    return res.status(500).json({
      status: false,
      message: e.message,
    })
  }
}

/**
 * @desc Get prefix by id
 * @route GET /prefix/:id
 * @access Private
 */
const getPrefixById = async (req, res) => {
  try {
    const { id } = req.params
    const connection = await getInstanceDatabase(req)
    const PrefixModel = connection.model('Prefix', PrefixSchema)
    const prefixData = await PrefixModel.findById(id)
      .select('-password')
      .lean()
      .exec()

    if (!prefixData) {
      return res.status(400).json({
        status: false,
        message: 'No prefix found.',
      })
    }

    return res.status(200).json({
      status: true,
      message: 'Success',
      data: prefixData,
    })
  } catch (e) {
    return res.status(500).json({
      status: false,
      message: e.message,
    })
  }
}

export default {
  createNewPrefix,
  getAllPrefixes,
  getPrefixById,
}
