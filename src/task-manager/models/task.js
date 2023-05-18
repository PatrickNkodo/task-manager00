const mongoose=require('mongoose') //without connecting it to the db, it will show an error 
//Error: MongooseError: Operation ... buffering timed out after 10000ms
const taskSchema=new mongoose.Schema({
    description:{type:String,required:true,trim:true},
    completed:{type:Boolean,default:false},
    owner:{
        type:mongoose.Schema.Types.ObjectId, //type should have an Id as value
        required:true,
        ref:"User" //as written in the /models/users. It creates a link with the ref model to fetch all information provided a parameter of the defined ref(ex:_id)
    }
},{timestamps:true})
const Task=mongoose.model('Task',taskSchema)
module.exports=Task