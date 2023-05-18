const express=require('express')
const Task=require('../models/task')
const auth=require('../middleware/auth')
const route=new express.Router()

route.post('/task',auth,async(req,res)=>{
    const task=new Task({
        //owner isn't provided by the user, but by the auth system
        ...req.body,
        owner:req.user._id //this id is for the authenticated user, thus keeping track of tasks of this user
    })
    try{
      await task.save()
      res.status(201).send(task)
    }catch(e){res.status(400).send(e)}
})
route.get('/tasks/:id',auth,async(req,res)=>{
  const id=req.params.id
  try{
    //get the task where id= provided id && owner=req.user._id from the auth
    const task=await Task.findOne({_id:id,owner:req.user._id})
    if(!task){
      return res.send("A Task of yours with this id has not been found")
    }
    res.send(task)
  }catch(e){
    res.send("Error"+e)
  }
})
route.get('/tasks',auth,async(req,res)=>{
  const match={} //defining the object to carry the filtering 
  const sort={}
  //run this condition if req.query.completed is provided, else, match={} (meanig no filter)
  // /users/id => req.params    /users?id=1 => req.query.id
  if(req.query.completed){ //fetch the value of the query completed in the url
    match.completed=req.query.completed==='true'
    // console.log(match);
  }
  if(req.query.sortBy){ //fetch the value of the query completed in the url
    const parts=req.query.sortBy.split(':') //fetch from the url the sortBy param
    //creating a sort object. ie sort.parts[0] =parts[1].
    sort[parts[0]]= parts[1]==='desc'?-1:1 //Now part[1]==='desc'?-1:1 (change its value)
    console.log(sort);
  }
  try{
    //  const tasks=await Task.find({owner:req.user._id}) 
     //req.user fetches from Users model, and will use the virtual 'tasks' obj to find data in the Task's collection where tasks.path==tasks.foreign, 
    //  and return it at var.virtual_obj(tasks), thus tasks.task
     const tasks= await req.user.populate(
       {
         path:'tasks', //this is the object from the collection User model's collection
         match, //define a filtering object in the selection of the results
         options:{
            limit:parseInt(req.query.limit), //comvert the url 'limit' parameter to int, & consider it as the response limit
            skip:parseInt(req.query.skip),
            sort //takes either -1(desc) or 1(asc)
         }
      }) //get the information in the ref model's collection who has a field with the tasks field in the User virtual model
     if(!tasks){
       return res.send("No tasks found")
     } 
     res.send(tasks.tasks)
  }catch(e){
    res.send("Error: "+e)
  }
})
route.patch('/tasks/:id',auth,async(req,res)=>{
  const updating = Object.keys(req.body); //get the keys of the object provided
	const allowedUpdates = [ 'description', 'completed' ]; //possible fields to modify
	//Array.every() method returns true if all elements in an array pass a test (provided as a function)
	const validating = updating.every((x) => allowedUpdates.includes(x));
	if (!validating) {
    return res.status(400).send({ error: 'Unfound key from collection' });
	}
	try {
    const task=await Task.findOne({_id:req.params.id,owner:req.user._id})
    // console.log(task); //this is the user with all the properties
		// each document field updating will run this fxn
    if(!task){
      return res.status(400).send("You've no task with this id")
    }
		//task returns a whole user with all properties, so task[field] returns the given property to change
		updating.forEach((update) => {
			task[update] = req.body[update];
		});
		await task.save(); //this will first run the 'pre' defined in the model and later save the document
		res.send(task);
	} catch (e) {
		return res.status(404).send('Error: '+ e);
	}
})
//delete
route.delete('/tasks/:id',auth,async(req,res)=>{
  const id=req.params.id
  try{
    //get the task where id= provided id && owner=req.user._id from the auth
    const task=await Task.findOneAndDelete({_id:id,owner:req.user._id})
    if(!task){
      return res.send("A Task of yours with this id has not been found")
    }
    res.send({Deleted: task.description})
  }catch(e){
    res.send("Error"+e)
  }
})
module.exports= route