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
// var bodyParser = require('body-parser');
 
// var multer  = require('multer');
// var upload = multer();

var Busboy = require('busboy');

// var formidable = require('formidable')


var User = require('../models/user');


//router.use(express.bodyParser());
//router.use(express.urlencoded());
//router.use(express.json());
//var urlencodedParser = bodyParser.urlencoded({extended: false } );

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});


router.get('/register', function (req, res, next) {

  res.render('register', {
    "title": "Register"
  });
});



router.get('/login', function (req, res, next) {

  res.render('login', {
    "title": "Login"
  });
});

  var name;
  var email;
  var username;
  var password;
  var password2;
  var errors = [];    
  

router.post('/register', function (req, res, next) {

  var profileImageName;

  
  var fstream;
  var result = [];
  var number_of_files = 1;
  var counter = 0;

  // email = req.params.email;
  // password = req.body.password;

  var busboy = new Busboy({ headers: req.headers });
  busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
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
      profileImageName = result;
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
    if (fieldname == "name")
      name = val;
    if (fieldname == "email")
      email = val;
    if (fieldname == "username")
      username = val;
    if (fieldname == "password")
      password = val;
    if (fieldname == "password2")
      password2 = val;
      
    //check_errors();


  });
  
  busboy.on('finish', function () {
    console.log('Done parsing form!');
    //res.writeHead(303, { Connection: 'close', Location: '/' });
    //res.end();
  });

  req.pipe(busboy);// carefull closing busboy
    
  if (!profileImageName)
    profileImageName = 'noimage.png';
    
    //form validation
    // req.check('name', 'Name field is required').notEmpty();
    // req.check('email', 'Email field is required').notEmpty();
    // req.check('email', 'Email not valid').isEmail();
    // req.check('username', 'Username field is required').notEmpty();
    // req.check('password', 'Password field is required').notEmpty();
    // req.check('password2', 'Passwords do not match').equals(password);
  

    
    
    //if(name && email && username && password && password2){
      setTimeout( function(){
      check_errors();
    
      // Check for errors
      //var errors = req.validationErrors();
      if (errors.length > 0) {
        res.render('register', {
          errors: errors,
          name: name,
          email: email,
          username: username,
          password: password,
          password2: password2
        });
  
      } else {
        console.log('cool creating user');
        // create User if all Ok
        var newUser = new User({
          name: name,
          email: email,
          username: username,
          password: password,
          profileimage: profileImageName
        });
  
        User.createUser(newUser, function (err, user) {
          if (err) throw err;
          console.log(user);
        });
    
        // Success Message
        req.flash('success', "You are now regestered and may log in");
  
        res.location('/');
        res.redirect('/');
  
      }
      
      }, 1000);
    //}else{
      //check_errors();
    //}

});

 function check_errors() {
    if (name == "") {
      errors[0] = "Name field is required";
    }
    if (email == "") {
      errors[1] = "Email field is required";
    }
    if (username == "") {
      errors[2] = "Username field is required";
    }
    if (password == "") {
      errors[3] = "Password field is required";
    }
    if (password !== password2) {
      errors[4] = "Passwords do not match";
    }
  }

passport.serializeUser(function (user, done) {
  done(null, user.id);
});


passport.deserializeUser(function (id, done) {
  User.getUserById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function (username, password, done) {

    User.getUserByUsername(username, function (err, user) {
      if (err) throw err;
      if (!user) {
        console.log("Unknown user");
        return done(null, false, { message: "Uknown user" });
      }
      User.comparePassword(password, user.password, function (err, isMatch) {
        if (err) throw err;
        if (isMatch) {
          return done(null, user);
        } else {
          console.log('Invalid Password');
          return done(null, false, { message: 'Invalid Password' });
        }
      });
    });
  }
  ));

router.post('/login', passport.authenticate('local', { failureRedirect: '/users/login', failureFlash: "Invalid username or password" }), function (req, res) {
  console.log("Authentication successful");
  req.flash("success", "You are logged in");
  res.redirect('/');
});

router.get('/logout', function (req, res, next) {
  req.logout();
  req.flash("success", "You have logged out");
  res.redirect('/users/login');
});

module.exports = router;
