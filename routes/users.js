var express = require('express');
var router = express.Router();
var multer  = require('multer');
var upload = multer();
var cpUpload = upload.fields([{ name: 'profileimage', maxCount: 1 }]);

var User = require('../models/user');



/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.get('/register', function(req,res,next){
  
  res.render('register', {
    "title": "Register"
  });
});



router.get('/login', function(req,res,next){
  
  res.render('login', {
    "title": "Login"
  });
});

router.post('/register',cpUpload, function(req,res,next){
  
  
  //console.log(req);
  //get from values
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;
  
  
  
  // check for image
  if(req.files.profileimage){
    console.log('uploading file....')
    //file info
    var profileImageOriginalName = req.files.profileimage.originalname;
    var profileImageName         = req.files.profileimage.name;
    var profileImageMime         = req.files.profileimage.mime;
    var profileImagePath         = req.files.profileimage.path;
    var profileImageExtension    = req.files.profileimage.extension;
    var profileImageSize         = req.files.profileimage.size;
    
    
  }else{
    // set a default Image
    var profileImageName = 'noimage.png';
  }
  
  
  //form validation
  req.checkBody('name','Name field is required').notEmpty();
  req.checkBody('email','Email field is required').notEmpty();
  req.checkBody('email','Email not valid').isEmail();
  req.checkBody('username','Username field is required').notEmpty();
  req.checkBody('password','Password field is required').notEmpty();
  req.checkBody('password2','Passwords do not match').equals(req.body.password);
  
  
  // Check for errors
  
  var errors = req.validationErrors();
  
  if(errors){
    res.render('register', {
      errors: errors,
      name: name,
      email: email,
      username: username,
      password: password,
      password2: password2
    });
    
  }else{  
    console.log('cool');
    // create User if all Ok
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      profileimage: profileImageName
    });
   
   User.createUser(newUser, function(err, user){
     if(err) throw err;
     console.log(user);
   });
   
   // Success Message
   req.flash('success', "You are now regestered and may log in");
   
   
   res.location('/');
   res.redirect('/'); 
    
  }
  
});



module.exports = router;
