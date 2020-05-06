
const user = require('../models/model.js')

exports.renderHomePage = (req,res)=>{
    res.render("main.ejs")
}

exports.renderRegisterPage = (req,res)=>{
    res.render("register")
}

exports.renderloginPage = (req,res)=>{
    res.render("login")
}

exports.renderAnalyticPage = (req,res)=>{
    res.render("analytic.ejs")
}
