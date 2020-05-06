const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


//user scheme
const UserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  resetquestion: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

//create user model 
const User = mongoose.model('User', UserSchema);
module.exports = User;

//save the new user into the DB
module.exports.createUser = function(newUser, callback){
    bcrypt.genSalt(10, (err, salt) => {     
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if(err) throw err;
          newUser.password = hash;  //set password to hashed password
          newUser.save(callback);
        });
    });  
}

//check the existing user by using email 
module.exports.getUserByEmail = function(email,callback){
  const query = {email: email};
  User.findOne(query,callback);
}

//check password  
module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, function(err,isMatch){
    if(err) throw err;
    callback(null,isMatch);
  });
}

//check security question
module.exports.compareResetquestion = function(resetquestionToCompare,dbResetquestion,callback){

  if(resetquestionToCompare === dbResetquestion){
    return callback(null,true);
  }else{
    return callback(null,false);
  }
}

//reset password
module.exports.editPassword = function(newPassword,user){
  bcrypt.genSalt(10,(err,salt)=>{
    bcrypt.hash(newPassword, salt, (err,hash)=>{
      if(err) throw err;
      user.password = hash;
      user.save();

    })
  })
}

module.exports.getUserById = function(id,callback){
    User.findById(id,callback);
}



