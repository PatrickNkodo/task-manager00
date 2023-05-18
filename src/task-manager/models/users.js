const mongoose = require('../db/mongoose'); //import the CONNECTION FILE. NOT mongoose module
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Task=require('../models/task')

const userSchema = new mongoose.Schema({
	//the collection name will be created with the model name in plural, and in lower case
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		unique: true, //should'nt have 2 users with the same email. To work, add option autoIndex:true to mongoose.connect
		lowercase: true,
		trim: true //remove spaces between
		//
	},
	pass: {
		type: String,
		minlength: 7,
		trim: true,
		validate(value) {
			if (value.toLowerCase().includes('password')) {
				throw new Error("Pass can't contain 'password'");
			} else if (value.length < this.minlength) {
				throw new Error('Password should be greater than ' + this.minlength);
			}
		}
	},
	age: {
		type: String,
		// default: 0,
		validate(value) {
			if (value < 0) {
				throw new Error('Age must be a Positiive number');
			}
		}
	},
	avatar:{
		type:Buffer
	},
	tokens: [
		{
			token: {
                type:String,
                required:true
            }
		}
	],
	/*  FROM THE BELOW VIRTUAL FXN, THIS IS THEN CREATED VIRTUALLY, JUST TO LINK THE 2 MODELS
	tasks:{
		{
	ref:"Task", 
	localField:'_id',
	foreignField:'owner'
	}
	*/
},{ //options
	timestamps:true
});

//this creates this object virtually in the model(tasks), to create a xship between the ref(Task) and the current model(User)
userSchema.virtual('tasks', //tasks is the name provided to consider the virtual fxn at populate()
{
	ref:"Task",  //model's collection with which to establish relationship 
	localField:'_id',//name of the field on this model's collection
	foreignField:'owner'//name of the field, on the other model's collection(Tasks model), which is called {localModel} on this  model's collection
	// strictPop
}) //create a virtual prpperty to find xships with other db
//toJSON is always called if its object has been stringified. In our case, res.send() from /routes/users stringifies objects automatically, so it'll run this
//all functions in users.js with the send() function will run this method, thus, will hide the defined fields
userSchema.methods.toJSON= function(){
	const user=this //calling the object (though it's stringified)
	const userObject=user.toObject() //set user to an object to access the properties
	//fields to delete when sending the response, to hide slowing or prive data
	delete userObject.pass
	delete userObject.tokens
	delete userObject.avatar

	return userObject;
}
userSchema.methods.generateAuthToken = async function() {
//we did't use arrow fxn bcs it doesn't consider 'this'
	const user = this; //this=fxn caller = const user from routes where the fxn is called
	// console.log(user);

    //provide two parameters, a unique identifier(id here) and a secret key
	const token = jwt.sign({ _id: user._id.toString() }, 'thisismysecret'); //convert id to string first bcs its a 
        const decoded=jwt.verify(token,process.env.SECRET)
        // console.log("decoded version: "+decoded._id);
    //setting the value of token from the userSchema
    user.tokens=user.tokens.concat({token}) //concat joins 2 arrays (user.tokens from userSchema & [{token:token}])
    await user.save() //save this token on this user data a
	return token;
};

userSchema.statics.findByCredentials = async (email, pass) => {
	const user = await User.findOne({ email }); //Fetch user from db having this email
	if (!user) {
		throw new Error('Email not existing in db'); //The email doesn't exist in db
	}
	//continuing here means the user has been found
	const match = await bcrypt.compare(pass, user.pass); //compare entered password with the ecrypted one found in the db
	if (!match) {
		throw new Error('Wrong password');
	}
	return user; //give this as successful result output
};
//userSchema uses pre (before) and post (after)
//so we're asking to execute the hashing before the save fxn
userSchema.pre('save', async function(next) {
	const user = this; //gives access to the user about to be saved, form where the fxn is called
	//checking if password has been changed in a request using this model
	if (user.isModified('pass')) {
		//encrypt its value if the "pass" parameter was modified/created, so as to have a new ecrypted value, if modified
		user.pass = await bcrypt.hash(user.pass, 8); //8 is the recommended number of times to encrypt
	}
	next(); //continue your operations
});

//Delete all user tasks for a user when he deletes his profile
//.pre('deleteOne') will execute when it finds a remove endpoint in ../router/users
userSchema.pre('deleteOne',{document:true,query:false},async function(next){
	const user=this //call the user
	console.log(user._id);
	await Task.deleteMany({owner:user._id}) //delete tasks where owner==user._id
	next() //continue the request
})
//Defining the model
const User = mongoose.model('User', userSchema); //The model saves data in a collection having this name in plural and lowercase (users) in the db
module.exports = User;
