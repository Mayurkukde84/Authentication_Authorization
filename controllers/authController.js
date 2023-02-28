const asyncHandler = require('express-async-handler')
const User = require('../model/userModal')
const jwt = require('jsonwebtoken')

const signToken = (id)=>{
  return  jwt.sign({id},
        process.env.JWT_SECRET,
        {expiresIn:process.env.JWT_EXPIRES_IN}
        )
}

const createSignToken = (user,statusCode,res)=>{
const token = signToken(user._id)
const cookieOptions = {
    expiresIn:new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 *60 *60 *1000),
    secure:false,
    httpOnly:true
}
res.cookie('jwt',token,cookieOptions)
user.password = undefined

res.status(statusCode).json({
    status:'success',
    token,
    message:`${user} is created`,
    data:{
        user
    }
})
}

const signup = asyncHandler(async(req,res)=>{
    const {username,email,password,passwordConfirm} = req.body
    const user = await User.create({
        username,
        email,
        password,
        passwordConfirm
    })

    

      
  createSignToken(user,200,res)
})

const login = asyncHandler(async(req,res)=>{
    const {email,password} = req.body
    if(!email || !password){
      return  res.status(400).json({
            message:'please fill the field'
        })
    }
    const user = await User.findOne({email}).select('+password')
     
    if(!user || !(await user.correctPassword(password,user.password) ) ){
       return res.status(401).json({message:'Incorrect email or password'})
    }
    createSignToken (user,201,res)
    
})


module.exports ={
    signup,
    login
}