const {Pool} = require('pg')
const dotenv = require('dotenv')
dotenv.config()

// const pool = new Pool({
//     user: process.env.user,
//     host: process.env.host,
//     database: process.env.database,
//     password: process.env.password,
//     port: process.env.port 
// })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Supabase uses a valid cert, but this disables strict checking
  },
});



module.exports = pool;