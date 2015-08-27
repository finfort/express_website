var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');

var http = require('http');
var inspect = require('util').inspect,
    path = require('path'),
    os = require('os'),
    fs = require('fs');

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

router.post('/register', function(req,res,next){

  //get from values
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;
  
  
  // console.log(req.body);
  //console.dir(req.files);
  
  var profileImageName;
  
    var fstream;
    var result = [];
    var number_of_files = 1;
    var counter = 0;
    var busboy = new Busboy({ headers: req.headers });
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      counter++;
      console.log("Uploading: " + filename);
      console.log('File [' + file + '] field ' + fieldname + ' ...');
      //Path where image will be uploaded
      if (result.length > 0) {
          var file_type = filename.substr(filename.length - 4);
          filename = result[0].name + '_' + number_of_files + file_type;
          number_of_files++;
      }
      fstream = fs.createWriteStream( "./public/images/uploads/" + filename);
      file.pipe(fstream);
        fstream.on('close', function() {
            counter--;
            console.log("Upload Finished of " + filename);
            result.push(filename);
            console.log("result ",result)
            if(counter == 0){
                console.log("writing finished");
                //res.sendStatus(200);
                
            }
        });
      });
      busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
        console.log('Field [' + fieldname + ']: value: ' + inspect(val));
      });
      busboy.on('finish', function() {
        console.log('Done parsing form!');
        res.writeHead(303, { Connection: 'close', Location: '/' });
        
        res.end();
      });
    // }
    req.pipe(busboy);// carefull closing busboy
    
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
  
  
  // //form validation
  // req.checkBody('name','Name field is required').notEmpty();
  // req.checkBody('email','Email field is required').notEmpty();
  // req.checkBody('email','Email not valid').isEmail();
  // req.checkBody('username','Username field is required').notEmpty();
  // req.checkBody('password','Password field is required').notEmpty();
  // req.checkBody('password2','Passwords do not match').equals(req.body.password);
  
  
  // // Check for errors
  
  // var errors = req.validationErrors();
  
  // if(errors){
  //   res.render('register', {
  //     errors: errors,
  //     name: name,
  //     email: email,
  //     username: username,
  //     password: password,
  //     password2: password2
  //   });
    
  // }else{  
  //   console.log('cool');
  //   // create User if all Ok
  //   var newUser = new User({
  //     name: name,
  //     email: email,
  //     username: username,
  //     password: password,
  //     profileimage: profileImageName
  //   });
   
  //  User.createUser(newUser, function(err, user){
  //    if(err) throw err;
  //    console.log(user);
  //  });
   
   // Success Message
   req.flash('success', "You are now regestered and may log in");
   
   
   res.location('/');
   res.redirect('/'); 
    
  //}
  
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
