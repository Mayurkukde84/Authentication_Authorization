const asyncHandler = require('express-async-handler')
const User = require('../model/userModal')
const jwt = require('jsonwebtoken')
const signup = asyncHandler(async(req,res)=>{
const {username,email,password,passwordConfirm} =req.body 

const user = await User.create({
    username,
    email,
    password,
    passwordConfirm
})
const token = jwt.sign({id:user._id},
    process.env.JWT_SECRET,
    {
        expiresIn:process.env.JWT_EXPIRES_IN
    }
    )

res.status(200).json({
    status:'success',
    token,
    user
})
})
const login = asyncHandler(async(req,res)=>{
    const {email,password} = req.body
    if(!email || !password){
        res.status(401).json({
            status:"success",
            message:'please fill email and password'
        })
    }

    const user = await User.findOne({email}).select('+password')
    if (!user || !(await user.correctPassword(password, user.password))) {
        return res.json({ message: "Incorrect email or password" });
      }
    

})

module.exports ={
    signup,
    login
}