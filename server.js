require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const connectDB = require('./config/connectdb')
const cors = require('cors')
const cookieParser = require('cookie-parser')
PORT = process.env.PORT
mongoose.set("strictQuery", true);
connectDB()
app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use('/',express.static(path.join(__dirname,'public')))
app.use('/',require('./routes/root'))
app.use('/api/v1/auth',require('./routes/authRoutes'))
app.use('/api/v1/user',require('./routes/userRoutes'))
app.use('*',(req,res)=>{
    res.status(404)
    if(req.accepts('html')){
        res.sendFile(path.join(__dirname,'views','404.html'))
    }
})

mongoose.connection.once('open',()=>{
    console.log('mongodb is connected')
    app.listen(PORT,()=>{
        console.log(`server is running on ${PORT}`)
    })
})

mongoose.connection.once('err',()=>{
    console.log(err)
})