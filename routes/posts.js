var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('sa:1@ds035633.mongolab.com:35633/express_website_db');
var moment = require('moment');
var multer  = require('multer');
var upload = multer();
var cpUpload = upload.fields([{ name: 'mainimage', maxCount: 1 }]);
var http = require('http');
var inspect = require('util').inspect,
  path = require('path'),
  os = require('os'),
  fs = require('fs');
var Busboy = require('busboy');


router.get('/add', function(req,res,next){
	var categories  = db.get('categories');
	categories.find({},{}, function(err, categories){
		res.render('addpost', {
			'title':"Add Post",
			'categories': categories
	});	
	})
	
});

router.post('/add',  function (req, res, next) {
	//get form values
	// var title = req.body.title;
	// var category = req.body.category;
	// var body = req.body.bodyMain;
	// var author = req.body.author;
	
	var date = new Date();

	var mainImageName;
	var fstream;
	var result = [];
	var number_of_files = 1;
	var counter = 0;
	var busboy = new Busboy({ headers: req.headers });
	busboy.on('file', function (fieldname, file, filename) {
		counter++;
		console.log("Uploading: " + filename);
		console.log('File [' + file + '] field ' + fieldname + ' ...');
		//Path where image will be uploaded
		if (result.length > 0) {
			var file_type = filename.substr(filename.length - 4);
			filename = result[0].name + '_' + number_of_files + file_type;
			number_of_files++;
		}
		fstream = fs.createWriteStream("./public/images/uploads/" + filename);
		file.pipe(fstream);
		fstream.on('close', function () {
			counter--;
			console.log("Upload Finished of " + filename);
			result.push(filename);
			mainImageName = result;
			console.log("result ", result)
			if (counter == 0) {
				console.log("writing finished");
				//res.sendStatus(200);
			}
		});
	});
	 busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated) {
    console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    //get from values
    if (fieldname == "title")
      title = val;
    if (fieldname == "category")
      category = val;
    if (fieldname == "bodyMain")
      body = val;
    if (fieldname == "author")
      author = val;

    //check_errors();

  });
	busboy.on('finish', function () {
		console.log('Done parsing form!');
		//res.writeHead(303, { Connection: 'close', Location: '/' });
		//res.end();
	});

	req.pipe(busboy);// carefull closing busboy
    
	if (!mainImageName)
		mainImageName = 'noimage.png';
  
	// if(req.files.mainimage)
	// {
	// 	var mainImageOriginalName = req.files.mainimage.originalname;
	// 	var mainImageName         = req.files.mainimage.name;
	// 	var mainImageMime         = req.files.mainimage.mime;
	// 	var mainImagePath         = req.files.mainimage.path;
	// 	var mainImageExtension    = req.files.mainimage.extension;
	// 	var mainImageSize         = req.files.mainimage.size;
	// }else{
	// 	var mainImageName 			= 'noimage.png';
	// }
	
	
	//Form validation
	// req.checkBody('title', 'Title fields is required').notEmpty();
	// req.checkBody('bodyMain', 'Body fields is required').notEmpty();

	//check errors 
	//var errors = req.validationErrors();
	
	  setTimeout( function(){
		  
		  
		if (errors.length > 0) {
			res.render('addpost', {
				'errors': errors,
				'title': title,
				'body': body
			})
		} else {
			// insert post
			var posts = db.get('posts');
	
			posts.insert({
				'title': title,
				'body': body,
				'category': category,
				'date': date,
				'author': author,
				'mainimage': mainImageName
			}, function (err, post) {
				if (err) {
					res.send('There was an issuee submitting the post');
	
				} else {
					req.flash('success', 'Post submitted');
					res.location('/');
					res.redirect('/');
				}
			})
	
		}
	}, 1000);
	
});
var errors = [];

	var title;
	var category;
	var body;
	var author;
	
function check_errors() {
    if (title == "") {
      errors[0] = "Title field is required";
    }
    if (body == "") {
      errors[1] = "Body field is required";
    }
   
  }

module.exports = router;
