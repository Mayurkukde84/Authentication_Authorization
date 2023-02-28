const asyncHandler = require('express-async-handler')
const User = require('../model/userModal')
const jwt = require('jsonwebtoken')
const {promisify} = require('util')

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

const protect = asyncHandler(async(req,res,next)=>{
   let token;
   if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    {
        token = req.headers.authorization.split(' ')[1]
    }
    if(!token){
        return res.status(401).json({message:'You are not logged in to get access'})
    }
    //verify token
    const decoded = await promisify (jwt.verify)(token,process.env.JWT_SECRET)
    //check user still logged in
    const currentUser = await User.findById(decoded.id)
    if(!currentUser){
        return res.status(401).json({message:'The user belonging to user doe not belongig'})
    }
    //check if user changed passwor dafter the token was issued
    if(currentUser.changedPasswordAfter(decoded.iat)){
        return res.status(401).json({message:'User recently changed password! please log in again'})
    }
    req.user = currentUser
    next()
})
const restrictTo = (...roles) =>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return res.status(403).json({message:'You do not have permission to perform this operation'})
        }
        next()
    }
}

module.exports ={
    signup,
    login,
    protect,
    restrictTo
}