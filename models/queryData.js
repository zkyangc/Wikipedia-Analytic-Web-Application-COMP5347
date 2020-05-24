const mongoose = require('mongoose');
const dbModel = require('./dbModels.js');

//*******************************
// GET FIRST SEVERAL ARTICLES 
//*******************************
module.exports.getOverallArticles = async function(options){
    const Article = dbModel.Article
    let num = options.body.number
    var query = Article.find()
    let high_rev = [], low_rev = [], high_group = [], low_group = [], long_hist = [], shor_hist = []
    result =  await query
    return ({
        high_rev: result.sort((a, b) => (a.revCount < b.revCount) ? 1 : -1).slice(0, num),
        low_rev: result.sort((a, b) => (a.revCount > b.revCount) ? 1 : -1).slice(0, num),
        high_group: result.sort((a, b) => (a.groupCount < b.groupCount) ? 1 : -1).slice(0, num),
        low_group: result.sort((a, b) => (a.groupCount > b.groupCount) ? 1 : -1).slice(0, num),
        long_hist: result.sort((a, b) => (a.startDate > b.startDate) ? 1 : -1).slice(0, num),
        shor_hist: result.sort((a, b) => (a.startDate < b.startDate) ? 1 : -1).slice(0, num)
    })
}
//*******************************
// GET REV COUNT BY YEAR FROM DB
//*******************************
module.exports.getYearCount = async function(options){
    const yearCount = dbModel.yearCount
    var query = yearCount.find()
    let result = []

    result =  await query
    //console.log(result)
    // bar chart


    if (options.body.overallChartSelect =='bar' || options.body.overallChartSelect == 'line'){
        let anon = [], administrator = [], bot = [], regularUser = [], y_labels = [] 
        for (var i=0; i<result.length; i++){
            anon.push(result[i].anon)
            administrator.push(result[i].administrator)
            bot.push(result[i].bot)
            regularUser.push(result[i].regularUser)
            y_labels.push(result[i].year)
        }
        return ({chart: options.body.overallChartSelect, anon: anon, administrator: administrator, bot: bot, regularUser: regularUser, labels: y_labels}) 
    }else if (options.body.overallChartSelect =='pie'){
        let anon = 0, administrator = 0, bot = 0, regularUser = 0
        for (var i=0; i<result.length; i++){
            anon += result[i].anon
            administrator += result[i].administrator
            bot += result[i].bot
            regularUser += result[i].regularUser
        }
        return ({chart: options.body.overallChartSelect, labels: ["administrator", "anon", "bot", "regularUser"], values:[administrator, anon, bot, regularUser]})
    }
}

//***********************************
// GET ARTICLE LIST TO CHOOSE
//***********************************
module.exports.getArticleList = async function(options){
    const Article = dbModel.Article
    let num = options.body.number
    result =  await Article.find()
    return (result.sort((a, b) => (a.title > b.title) ? 1 : -1).slice(0, num))
}


//***********************************
// GET ARTICLE INFO WITH A GIVEN SPAN
//***********************************
module.exports.getArticleInfo = async function(options){
    articleTitle = options.body.overallChartSelect
    startDate = new Date(options.body.start)
    // endDate +1 month to include the month (assuming the time span is to the end of that month)
    endDate = new Date(options.body.end)
    endDate.setMonth(endDate.getMonth()+1)

    const Revision = dbModel.Revision

    var rev =  await Revision.find({title: articleTitle, timestamp: {"$gte": startDate, "$lt": endDate}})
    count = rev.length
    
    // count rev by user
    userRevCount = {}
    for (var i=0; i<rev.length; i++){
        if (rev[i].userType ==='regularUser'){
            if (userRevCount[rev[i].userid] === undefined){
                userRevCount[rev[i].userid] = {user: rev[i].user, revCount: 0}
            }
            userRevCount[rev[i].userid].revCount += 1
        }
    }
    revRank = Object.values(userRevCount).sort((a, b) => (a.revCount < b.revCount) ? 1 : -1).slice(0, 5)

    // news



    // bar data
    let yearList = {}
    let yearnum = 0
  
    for (var i = 0; i < rev.length; i++){
        yearnum = rev[i].timestamp.getFullYear()
        //if year exists in object yearList
        if (yearList[yearnum] === undefined){
            yearList[yearnum] = {
                year: yearnum,
                administrator: 0,
                anon: 0,
                bot: 0,
                regularUser: 0
            }
        }
        if (rev[i].anon == true){
            yearList[yearnum]['anon'] += 1
        }else{
            yearList[yearnum][rev[i].userType] += 1
        }
    }

    yearList = Object.values(yearList)
    let anon = [], administrator = [], bot = [], regularUser = [], y_labels = [] 
    for (var i=0; i<yearList.length; i++){
        anon.push(yearList[i].anon)
        administrator.push(yearList[i].administrator)
        bot.push(yearList[i].bot)
        regularUser.push(yearList[i].regularUser)
        y_labels.push(yearList[i].year)
    }
    barData = {anon: anon, administrator: administrator, bot: bot, regularUser: regularUser, labels: y_labels}

    //pie data
    let administratorp=0, anonp=0, botp=0, regularUserp=0
    for (var i=0; i<yearList.length; i++){
        anonp += yearList[i].anon
        administratorp +=yearList[i].administrator
        botp +=yearList[i].bot
        regularUserp +=yearList[i].regularUser
    }
    pieData = {labels: ["administrator", "anon", "bot", "regularUser"], values:[administratorp, anonp, botp, regularUserp]}

    // 5 user rev stat
    rankUserStat = {}
    for  (var i=0; i<revRank.length; i++){
        rankUserStat[revRank[i].user] = {}
    }

    for (var i = 0; i < rev.length; i++){
        yearnum = rev[i].timestamp.getFullYear()
        user = rev[i].user
        if (rankUserStat[user] != undefined){
            if (rankUserStat[user][yearnum] === undefined){
                rankUserStat[user][yearnum] = {
                    year: yearnum,
                    count: 0
                }
            }
            rankUserStat[user][yearnum].count += 1
        }
    }
    //console.log(rankUserStat)
    for (var key in rankUserStat) {
        rankUserStat[key] = [
            Object.values(rankUserStat[key]).map(a => a.year),
            Object.values(rankUserStat[key]).map(a => a.count)
        ]
    }

    //console.log(rankUserStat)

    return ({title: articleTitle, count: count, revRank: revRank, barData: barData, pieData: pieData, rankUserStat: JSON.stringify(Object.values(rankUserStat))})
}



//***********************************
// GET AUTHOR INFO
//***********************************

module.exports.getAuthorInfo= async function(options){
    const Author = dbModel.Author
    const Revision = dbModel.Revision
    
    let serchText = JSON.parse(JSON.stringify(options.body)).serchText
    var authList = await Author.find()
    nameList = authList.map(a => a.name)

    //case insensitive search
    for (var i = 0; i < nameList.length; i++){
        if (typeof nameList[i] != "undefined"){
            if (serchText.toLowerCase() ===nameList[i].toLowerCase()){
                var name = nameList[i]
                break
            }
        }
    }
    if (typeof name != "undefined"){
        var revList = await Revision.find({user: name})
        //console.log(revList)
        var articleList = {}
        for (var i = 0; i < revList.length; i++){
            title = revList[i].title
            if (articleList[title] === undefined){
                articleList[title] = {
                    user: name,
                    title: title,
                    rev: [], 
                    rev_count: 0
                }
            }
            articleList[title].rev_count +=1
            articleList[title].rev.push(revList[i].timestamp.toISOString().slice(0,10))
        }
        //console.log(articleList)
        return ({exist: true, data: Object.values(articleList)})
    }else{
        console.log("no such name")
        return ({exist: false})
    }
    //var rev =  await Revision.find({user: serchText, timestamp: {"$gte": startDate, "$lt": endDate}})

}

