var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('sa:1@ds035633.mongolab.com:35633/express_website_db');

/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res, next) {
  //var db = req.db;
  var posts = db.get('posts');
  posts.find({},{},function(err, posts){
    if(err) throw err;
    res.render("index", {
      title: "Home",
      "posts": posts
    })
  });
  // res.render('index', { title: 'Home' });
  
  
});

function ensureAuthenticated(req,res,next){
  //passport authentication
  if(req.isAuthenticated()){
    return next();
    
  }
  res.redirect('/users/login');
   
}


module.exports = router;
