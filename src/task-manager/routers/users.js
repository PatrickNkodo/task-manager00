const express = require('express'); //work with the db
const USER = require('../models/users'); //load the User model
const auth = require('../middleware/auth'); //authenticate user
const multer = require('multer'); //upload files
const sharp = require('sharp'); //resize img
const User = require('../models/users');
const router = new express.Router();

/*CREATING END POINTS(PATCH)*/
router.post('/users',async (req, res) => {
	// app.use(express.json()) will parse the req json
	//req gets the file needed, while res uses the recieved file
	const user = new USER(req.body); //provide the object needed through client view and set the object to save
	try {
		//run this if the promise is fullfilled
		//by awaiting it, it will run the next line only if the file has been saved
		const save= await user.save(); //this will first run the 'pre' defind in the model and later save the document
        const token= await save.generateAuthToken() //once save compoleted, execute this 
		res.status(201).send({user,token});
	} catch (e) {
		//run this if the promise failed
		res.status(400).send('Error' + e); //define a status code, and send request
	}
});
/*READING END POINTS(PATCH)*/
//NOTE: DISPOSITION OF THE ROUTES MAY CAUSE ERRORS. EX: IF THIS ROUTE IS AT THE END, THERE WILL BE AN ERROR
router.get('/users/me',auth, async (req, res) => {
    try{
        res.send(req.user) //the req.user is gotten from the auth
    }
    catch(e){res.status(404).send({error:"Auth failed "}+e); }
})

router.get('/users', async (req, res) => {
	try {
		const users = await USER.find({}); ////VERY IMPORTANT to await the result. else: TypeError: Converting circular structure to JSON
		if (!users) {
			res.stauts(404).send('NO DOCUMENTS');
		}
		res.send({users});
	} catch (e) {
		res.status(500).send(e);
	}
});
//Fetch an individial document
router.get('/users/:id', async (req, res) => {
	//must be users/:id and not users/id this won't work without the 2 dots
	const id = req.params.id; //params gets the id parameter from the url
	try {
		const user = await USER.findById(id);
		if (!user) {
			return res.status(404).send("No document with this Id");
		}
		res.send(user);
	} catch (e) {
		res.status(500).send(e);
	}
});
//Fetch all documents
// 

/*UPDATING END POINTS(PATCH)*/

//providing an id to  this link, that'll be used to update a document
router.patch('/users/me', auth,async (req, res) => {
	const updating = Object.keys(req.body); //get the keys of the object provided
	console.log(updating);
	const allowedUpdates = [ 'name', 'email', 'age', 'pass' ];//possible fields to modify
	//Array.every() method returns true if all elements in an array pass a test (provided as a function)
	const validating = updating.every((x) => allowedUpdates.includes(x));
	if (!validating) {
		return res.status(400).send({ error: 'Unfound key from collection' });
	}
	try {
		// each document field updating will run this fxn
		//req.user returns a whole user with all properties, so req.user[field] returns the given property to change
		updating.forEach((update) => {
			req.user[update] = req.body[update];
		});
		await req.user.save(); //this will first run the 'pre' defined in the model and later save the document
		res.send(req.user);
	} catch (e) {
		return res.status(404).send('Error: '+ e);
	}
});

/*DELETING END POINTS(DELETE)*/
router.delete('/users/me', auth,async (req, res) => {
	try {
		//remove() deletes recieved data, findOneAndDelete({field:val}) checks the parameters condition. If found, it deletes 
		await req.user.deleteOne()
		res.send({success:'Deleted user ' + req.user});
	} catch (e) {
		res.status(404).send('Error: '+ e);
	}
});
router.post('/users/login', async (req, res) => {
	try {
		const user = await USER.findByCredentials(req.body.email, req.body.pass); //call the fxn from USER
        const token=await user.generateAuthToken() //it will recieve the user data, and use it to generate the token
        res.status(200).send({user,token})
	} catch (e) { //this e parameter refers to the thrown error
		res.status(404).send('Invalid credentials: '+e);
	}
});

const upload=multer({
	 //destination folder for the files
	limits:{ //limits of the file acceptance
		fileSize:1000000, //(1M byte= 1mb)
	},
	fileFilter(req,file,callback){
		//callback(new Error("File must be a")) //send an error
		//callback(undefined, true) //no error, response expected (true)
		//callback(undefined, false) //no error, but response not expected (false)
		if(!file.originalname.match( /\.(jpg|jpeg|png)$/ )){ //if it ends with .doc|docx
			return callback(new Error("Please, upload a jpg/jpeg/png"))
		}
		callback(undefined,true) // no error, response expected
	}
})

// Add a profile picture
router.post('/users/me/avatar',auth,upload.single("avatar"),async(req,res)=>{
	const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
	req.user.avatar=buffer
	try{
		//this callback's req is called after its last fxn(upload from multler), and the req=> an  object(file) with multler properties
		console.log(req.user);
		//req.user is the return from the auth, which follows the users model, thus, the saving should be done based on its avatar field(req.user.avatar)
	req.user.avatar=req.file.buffer //req.file.buffer is the binary value of the image uploaded, callback from upload
	await req.user.save()
		res.send('Done')
	}catch(e){ res.send('Error:'+e)}
},(error,req,res,next)=>{ //callback for multer
	res.status(400).send({error:error.message})
})

//serving files
router.get('/users/:id/avatar',async(req,res)=>{
	try{
		const user= await User.findById(req.params.id) //get the return value of the search for a document in user collection with id=req.params.id
	if(!user || !user.avatar){
		throw new Errror("No user or image...")
	}
	//by default, res.set is ('Content-Type','application/json')
	res.set('Content-Type','image/jpg') //set the response to an image format
	res.send(user.avatar)
	}catch(e){
		res.send("Error:"+e)
	}
})
// Delete a profile picture
router.delete('/users/me/avatar', auth, async(req,res)=>{
	req.user.avatar=undefined
	await req.user.save()
	res.send(req.user)
})

router.post('/users/me/logout',auth, async(req,res)=>{
	try{
		//remove the token recieved from auth. ie filter req.user.tokens, for it to remove the last token recieved by auth
		req.user.tokens=req.user.tokens.filter((token)=>{
			return token.token !==req.token //this will remove the token of this current user
		})
		user=await req.user.save()
		res.send(user)
	}catch(e){res.status(400).send("Couldn't logout")}
})

router.post('/users/logoutall',auth, async(req,res)=>{
	try{
		req.user.tokens=[]//empty the tokens array 
		await req.user.save()
		res.send( )
	}catch(e){res.status(400).send("Couldn't logout")}
})



module.exports = router;
