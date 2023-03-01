const User = require('../model/userModal')
const asyncHnadler = require('express-async-handler')

const filterObj = (obj,...allowedFields)=>{
    const newObj = {}
Object.keys(obj).forEach(el=>{
    if(allowedFields.includes(el)) newObj[el] = obj[el] 
})
return newObj
}
const getAllUser = asyncHnadler(async(req,res)=>{
    const user = await User.find()

    res.status(200).json({
        status:'success',
        total:user.length,
        user
    })
})

const updateMe = asyncHnadler(async(req,res)=>{
    if(req.body.password || req.body.passwordConfirm){
        return  res.status(400).json({
            message:'This route not for password updates. Please use/updateMyPassword'
        })
    }
    //update user document
    const filterdBody = filterObj(req.body,'name','email');
    const updatedUser = await User.findByIdAndUpdate(req.user.id,filterObj,{
        new:true,
        runValidators:true
    })

    res.status(200).json({
        status:'success',

    })
})

module.exports = {
    getAllUser,
    updateMe
}