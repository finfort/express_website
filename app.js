var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var expressValidator = require('express-validator');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
// var multer  = require('multer');
// var upload = multer({ dest: './public/images/uploads' });
var flash = require('connect-flash');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var busboy = require('connect-busboy');


var monk = require('monk')('sa:1@ds035633.mongolab.com:35633/express_website_db');



var db = mongoose.connection;



var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));// for parsing application/x-www-form-urlencoded

app.use(busboy());




app.locals.moment = require('moment');

app.locals.truncateText = function(text,length){
  if(text)
   text = text.substring(0,length);
  return text;
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');




// Handle express sessions
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));


// Pasport
app.use(passport.initialize());
app.use(passport.session());



// Validator
// In this example, the formParam value is going to get morphed into form body format useful for printing.
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));



app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));






// Flash
app.use(flash());


// Connect - flash
app.use(require('connect-flash')());
app.use(function(req,res,next){
  res.locals.messages = require('express-messages')(req,res);
  next();
});


// Set db variable to accessible everywhere
app.use(function(req,res,next){
  req.db = db;
  next();
  
});

app.get('*', function(req,res, next){
  
  res.locals.user = req.user || null;
  next();
  
});

var routes = require('./routes/index');
var about = require('./routes/about');
var users = require('./routes/users');
var contact = require('./routes/contact');
var members = require('./routes/members');
var posts = require('./routes/posts');
var categories = require('./routes/categories');


app.use('/', routes);
app.use('/about',about);
app.use('/users', users);
app.use('/contact', contact);
app.use('/members', members);
app.use('/posts', posts);
app.use('/categories', categories);





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
