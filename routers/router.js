const express = require('express')
const router = express.Router()  
const controller = require("../controllers/controller")

//dashboard page, only the authenticated users are able to access
router.get('/', controller.ensureAuthenticated,controller.renderHomePage);

//register page 
router.get('/register',controller.renderRegisterPage);

//login page
router.get('/login',controller.renderloginPage);

//register handle 
router.post('/register',controller.getUserInformation);

//login handle
router.post('/login',controller.getAuthentication);

//edit password page
router.get('/resetpassword',controller.ensureAuthenticated,controller.renderResetpasswordPage); 

//reset password handle
router.post('/resetpassword',controller.getResetpassword);

//log out
router.get('/logout',controller.ensureAuthenticated,controller.setLogout)



module.exports = router;