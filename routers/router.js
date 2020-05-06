const express = require('express')
const router = express.Router()
const controller = require("../controllers/controller")

// main page
router.get('/', controller.renderHomePage);
router.get('/register',controller.renderRegisterPage);
router.get('/login',controller.renderloginPage);

// analytic page
router.get('/analytic', controller.renderAnalyticPage);

module.exports = router;
