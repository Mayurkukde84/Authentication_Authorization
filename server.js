require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const connectDB = require('./config/connectdb')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
PORT = process.env.PORT
mongoose.set("strictQuery", true);
connectDB()
app.use(helmet()) //set security http headers
const limiter = rateLimit({
    max:100,
    windowMs: 60 * 60*1000,
    message:'Toomany request from this IP, please try again in an hour'
  })
  app.use('/api',limiter)
app.use(express.json({limit:'10kb'}))
app.use(cors())
app.use(cookieParser())
app.use(mongoSanitize())
app.use(xss())
app.use(hpp({
  whitelist:[
    "duration",
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}))

  
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