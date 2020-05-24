const mongoose = require('mongoose');

//define schema for Revision model
const revSchema = new mongoose.Schema(
    {
      revid: {type: Number, required: true},
      parentid: {type: Number, required: true},
      minor: {type: Boolean, required: true},
      user: {type: String, required: true},
      anon:{type: Boolean, required: false},
      userid: {type: Number, required: true},
      timestamp: {type: Date, required: true},
      title: {type: String, required: true},
      userType: {type: String, required: false}
    },
    {
      versionKey: false
    }
  );

const Revision = mongoose.model('Revision', revSchema, 'revisions');
module.exports.Revision = Revision

// define schema for yearCount
const ycSchema = new mongoose.Schema(
  {
    administrator: {type: Number, required: true},
    anon: {type: Number, required: true},
    bot: {type: Number, required: true},
    regularUser: {type: Number, required: true},
    year: {type: Number, required: true}
  },
  {
    versionKey: false
  }
);
const yearCount = mongoose.model('yearCount', ycSchema, 'yearcounts');
module.exports.yearCount = yearCount


// define schema for Article
const articleSchema = new mongoose.Schema(
  {
    title: {type: String, required: true},
    revCount: {type: Number, required: true},
    groupCount: {type: Number, required: false},
    startDate: {type: Date, required: false}
  },
  {
    versionKey: false
  }
);
const Article = mongoose.model('Article', articleSchema, 'articles');
module.exports.Article = Article

// define schema for Author
const authorSchema = new mongoose.Schema(
  {
    name: {type: String, required: true},
    userType: {type: String, required: false}
  },
  {
    versionKey: false
  }
);
const Author = mongoose.model('Author', authorSchema, 'authors');
module.exports.Author = Author