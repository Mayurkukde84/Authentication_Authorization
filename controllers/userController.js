const User = require('../model/userModal')
const asyncHandler = require('express-async-handler')

const filterObj = (obj,...allowedFields)=>{
    const newObj = {}
Object.keys(obj).forEach(el=>{
    if(allowedFields.includes(el)) newObj[el] = obj[el] 
})
return newObj
}
const getAllUser = asyncHandler(async(req,res)=>{
    const user = await User.find()

    res.status(200).json({
        status:'success',
        total:user.length,
        user
    })
})

const updateMe = asyncHandler(async(req,res)=>{
    if(req.body.password || req.body.passwordConfirm){
        return  res.status(400).json({
            message:'This route not for password updates. Please use/updateMyPassword'
        })
    }
    //filtered out unwanted fields names that are not allowed to be updated
    const filterdBody = filterObj(req.body,'name','email');
    const updatedUser = await User.findByIdAndUpdate(req.user.id,filterdBody,{
        new:true,
        runValidators:true
    })

    res.status(200).json({
        status:'success',
        data:{
            user:updatedUser
        }
    })
})

const deleteMe = asyncHandler(async(req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id,{active:false})

    res.status(204).json({
        status:'success',
        data:null
    })
    next()
})

module.exports = {
    getAllUser,
    updateMe,
    deleteMe
}