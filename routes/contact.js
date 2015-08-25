var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('contact', { title: 'Contact' });
});


router.post('/send', function(req, res, next){
  
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: "anatoliy.ruchka@gmail.com",
      pass: ""
    }
  });
  
  var mailOptions = {
    from: 'Anatolii Ruchka <anatoliy.ruchka@gmail.com>',
    to: 'anatoliy.ruchka@gmail.com',
    subject: 'Website  nodemailer',
    text: "You have new subscription with the following details...Name "+req.body.name+" Email "+req.body.email+" Message " +req.body.message,
    html: '<p>You have new subscription with the following details</p><ul><li>Name '+req.body.name+' </li><li>Email '+req.body.email+' </li><li>Message '+req.body.message+' </li>' 
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      console.log(error);
      res.redirect('/');
    }else{
      console.log('Message sent' + info.response + ' Mail iptions ' + mailOptions.text + " " + mailOptions.to);
      res.redirect('/');
    }
    
  });
  
});

module.exports = router;
