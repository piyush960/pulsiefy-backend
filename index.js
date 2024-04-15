const express = require('express')
require('dotenv').config()
const app = express()
const pool = require('./db')
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/authRoutes')
const appRoutes = require('./routes/appRoutes')
const { checkUser } = require('./middleware/authMiddleware')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

const PORT = process.env.PORT || 8001;

app.get('*', checkUser)

app.use('/auth', authRoutes)
app.use('/api', appRoutes)


app.listen(PORT, () => console.log(`server listening on port ${PORT}`))
