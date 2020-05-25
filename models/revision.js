const mongoose = require('mongoose');
const fs = require('fs');
const assert = require('assert');
const dbFiles = require('./dataFiles.js')

//var querystring = require("querystring");

//*******************************
// INITIALIZE DATABASE
//*******************************
Revision = require('./dbModels.js').Revision
let userTypeLists = {};
let revList = [];
let newRev = {};
let data = [];

userListFiles = dbFiles.userListFiles
revisionsDir = dbFiles.revisionsDir
module.exports = Revision;
module.exports.initializeDbFromFile = function(options){
  
  console.log('Start to initialize database. ')

  //*******************************
  // read files and add to database
  //*******************************
  for (var i = 0; i < userListFiles.length; i++){
    var userList = [];
    fs.readFileSync(userListFiles[i].path).toString().split('\n').forEach(line=>{
      userList.push(line);
    })
    type = userListFiles[i].userType.toString()
    userTypeLists[type] = userList;
  }

  // drop the old collection
  mongoose.connection.db.dropCollection('revisions');
  mongoose.connection.db.dropCollection('articles');
  mongoose.connection.db.dropCollection('yearcounts');
  mongoose.connection.db.dropCollection('authors');

  const dir = fs.opendirSync(revisionsDir.path)
  let dirent;
  while ((dirent = dir.readSync()) !== null) {
    let path = revisionsDir.path + '/' + dirent.name;
    batch = JSON.parse(fs.readFileSync(path).toString());
    for (var i = 0; i < batch.length; i++){
      if (batch[i].anon != true){
        if (userTypeLists['administrator'].includes(batch[i].user)){
          batch[i]['userType'] = 'administrator';
        } else if (userTypeLists['bots'].includes(batch[i].user)){
          batch[i]['userType'] = 'bot';
          } else {
          batch[i]['userType'] = 'regularUser';
        }
      }
      batch[i] = new Revision(batch[i]);
    }
    Revision.collection.insertMany(batch, function(err,r) {
     assert.equal(null, err);
    });
    data.push(batch)
    
    //break

  }
  dir.closeSync()

  //*********************************************************
  // add year statistic for Overall Analytics to database
  //*********************************************************
  // drop the old collection
  //mongoose.connection.db.dropCollection('yearcounts');

  yearCount = require('./dbModels.js').yearCount
  let yearList = {}
  let yearnum = 0

  for (var i = 0; i < data.length; i++){
    for (var j = 0; j < data[i].length; j++){
      yearnum = data[i][j].timestamp.getFullYear()
      //if year exists in object yearList
      if (yearList[yearnum] == undefined){
        yearList[yearnum] = new yearCount({
          year: yearnum,
          administrator: 0,
          anon: 0,
          bot: 0,
          regularUser: 0
        })
      }
      if (data[i][j].anon == true){
        yearList[yearnum]['anon'] += 1
      }else{
        yearList[yearnum][data[i][j].userType] += 1
      }
    }
  }


  // add year data to database
  yearCount.collection.insertMany(Object.values(yearList), function(err,r) {
    assert.equal(null, err);
  });
  console.log('year data finished. ')

  //*********************************************************
  // add article data to database
  //*********************************************************

  // drop the old collection
  //mongoose.connection.db.dropCollection('articles');

  Article = require('./dbModels.js').Article
  let articleList = {}
  let groupCountList = {}

  for (var i = 0; i < data.length; i++){
    for (var j = 0; j < data[i].length; j++){
      articleTitle = data[i][j].title
      //if article exists in object articleList
      if (articleList[articleTitle] == undefined){
        articleList[articleTitle]= new Article({
          title: articleTitle,
          revCount: 0,
          groupCount: 0,
          startDate: data[i][j].timestamp
        })
        groupCountList[articleTitle] = []
      }
      articleList[articleTitle].revCount +=1
      if (articleList[articleTitle].startDate > data[i][j].timestamp){
        articleList[articleTitle].startDate = data[i][j].timestamp
      }
      // non-bot and not anonymum
      if (data[i][j].anon != true && data[i][j].userType != 'bot'){
        if (!groupCountList[articleTitle].includes(data[i][j].user)){
          groupCountList[articleTitle].push(data[i][j].user)
        }
      }
    }
  }
  let keys = Object.keys(articleList)
  for (var i = 0; i < keys.length; i++){ 
    articleList[keys[i]]['groupCount'] = groupCountList[keys[i]].length
  }

  // add year data to database
  console.log(articleList)
  Article.collection.insertMany(Object.values(articleList), function(err,r) {
    assert.equal(null, err);
  });
  console.log('article data finished. ')

  //*********************************************************
  // add article data to database
  //*********************************************************
  // drop the old collection
  //mongoose.connection.db.dropCollection('authors');

  Author = require('./dbModels.js').Author
  let authorList = {}

  for (var i = 0; i < data.length; i++){
    for (var j = 0; j < data[i].length; j++){
      authorName = data[i][j].user
      if (data[i][j].anon != true ){
        //if author exists in object authorList and not bot
        if (data[i][j].userType != 'bot' && authorList[authorName] == undefined){
          authorList[authorName]= new Author({
            name: authorName,
            userType: data[i][j].userType
          })
        }
      }
    }
  }

  // add year data to database
  Author.collection.insertMany(Object.values(authorList), function(err,r) {
    assert.equal(null, err);
  });
  console.log('author data finished. ')
}




