const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

router.route('/getalluser').get(userController.getAllUser)

module.exports = router