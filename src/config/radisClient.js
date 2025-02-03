import Redis from 'ioredis'

// สร้างการเชื่อมต่อ Redis
const redis = new Redis({
  host: '127.0.0.1', // หรือข้อมูลเซิร์ฟเวอร์ Redis ของคุณ
  port: 6379,
  // อาจเพิ่มค่าอื่นๆ เช่น password หรือ db index
})

redis.on('connect', () => {
  console.log('Connected to Redis')
})

redis.on('error', (err) => {
  console.error('Redis error:', err)
})

export default redis
