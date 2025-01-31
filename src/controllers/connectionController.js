const { getConnectionStatus, closeAllConnections } = require('../config/db')

/**
 * @desc Get status
 * @route GET /status
 * @access Private
 */
const getStatus = async (req, res) => {
  try {
    const connectionStatus = await getConnectionStatus(req)
    return res.json({
      status: true,
      message: 'Success',
      data: connectionStatus,
    })
  } catch (error) {
    console.error('Error fetching MongoDB connection status:', error)
    res.status(500).json({ error: 'Failed to fetch MongoDB connection status' })
  }
}

const closeAll = async (req, res) => {
  try {
    await closeAllConnections()
    return res.json({
      status: true,
      message: 'Success',
    })
  } catch (error) {
    console.error('Error', error)
    res.status(500).json({ error: 'Failed to close all MongoDB connections' })
  }
}

module.exports = {
  getStatus,
  closeAll,
}
