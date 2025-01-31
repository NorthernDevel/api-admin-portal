const cron = require('node-cron')
const mongoose = require('mongoose')

const connections = {}

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
  const mongoURI = `${process.env.DATABASE_URI}/${dbName}?retryWrites=true&w=majority&appName=AdminPortal&authSource=admin`

  // ใช้ connection ที่มีอยู่แล้ว
  if (connections[dbName] && connections[dbName].readyState === 1) {
    return connections[dbName]
  }

  // ถ้าไม่มี connection ให้สร้างใหม่และเก็บไว้ในตัวแปร connections
  const newConnection = await mongoose
    .createConnection(mongoURI, {
      maxPoolSize: 50, // ใช้ connection pool เพื่อลดการสร้าง connection ใหม่บ่อย ๆ
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000, // ถ้าเลือก server ไม่ได้ใน 5 วินาที, ให้ timeout
      socketTimeoutMS: 45000, // ปิด connection ถ้าไม่มีการใช้งานเกิน 45 วินาที
    })
    .asPromise()

  connections[dbName] = newConnection

  newConnection.on('error', (err) => {
    console.error(`❌ MongoDB (${dbName}) Connection Error:`, err)
  })

  return newConnection
}

const getConnectionStatus = async (req) => {
  try {
    const dbName = (req && req.headers && req.headers.siteid) || 'administrator'
    const mongoURI = `${process.env.DATABASE_URI}/${dbName}?retryWrites=true&w=majority&appName=AdminPortal&authSource=admin`

    await mongoose.connect(mongoURI)
    console.log('MongoDB connected')

    // ตรวจสอบว่า db เชื่อมต่อสำเร็จหรือยัง
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB connection is not ready')
    }

    const adminDb = mongoose.connection.db.admin()
    const status = await adminDb.command({ serverStatus: 1 })

    return {
      current: status.connections.current, // จำนวน connections ที่ใช้งานอยู่
      available: status.connections.available, // จำนวน connections ที่เหลือ
      totalCreated: status.connections.totalCreated, // จำนวน connections ที่ถูกสร้างขึ้นทั้งหมด
    }
  } catch (error) {
    console.error('Error fetching server status:', error)
    return null
  }
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
  getConnectionStatus,
}
