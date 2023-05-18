const jwt = require('jsonwebtoken');
const USER = require('../models/users');
const auth=async(req,res,next)=>{   
try{
    //This line will remove the 'Bearer' word on the token given by req.header
    //thus if req.header is not provided, it'll return an error.
    const token= req.header("Authorization").replace('Bearer ','')
    const decoded=jwt.verify(token,'thisismysecret')
    // console.log(token);
    const user=await USER.findOne({_id:decoded._id,'tokens.token':token}) //find a user whose id in the collection matches the decoded id, and which has this token value
    if(!user){ //if it fails, then no user found
        throw new Error({error:"Not found: "})
    }
    req.token=token
    req.user=user //else, set the req.smthing =requested-user (user)
    next()
}catch(e){ //else, this error
    res.status(401).send({error:"Please authenticate: "+e})
}
}
module.exports=auth
//auth sould be added as a parameter inbetween the route link and the callback fxns in route/users.js