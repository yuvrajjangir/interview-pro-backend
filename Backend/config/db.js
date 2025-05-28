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
  // Add connection timeout
  connectionTimeoutMillis: 10000, // 10 seconds
  // Add idle timeout
  idleTimeoutMillis: 30000, // 30 seconds
  // Maximum number of clients in the pool
  max: 20,
  // Minimum number of clients in the pool
  min: 4,
});

// Add error handler for the pool
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Add connection handler
pool.on('connect', (client) => {
  console.log('New client connected to the pool');
});

// Add acquire handler
pool.on('acquire', (client) => {
  console.log('Client acquired from pool');
});

// Add remove handler
pool.on('remove', (client) => {
  console.log('Client removed from pool');
});

module.exports = pool;