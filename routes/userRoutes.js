const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

router.route('/getalluser').get(authController.protect,userController.getAllUser)

module.exports = router