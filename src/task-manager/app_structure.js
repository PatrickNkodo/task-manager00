// const dotenv=require('dotenv').config()
const User = require('./models/users')
const Task = require('./models/task')

    const express=require('express')
    const userRouter=require('./routers/users')
    const taskRouter=require('./routers/task')
    const bcrypt= require('bcrypt')
    const app=express()

    const port=process.env.PORT
//app.use(express.json()) parses all incomming json from postman to an object
//use this mode when a file is provided online/by postman at a defined url
    app.use(express.json())
    //While app.use(express.static(folder)) serves the file
    app.use(userRouter) 
    app.use(taskRouter) 
   

    const multer=require('multer')
    const upload=multer({
        dest:'images', //destination folder for the files
        limts:{
            fileSize:1000000 //filesize is in kb
        },
        fileFilter(req,file,x){
            if(!file.originalname.match(/\.(jpeg|jpg|png)$/)){
                return x(new Error("No match on file"))
            }
            x(undefined,true) //error:undefined,response:true
        }
    })
    //look for a file called upload in the request
    app.post('/upload',upload.single('avatar'), (req,res)=>{
        res.send()
    },(error,req,res,next)=>{ //callback for multer
        res.status(400).send({error:error.message})
    })

    //POPULATE EXAMPLE
   const main=async()=>{ 
    //  const task=await Task.findById('644b16cd378c3b9b8a1b8317') ///here's the id of the task
     //find all information from the provided owner field in the ref db
    // await task.populate('owner') //get all info from the provided ref, having the provided task.owner field
    // console.log(task.owner.name);
    
    const user= await User.findById('644b91a72666dac69c633710') //user id
    await user.populate('tasks') 
    console.log(user.tasks);
   }