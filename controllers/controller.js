const User = require('../models/user.js')
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const revision = require('../models/revision.js')
const query = require('../models/queryData.js')
const request = require('request')



//only the autenticated users are able to access the dashboard
exports.ensureAuthenticated = (req,res,next)=>{
    if(req.isAuthenticated()){
        user = req.user;
        return next();
    }else{
        req.flash('error_msg','You are not logged in, please log in to view the dashboard');
        res.redirect('/login')
    }
}

//render the landing page
exports.renderLandingPage = (req,res)=>{
    res.render("landingpage");
}

//render the home page, only show up when logged in
exports.renderHomePage = (req,res)=>{
    res.render("index");
}

// get articles queried
exports.getOverallArticles = (req,res)=>{ 
    query.getOverallArticles(req).then((value) => {
        res.render("index",value);
    })
    
}

//render the home page, only show up when logged in 
exports.renderHomePagePlot = (req,res)=>{ 
    //console.log(req.body.overallChartSelect)
    query.getYearCount(req).then((value) => {
        res.render("index", value)
    })

    //res.render("index", {chart: "bar", anon: anon, administrator: administrator, bot: bot, regularUser: regularUser, labels: y_labels});
}

//render the individual page Barnett
exports.renderIndividualPage = (req,res)=>{
    query.getArticleList(req).then((value) => {
        res.render('individual', {articleList: value});
    })
}

//render the individual page with article info
exports.getArticleInfo = (req,res)=>{
    const userTitle =  req.body.overallChartSelect;
    queryString = 'q='+userTitle
    const parameters = [
        queryString+'+AND+subreddit:news',
        'sort=top',
        'limit=3'
    ]
    const url = "https://www.reddit.com/search.json" + "?" + parameters.join("&");
    const options = {
        url: url,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8'
        }};
    request(options, function (err, response, data){
        if (err) {  
            console.log('Error:', err);
        } else if (res.statusCode !== 200) { 
            console.log('Error status code:', res.statusCode);
        } else { 
            const json = JSON.parse(data);
            
            title_list = json.data.children.map(a => a.data.title)
            url_list = json.data.children.map(a => a.data.url)
            query.getArticleList(req).then((article) => {
            query.getArticleInfo(req).then((info) => {
                to_return = {articleList: article, info: info, news: {title: title_list,url: url_list}}
                console.log(to_return.articleList)
                res.render('individual', to_return);
            })
        })
        }
    })
}

//render the author page Barnett
exports.renderAuthorPage = (req,res)=>{
    res.render("author");
}

//render the author page with author info
exports.getAuthorInfo = (req,res)=>{
    query.getAuthorInfo(req).then((value) => {
        console.log(value)
        res.render('author', value);
    })
}

//render the tempate page Barnett
exports.renderTempatePage = (req,res)=>{
    res.render("tempate");
}



//render the registration page
exports.renderRegisterPage = (req,res)=>{
    res.render("register");
}

//render the log in page
exports.renderloginPage = (req,res)=>{
    res.render("login");
}

//get data from user registration page
exports.getUserInformation = (req,res)=>{
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.password2;
    const resetquestion = req.body.resetquestion;
    const errors = [];

    //check all require fileds
    if(!firstname || !lastname || !email || !password || !password2 || !resetquestion){
        errors.push({msg: 'Please fill in the required field'});
    }

    //check password match (entered password is the same as comfirm password) 
    if(password !== password2){
        errors.push({msg: 'Password do not match'});
    }else if(password && password2 && password.length < 8){
        errors.push({msg: 'Password should be at least 8 characters'});
    }

    //if there is an error occured
    if(errors.length > 0){
        res.render('register',{
            errors:errors,
            firstname:firstname,
            lastname:lastname,
            email:email,
            password:password,
            password2:password2,
            resetquestion: resetquestion
         });

    }else{
        //no input error in the registration form 
        User.findOne({email: email})
            .then(user =>{
                if(user){
                    //check if the user exists
                    errors.push({msg:'Email is alreay registered'})
                    res.render('register',{
                        errors:errors,
                        firstname:firstname,
                        lastname:lastname,
                        email:email,
                        password:password,
                        password2:password2,
                        resetquestion:resetquestion
                     });
                }else{
                    //create new users when input formats are all correct & email doesn't exist
                    const newUser = new User({
                        firstname:firstname,
                        lastname: lastname,
                        email: email,
                        password: password,
                        resetquestion:resetquestion
                    });

                    User.createUser(newUser, function(error, user){
                        if(error) throw error;
                        console.log(user)
                    });
                    req.flash('success_msg','You are now registered and you can log in');
                    res.redirect('/login');k
                } 
        });
    }
}

//User authentication 
passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password'},
    function(email, password, done) {
        //check whether this user exists
        User.getUserByEmail(email, function(err,user){
            if(err) throw err;
            if(!user){
                return done(null, false, {message: 'Unknown user, please register'})
            }else{
                //confirmed that this is a exitsing user -> then check whehther entered a correct password
                User.comparePassword(password,user.password, function(err,isMatch){
                    if(err) throw err;
                    if(isMatch){
                        return done(null, user);
                    }else{
                        return done(null, false, {message: 'Incorrect Password'});
                        }
                });
            }
        }) 
    }
));

//Authenticated user must be serialized to the session, and deserialized when subsequent requests are made
passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
   
passport.deserializeUser(function(id, done){
    User.findById(id, function (err, user){
      done(err, user);
    });
  });


//this function get called when authentication was successful
exports.getAuthentication = (req,res,next)=>{ 
    passport.authenticate('local',{
        successRedirect:'/', 
        failureRedirect:'/login', 
        failureFlash:true
    })(req,res,next);  
}

//render the reset password page
exports.renderResetpasswordPage = (req,res)=>{
    res.render('resetpassword');
}

//change the password - when user already logged in 
exports.getResetpassword = (req,res)=>{

    const password = req.body.password;
    const password2 = req.body.password2;
    const resetquestion = req.body.resetquestion;
    const errors = [];

    if( !password || !password2 || !resetquestion){
        errors.push({msg: 'Please fill in the required field'});
    }
    
    if(password !== password2){
        errors.push({msg: 'Password do not match'});
    }else if(password && password2 && password.length < 8){
        errors.push({msg: 'Password should be at least 8 characters'});
    }

    if(errors.length > 0){
        res.render('resetpassword',{
            errors:errors,
            password:password,
            password2:password2,
            resetquestion: resetquestion
         });

    }else{
        User.compareResetquestion(resetquestion,user.resetquestion,function(err,resetquestionMatch){
            if(err) throw err;
            //check security question
            if(resetquestionMatch){
                User.editPassword(password,user);
                req.logout();
                req.flash('success_msg' , 'Your password has been changed, please log in');
                res.redirect('/login');   
            }else{
                req.flash('error_msg' , 'Incorrect security question answer entered');
                res.redirect('/resetpassword');
            } 
        });
    }
}

//reset password - haven't log in 
exports.getResetpasswordNoLogin = (req,res) =>{

    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.password2;
    const resetquestion = req.body.resetquestion;
    const errors = [];

    if( !password || !password2 || !resetquestion){
        errors.push({msg: 'Please fill in the required field'});
    }
    
    if(password !== password2){
        errors.push({msg: 'Password do not match'});
    }else if(password && password2 && password.length < 8){
        errors.push({msg: 'Password should be at least 8 characters'});
    }

    if(errors.length > 0){
        res.render('resetpassword',{
            errors:errors,
            password:password,
            password2:password2,
            resetquestion: resetquestion
         });

    }else{
        User.findOne({email: email})
            .then(user =>{
                if(user){
                User.compareResetquestion(resetquestion,user.resetquestion,function(err,resetquestionMatch){
                    if(err) throw err;
                    //check security question
                    if(resetquestionMatch){
                        User.editPassword(password,user);         
                        req.flash('success_msg' , 'Your password has been changed, please log in');
                        res.redirect('/login');   
                    }else{
                        req.flash('error_msg' , 'Incorrect security question answer entered');
                        res.redirect('/resetpassword-nologin');
                    }
                });
                }else{
                    req.flash('error_msg' , 'Invalid user, please register');
                    res.redirect('/resetpassword-nologin');
                }
            }
        );
    }
}

//log out
exports.setLogout = (req,res) =>{
    req.logout();
    req.flash('success_msg' , 'You are logged out');
    res.redirect('/login');
}

// call the function to initialize database
exports.initializeDbFromFile = (req,res)=>{
    revision.initializeDbFromFile(req.query)
    res.render("landingpage");
}


                    