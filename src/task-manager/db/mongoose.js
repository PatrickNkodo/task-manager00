//This is the connection file
const dotenv=require('dotenv').config()
const mongoose = require('mongoose');
try{
    mongoose.connect(process.env.mongoDB,{dbName:'Task-Manager', autoIndex:true});
}catch(e){
    console.log('Error'+e);
}
module.exports=mongoose

