const cron = require('node-cron')
const mongoose = require('mongoose')

// NOTE: ปิด mongoose.connections ทุกๆ เที่ยงคืน
cron.schedule('0 0 * * *', async () => {
  closeAllConnections()
})

/**
 * @role Connection database.
 * @desc Create connection or reuse connection ready state.
 * @params req, null
 */
const getInstanceDatabase = async (req) => {
  const dbName = (req && req.headers && req.headers.siteid) || 'administrator'
  const mongoURI = `${process.env.DATABASE_URI}/${dbName}?retryWrites=true&w=majority&appName=AdminPortal`
  // ตรวจสอบว่า connection ถูกสร้างแล้วหรือยัง
  const existingConnection = mongoose.connections.find(
    (conn) => conn.name === dbName
  )
  
  if (existingConnection && existingConnection.readyState === 1) {
    // รียูส connection ที่สร้างแล้ว
    return existingConnection
  }

  // สร้าง connection ใหม่
  const newConnection = await mongoose.createConnection(mongoURI).asPromise()
  return newConnection
}

/**
 * @role Close all connections.
 * @desc close all mongoose.connections.
 * @params req, null
 */
const closeAllConnections = async () => {
  try {
    // วนลูปปิดทุก connection ใน mongoose.connections
    for (const connection of mongoose.connections) {
      if (connection.readyState === 1) {
        // ตรวจสอบว่า connection อยู่ในสถานะ connected
        await connection.close()
        console.log(`Closed connection for database: ${connection.name}`)
      }
    }
    console.log('All connections closed successfully.')
  } catch (err) {
    console.error('Error closing connections:', err)
  }
}

module.exports = {
  getInstanceDatabase,
  closeAllConnections,
}
