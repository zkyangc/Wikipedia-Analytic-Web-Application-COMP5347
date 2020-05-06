const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require("body-parser");
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const router = require('./routers/router');

//DB config 
mongoose.connect('mongodb://localhost/myapp',{ useNewUrlParser: true })
    .then(()=>console.log("MongoDB connected"))
    .catch(err => console.log(err));
const db = mongoose.connection;
 
//init the app
const app = express();

//BodyParser Middileware
app.use(bodyParser.urlencoded({extended: false}));

//view engine
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', 'layouts/layout');

//static folder
app.use(express.static(path.join(__dirname,'public')));

//express session 
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

//connect flash
app.use(flash());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//global variables - for flash messages 
app.use(function(req,res,next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error'); //passport error message 
    res.locals.user = req.user || null ;
    next();
});

app.use('/',router);
//set port 
app.listen(3000,()=>{
    console.log("the server is now running on 3000")
})   