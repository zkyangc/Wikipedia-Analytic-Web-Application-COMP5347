const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
var exphbs  = require('express-handlebars');; //template engine
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongo = require('mongodb');
const mongoose = require('mongoose');
//mongoose.connect('mongodb://localhots/myapp')
//const db = mongoose.connection;

const router = require('./routers/router');


//init the app
const app = express();

//BodyParser Middileware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

//view engine
app.set("views","views") //look for views called views
app.set("view engine","hbs")


//static folder
app.use(express.static(path.join(__dirname,'public')));

//express session 
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

//express validator
app.use(expressValidator({
    errorFormatter: function(param,msg,value){
        const namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

        while(namespace.length){
            formParam +='[' + namespace.shift() + ']';
        }
        return{
            param: formParam,
            msg : msg,
            value: value
        };
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//connect flash
app.use(flash());

//global variables
app.use(function(req,res,next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

app.use('/',router);

//set port 
app.listen(3000,()=>{
    console.log("the server is now running on 3000")
})   