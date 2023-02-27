const User = require('../model/userModal')
const asyncHnadler = require('express-async-handler')


const getAllUser = asyncHnadler(async(req,res)=>{
    const user = await User.find()

    res.status(200).json({
        status:'success',
        total:user.length,
        user
    })
})

module.exports = {
    getAllUser
}