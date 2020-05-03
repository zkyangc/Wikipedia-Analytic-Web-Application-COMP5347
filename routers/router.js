const express = require('express')
const router = express.Router()  
const controller = require("../controllers/controller")


router.get('/', controller.renderHomePage);
router.get('/register',controller.renderRegisterPage);
router.get('/login',controller.renderloginPage);


module.exports = router;