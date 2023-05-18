//The three lines below can be destructured as
function execute() {
	const mongoDb = require('mongodb'); //npm module to interact with db
	// const mongoClient = mongoDb.MongoClient;
	// const ObjectID = mongoDb.ObjectID;
	const {MongoClient,ObjectID}=require('mongodb')

const id = new ObjectID(); //this is a way to create an ObjectID //works on v 3.1.10
console.log('Id: '+id.toHexString().length); //it has this method integrated, to become used as _id
const connectionUrl = 'mongodb://127.0.0.1:27017'; //127.0.0.1 is localhost ip. Better use IP for performance reasons
const databaseName = 'Task-Manager'; //any name

//connection
MongoClient.connect(connectionUrl, { useNewUrlParser: true }, (error, client) => {
	if (error) {
		return console.log('Unable to connect to database');
	}
	console.log('Connected');
	//THE CRUD OPERATIONS AFTER CONNECTION

    //Run them one by one to see the application
	const db = client.db(databaseName); //defining the database
	//Inserting a record to database, in the 'users' collection
	db.collection('users').insertOne({
		//insertOne inserts only one document into the collection (table)
		// _id:id,    //this line can be enabled to set -id manually
		name: 'Andrew',
		age: 17
	}, (error, res) => {
		if (error) {
			return console.log('Unable to insert user',error);
		}
		console.log(res.ops); //ops returns an array of documents(records)
	});
// 	db.collection('users').insertMany([
// 		//insertMany inserts many documents in one request
// 		{
// 			name: 'John',
// 			age: 40
// 		},
// 		{
// 			name: 'Mary',
// 			age: 32
// 		}
// 	], (error, res) => {
// 		if (error) {
// 			return console.log('Error: Unable to insert');
// 		}
// 		console.log(res.ops);
// 	});
// 	//Reading only one document from a collection
// 	db.collection('users').findOne({ id: new ObjectID('document_id') }, (error, user) => {
// 		if (error) {
// 			//NOTE: Not returning a value because it wasn't found will not run the error condition
// 			return console.log('Unable to fetch');
// 		}
// 		console.log(user);
// 	});
//     //Reading multiple documents from a collection
// 	db.collection('users').find({ age: 20 }).toArray((error, users) => {
// 		if (error) {
// 			return console.log('Error:', error);
// 		}
// 		console.log(users);
// 	});
// 	//Update  only one document from a collection
// 	db.collection('users').updateOne({_id: new ObjectID('copied_id')},
// 		{$set: { name: 'New_name' }}
//     //or {$count: { age: 1 }} //increment age by 1
// 	).then((res)=>{  //its same as putting db.collection in a var, then saying : var.then(()=>{})
//         console.log(res);
//     }).catch((e)=>{console.log(e);})
//     //Update  for multiple documents of a collection
//     db.collection('users').updateMany({
//         age:20
//     },{$set:{age:30}}).then((res)=>{
//         console.log(res);
//     }).catch((e)=>{
//         console.log('Error:'+e);
//     })
//     //Delete many documents in a collection
//     db.collection('users').deleteOne({
//         name:'Patrick'
//     }).then((res)=>{console.log(res);})
//     .catch((e)=>console.log(e))
//     //Delete many documents in a collection
//     db.collection('users').deleteMany({name:'Patrick'})
//     .then((res)=>{console.log(res);})
//     .catch((e)=>console.log(e))
});
}
module.exports=execute