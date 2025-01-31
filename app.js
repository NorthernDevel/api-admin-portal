require('dotenv').config()
require('express-async-errors')
const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./src/config/corsOptions')

const app = express()
const path = require('path')

app.use(cors(corsOptions))

app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())
app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/api/connection', require('./src/routes/connectionRoutes'))
app.use('/api/auth', require('./src/routes/authRoutes'))
app.use('/api/user', require('./src/routes/userRoutes'))
app.use('/api/prefix', require('./src/routes/prefixRoutes'))
app.use('/api/setting', require('./src/routes/settingRoutes'))
app.use('/api/portal', require('./src/routes/portalRoutes'))

const port = process.env.PORT
app.listen(port, () => console.log(`Server running on port ${port}`))
