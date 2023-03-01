const express = require('express')
const router = express.Router()
const authController  = require('../controllers/authController')
const { route } = require('./root')

router.route('/signup').post(authController.singnup)
 router.route('/login').post(authController.login)
 router.route('/forgotPassword').post(authController.forgotPassword)
 router.route('/resetPassword/:token').patch(authController.resetPassword)

module.exports = router