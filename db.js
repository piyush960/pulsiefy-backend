const Pool = require('pg').Pool
require('dotenv').config()

const pool = new Pool({
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    ssl: {
        require: true,
        rejectUnauthorized: false
    }
})

module.exports = pool;