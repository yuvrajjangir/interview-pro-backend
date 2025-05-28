const express = require('express')
const pool = require('./config/db')
const route = require('./routes/allRouter')
const cors = require("cors")
const app = express()

app.use(express.json())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.get('/',(req,res) =>{
    res.json("Hello from backend")
})

app.use('/',route)
app.use("/api/payment", route);

// Function to test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to postgresql successfully');
    console.log('Database URL:', process.env.DATABASE_URL);
    client.release();
    return true;
  } catch (err) {
    console.error('Database connection error:', err);
    return false;
  }
};

// Function to start server with retries
const startServer = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    const isConnected = await testConnection();
    if (isConnected) {
      const port = process.env.PORT || 5000;
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
      return;
    }
    
    if (i < retries - 1) {
      console.log(`Retrying connection in ${delay/1000} seconds... (Attempt ${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.error('Failed to connect to database after multiple retries');
  process.exit(1);
};

// Start the server
startServer();

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing HTTP server and database pool...');
  pool.end(() => {
    console.log('Database pool has ended');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Closing HTTP server and database pool...');
  pool.end(() => {
    console.log('Database pool has ended');
    process.exit(0);
  });
});