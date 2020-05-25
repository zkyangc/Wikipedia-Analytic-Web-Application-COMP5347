const express = require('express')
const router = express.Router()  
const controller = require("../controllers/controller")


//test
router.post('/test',  controller.getNewsReddit);

//dashboard page / overall page, only the authenticated users are able to access
router.get('/', controller.ensureAuthenticated, controller.renderHomePage);
router.get('/overall_plot', controller.ensureAuthenticated, controller.renderHomePage);
router.post('/',  controller.getOverallArticles);
router.post('/overall_plot',  controller.renderHomePagePlot);

//landing page
router.get('/landingpage',controller.renderLandingPage);

//register page 
router.get('/register',controller.renderRegisterPage);

//login page
router.get('/login',controller.renderloginPage);

//register handle 
router.post('/register',controller.getUserInformation);

//login handle
router.post('/login',controller.getAuthentication);

//edit password page - haven't logged in 
router.get('/resetpassword-nologin', controller.renderResetpasswordPage); 

//reset password handle - haven't logged in 
router.post('/resetpassword-nologin',controller.getResetpasswordNoLogin);

//edit password page - after login 
router.get('/resetpassword',controller.ensureAuthenticated,controller.renderResetpasswordPage); 

//reset password handle - after login 
router.post('/resetpassword',controller.ensureAuthenticated,controller.getResetpassword);

//log out
router.get('/logout',controller.ensureAuthenticated,controller.setLogout)

//individual page Barnett
router.get('/individual',controller.ensureAuthenticated,controller.renderIndividualPage);
router.post('/individual', controller.getArticleInfo);

//author page Barnett
router.get('/author',controller.ensureAuthenticated,controller.renderAuthorPage);
router.post('/author', controller.getAuthorInfo);

router.get('/init',controller.initializeDbFromFile);

module.exports = router;