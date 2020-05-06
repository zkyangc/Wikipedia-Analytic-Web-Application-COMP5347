
const user = require('../models/user.js')

exports.renderHomePage = (req,res)=>{
    res.render("main.ejs")
}

exports.renderRegisterPage = (req,res)=>{
    res.render("register")
}

exports.renderloginPage = (req,res)=>{
    res.render("login")
}
