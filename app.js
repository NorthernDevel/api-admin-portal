require('dotenv').config()
require('express-async-errors')
const express = require('express')
const app = express()
const path = require('path')
const cookieParser = require('cookie-parser')

app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())
app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/api/auth', require('./src/routes/authRoutes'))
app.use('/api/user', require('./src/routes/userRoutes'))
app.use('/api/prefix', require('./src/routes/prefixRoutes'))

const port = process.env.PORT
app.listen(port, () => console.log(`Server running on port ${port}`))
