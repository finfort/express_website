var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('sa:1@ds035633.mongolab.com:35633/express_website_db');
var moment = require('moment');
var multer  = require('multer');
var upload = multer();
var cpUpload = upload.fields([{ name: 'mainimage', maxCount: 1 }]);



router.get('/add', function(req,res,next){
	var categories  = db.get('categories');
	categories.find({},{}, function(err, categories){
		res.render('addpost', {
			'title':"Add Post",
			'categories': categories
	});	
	})
	
});

router.post('/add',cpUpload, function(req,res,next){
	//get form values
	var title 		= req.body.title;
	var category 	= req.body.category;
	var body 		= req.body.body;
	var author 		= req.body.author;
	var date 		= new Date();
	
	if(req.files.mainimage)
	{
		var mainImageOriginalName = req.files.mainimage.originalname;
		var mainImageName         = req.files.mainimage.name;
		var mainImageMime         = req.files.mainimage.mime;
		var mainImagePath         = req.files.mainimage.path;
		var mainImageExtension    = req.files.mainimage.extension;
		var mainImageSize         = req.files.mainimage.size;
	}else{
		var mainImageName 			= 'noimage.png';
	}
	
	
	//Form validation
	req.checkBody('title', 'Title fields is required').notEmpty();
	req.checkBody('body', 'Body fields is required').notEmpty();

	//check errors 
	var errors = req.validationErrors();
	if(errors){
		res.render('addpost', {
			'errors':errors,
			'title': title,
			'body' : body
		})
	}else{
		// insert post
		var posts = db.get('posts');
		
		posts.insert({
			'title': title,
			'body' : body,
			'category' : category,
			'date' : date,
			'author' : author,
			'mainimage' : mainImageName
		}, function(err, post){
			if(err){
				res.send('There was an issuee submitting the post');
				
			}else{
				req.flash('success', 'Post submitted');
				res.location('/');
				res.redirect('/');
			}
		})
		
	}	
});


module.exports = router;
