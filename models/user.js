var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var db = mongoose.connection;


mongoose.connect('mongodb://sa:1@ds035633.mongolab.com:35633/express_website_db')
// User Schema
var UserSchema = mongoose.Schema({
	username:{
		type: String,
		index: true
	},
	password:{
		type: String, bcrypt: true, required: true
	},
	email: {
		type: String
	},
	name: {
		type: String
	},
	profileimage: {
		type: String
	}
	
	
});

var User = module.exports = mongoose.model('User', UserSchema);


module.exports.createUser = function(newUser, callback){
	bcrypt.hash(newUser.password, 10, function(err,hash){
		if(err) throw err;
		//Set hashed password
		newUser.password = hash;
		//create user
		newUser.save(callback);
	});
	
}