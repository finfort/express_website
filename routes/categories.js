var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('sa:1@ds035633.mongolab.com:35633/express_website_db');


router.get('/add', function(req,res,next){
	// var categories  = db.get('categories');
	// categories.find({},{}, function(err, categories){
		res.render('addcategory', {
			'title':"Add Category"
			// 'categories': categories
	});	
	// })
	
});

router.post('/add', function(req,res,next){
	//get form values
	var categoryname 		= req.body.categoryname;
	
	//Form validation
	req.checkBody('categoryname', 'Title fields is required').notEmpty();
	

	//check errors 
	var errors = req.validationErrors();
	if(errors){
		res.render('addcategory', {
			'errors':errors,
			'categoryname': categoryname
		})
	}else{
		var categories = db.get('posts');
		
		categories.insert({
			'categoryname': categoryname,
			
		}, function(err, category){
			if(err){
				res.send('There was an issuee submitting the category');
				
			}else{
				req.flash('success', 'Category submitted');
				res.location('/');
				res.redirect('/');
			}
		})
		
	}	
});


module.exports = router;
