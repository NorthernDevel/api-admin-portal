import dotenv from 'dotenv'
import 'express-async-errors'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import corsOptions from './src/config/corsOptions.js'
import path from 'path'

dotenv.config()

const app = express()

app.use(cors(corsOptions))
app.use(express.json({ limit: '50mb' }))
app.use(cookieParser())
app.use('/', express.static(path.join(import.meta.url, 'public')))

import connectionRoutes from './src/routes/connectionRoutes.js'
import authRoutes from './src/routes/authRoutes.js'
import userRoutes from './src/routes/userRoutes.js'
import prefixRoutes from './src/routes/prefixRoutes.js'
import settingRoutes from './src/routes/settingRoutes.js'
import portalRoutes from './src/routes/portalRoutes.js'

app.use('/api/connection', connectionRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/prefix', prefixRoutes)
app.use('/api/setting', settingRoutes)
app.use('/api/portal', portalRoutes)

const port = process.env.PORT
app.listen(port, () => console.log(`Server running on port ${port}`))
