var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');

var multer  = require('multer');
var upload = multer();
var cpUpload = upload.fields([{ name: 'profileimage', maxCount: 1 }]);
var http = require('http'),
    inspect = require('util').inspect;
var util = require('util');

var Busboy = require('busboy');

var formidable = require('formidable')
    

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

  //get from values
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;
  // console.log(req.body);
  console.dir(req.files);
  
  var profileImageName;
  
   // var form = new formidable.IncomingForm();
 
    // form.parse(req, function(err, fields, files) {
    //   res.writeHead(200, {'content-type': 'text/plain'});
    //   res.write('received upload:\n\n');
    //   res.end(util.inspect({fields: fields, files: files}));
    // });
    
  // console.log(req.files);
   // var busboy = new Busboy({ headers: req.headers });
    // busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    //   console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
    //   profileImageName = filename;
      
    //   file.on('data', function(data) {

    //     console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
    //   });
    //   file.on('end', function() {
    //     console.log('File [' + fieldname + '] Finished');
    //   });
    // });
    
    // busboy.on('finish', function() {
    //   console.log('Done parsing form!');
    //   res.writeHead(303, { Connection: 'close', Location: '/' });
    //   res.end();
    // });
    //req.pipe(busboy);
  
    if(!profileImageName)
      profileImageName = 'noimage.png';
    
  // check for image
  // if(req.files.profileimage){
  //   console.log('uploading file....')
  //   //file info
  //   var profileImageOriginalName = req.files.profileimage.originalname;
  //   var profileImageName         = req.files.profileimage.name;
  //   var profileImageMime         = req.files.profileimage.mime;
  //   var profileImagePath         = req.files.profileimage.path;
  //   var profileImageExtension    = req.files.profileimage.extension;
  //   var profileImageSize         = req.files.profileimage.size;
    
    
  // }else{
  //   // set a default Image
  // }
  
  
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

passport.serializeUser(function(user,done){
  done(null, user.id);
});


passport.deserializeUser(function(id,done){
  User.getUserById(id, function(err, user){
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done){
    
    User.getUserByUsername(username, function(err, user){
      if(err) throw err;
      if(!user){
        console.log("Unknown user");
        return done(null, false,{message: "Uknown user"});
      }
       User.comparePassword(password, user.password, function(err, isMatch){
         if(err) throw err;
         if(isMatch){
           return done(null,user);
         }else{
           console.log('Invalid Password');
           return done(null, false, {message: 'Invalid Password'});
         }
       });
    });
  }
));

router.post('/login', passport.authenticate('local',{failureRedirect:'/users/login', failureFlash:"Invalid username or password"}),function(req,res){
  console.log("Authentication successful");
  req.flash("success","You are logged in");
  res.redirect('/');
});

router.get('/logout', function(req,res, next){
  req.logout();
  req.flash("success", "You have logged out");
  res.redirect('/users/login');
});

module.exports = router;
