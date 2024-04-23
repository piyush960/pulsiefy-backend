const express = require('express')
require('dotenv').config()
const app = express()
const pool = require('./db')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/authRoutes')
const appRoutes = require('./routes/appRoutes')
const { checkUser } = require('./middleware/authMiddleware')

app.use(cors({credentials: true, origin: process.env.FRONTEND_ORIGIN}))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

const PORT = process.env.PORT;

app.get('*', checkUser)

app.use('/auth', authRoutes)
app.use('/api', appRoutes)

if(PORT){
    app.listen(PORT, () => console.log(`server listening on port ${PORT}`))
}
