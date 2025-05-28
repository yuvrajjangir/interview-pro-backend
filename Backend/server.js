const express = require('express')
const pool = require('./config/db')
const route = require('./routes/allRouter')
const cors = require("cors")
const app = express()


app.use(express.json())
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.get('/',(req,res) =>{
    res.json("Hello from backend")
})

app.use('/',route)
app.use("/api/payment", route);

pool.connect().then(client => {
    console.log('Connected to postgresql successfully')
    console.log(process.env.DATABASE_URL)
    client.release()

    app.listen(5000,()=>{
        console.log('Server 5000 is running correctly')
    })
})
.catch(err => {
    console.log(err)
    process.exit(1)
})