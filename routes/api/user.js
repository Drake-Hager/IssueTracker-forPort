import express from 'express';
const router = express.Router();
import debug from 'debug';
const debugUser = debug('app:User');
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import {validBody} from '../../middleware/validBody.js'
import { validID } from '../../middleware/validID.js';
import { hasPermission, isLoggedIn, fetchRoles, mergePermissions, hasRole } from '@merlin4/express-auth';
import { list,pipeline, insert, filter, update, filterById, deletion, filterByIdWithObjID, findRoleByName, issueAuthCookie, issueAuthToken} from '../../database.js';
import Joi from 'joi';



const newId = (str) => new ObjectId(str);

const objectSchema = Joi.object({ 
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  givenName: Joi.string().required(),
  familyName: Joi.string(),
  role: Joi.string(),
  fullName: Joi.string(),
  creationDate: Joi.date(),
  lastUpdated: Joi.date()
});
const updateObjectSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string(),
  givenName: Joi.string(),
  lastName: Joi.string(),
  fullName: Joi.string(),
  creationDate: Joi.date(),
  lastUpdated: Joi.date()
})
const loginSchema = Joi.object({
email: Joi.string().email().required(),
password: Joi.string().required()
});

//You must list the static routes before the dynamic routes

 //app.use(express.urlencoded({ extended: false}));

router.get('', async (req, res) =>{
  let { keywords, role, minAge, maxAge, sortBy, pageSize, pageNumber } = req.query;
  const match = {};  //match is the filter
  let sort = {givenName:1}; 
  console.log(`minage: ${minAge}`)
  try{    
   
    if(keywords){match.$text = {$search: keywords};}
    if(role){match.role = role}    
    const currentDate = new Date()
    if (minAge && maxAge) {
      const minBirthDate = new Date(currentDate - parseInt(minAge)  * 24 * 60 * 60 * 1000); // Maximum date for `minAge`
      const maxBirthDate = new Date(currentDate - parseInt(maxAge) * 24 * 60 * 60 * 1000); // Minimum date for `maxAge`
      match.creationDate = { $gte: minBirthDate, $lte: maxBirthDate };
    } else if (minAge) {
      const maxBirthDate = new Date(currentDate - parseInt(minAge) * 24 * 60 * 60 * 1000);
      match.creationDate = { $lte: maxBirthDate }; 
    } else if (maxAge) {
      const minBirthDate = new Date(currentDate - parseInt(maxAge) * 24 * 60 * 60 * 1000);
      match.creationDate = { $gte: minBirthDate }; // Adjusted operator
    }

switch(sortBy){
  case "familyName": sort = {familyName : 1, givenName : 1, creationDate : 1};break;
  case "givenName": sort = {givenName : 1, familyName : 1, creationDate : 1};break;
  case "role": sort = {role : 1, givenName : 1, familyName : 1, creationDate : 1};break;
  case "newest": sort = {creationDate : -1};break;
  case "oldest": sort = {creationDate : 1};break;
}
  if(req.auth){
    debugUser(req.auth)
  }
  console.log(`Match.age = ${JSON.stringify(match.creationDate)}`)
    pageNumber = parseInt(pageNumber) || 1;
    pageSize = parseInt(pageSize) || 10;
    const skip = (pageNumber - 1) * pageSize;
    const limit = pageSize;
    const pipeliney = [{$match:match}, {$sort: sort}, {$skip: skip}, {$limit: limit}];
    const cursor = await pipeline('Users', pipeliney);
    const users = await cursor.toArray()

     res.status(200).json(users);
}catch(e){
  console.log(`error data: ${e}`)
}});

router.get('/me', async (req, res)=>{
  try{
    const match = {};
    const loggedInUser = req.auth
    match.email = loggedInUser.email
    debugUser(match.email)
    const pipeliney = [{$match:match}];
    const cursor = await pipeline('Users', pipeliney)
    const user = await cursor.toArray()
    res.status(200).json(user)
    debugUser('router.get.me')
  }catch(e){
    debugUser(e)
  }
});

router.patch('/me',validBody(updateObjectSchema), async(req, res)=>{
  try{
    const userSearch = await filterById('Users', req.auth._id)
    debugUser(userSearch)
    const userToUpdate = req.body;
    const edits = {};
    if(userToUpdate.password){
      const passwordMatch = await bcrypt.compare(userToUpdate.password, userSearch.password)
    if(!passwordMatch){
      userToUpdate.password = await bcrypt.hash(userToUpdate.password, 10)
    }}
    
    
    userToUpdate.lastUpdatedOn = new Date().toDateString();
    userToUpdate.lastUpdatedBy = req.auth.email;
   const user = await update('Users', req.auth._id, userToUpdate);
    edits.target = user._id;
    edits.update = userToUpdate;
    edits.auth = req.auth;
    edits.col = "user";
    edits.op = "update";
    edits.timeStamp = new Date().toDateString();
    await insert('Edits', edits)
    const userSearchTwo = await filterById('Users', req.auth._id)
    const jwt = issueAuthToken(userSearchTwo);
    issueAuthCookie(res, jwt);
    res.status(200).json('Profile successfully updated')
    debugUser('router.put.me')
  }catch(e){
    debugUser(e)
  }
})

router.post('', async (req,res) => {
    //Req object has a body property that contains the data sent by the client
    try{
      console.log('REGISTER ROUTE HIT')
    const newUser = req.body;
    const searchUser = await filter("Users", newUser.email)
    let edits = {};
    newUser.password = await bcrypt.hash(newUser.password, 10);

    if(searchUser && searchUser.email == newUser.email){
        res.status(400).send('User already exists')
    }
    else{
    newUser.creationDate = new Date();
    if(!newUser.role){
      newUser.role = ['Developer']
    }
    
      const result = await insert("Users", newUser);
      edits.timeStamp = new Date().toDateString();
    edits.col = 'user'
    edits.op = 'insert';
    edits.target = result._id;
    edits.update = newUser;
      const editResult = await insert("Edits", edits)
      debugUser(editResult)
        //Generate JWT
        const jwtToken = await issueAuthToken(newUser);
        await issueAuthCookie(res, jwtToken);
        res.status(200).send({message: "User Successfully created",
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
          firstName: newUser.firstName,
          lastName: newUser.lastName

        })
     
      }
  }catch(e){
    debugUser(e);
}
});

router.post('/login' ,validBody(loginSchema), async (req,res)=> {
  debugUser(`Login Route Hit!`);
  const user = req.body;
    try{
    const searchUser = await filter('Users', user.email);
    debugUser(`Search User Password: ${JSON.stringify(searchUser.password)} and User Password ${user.password}`);
    const passwordMatch = await bcrypt.compare(user.password, searchUser.password);
      if(passwordMatch && searchUser){
        debugUser(`Username and Password GOOD!`)
        const jwtToken = await issueAuthToken(searchUser)
        await issueAuthCookie(res, jwtToken);
        res.status(200).json({message:'User logged in successfully',
          role: searchUser.role,
          email: searchUser.email,
          _id: searchUser._id
        })
        debugUser(searchUser.role)
      }else{
        res.status(401).send('Invalid credentials. Please try again')
      }}catch(e){
     debugUser(e);
  }
});

router.get('/:userId', isLoggedIn(),hasRole(...['Developer', 'Business Analyst', 'Project Manager', 'Technical Manager', 'Quality Analyst']), validID('userId'), async (req, res)=>{
  const id = req.userId;
  const userList = await filterByIdWithObjID('Users', id);
  debugUser(userList)
  if(userList){
    res.json(userList).status(200);
    debugUser('router.get.userId')
}else{
  res.status(404).send('User not found')}
});

router.patch('/:userId',isLoggedIn(), validID('userId'),validBody(updateObjectSchema), async (req,res)=>{
  const id = req.userId;
  const updatedUser = req.body;
  let edits = {};
  const userToUpdate = await filterById('Users', id);
  if(userToUpdate){
    updatedUser.lastUpdated = new Date().toDateString();
    updatedUser.lastUpdatedBy = req.auth.email;
    if(updatedUser.password){
      const passwordMatch = await bcrypt.compare(updatedUser.password, userToUpdate.password);
      if(!passwordMatch){
        updatedUser.password = await bcrypt.hash(updatedUser.password, 10)
      }
    } 
    const user = update('Users', id, updatedUser);
    edits.timeStamp = new Date().toDateString();
    edits.col = "user";
    edits.op = "update";
    edits.target = user._id;
    edits.update = updatedUser;
    edits.auth = req.auth;
    insert('Edits', edits)
    const userSearch = await filterByIdWithObjID(id);
    const jwt = await issueAuthToken(userSearch);
    await issueAuthCookie(res, jwt)
    res.status(200).send(`User ${id} updated successfully`);
    debugUser('router.patch.userId')
 } else{
    res.status(404).send('User not found')
  }
});

router.delete('/:userId',isLoggedIn(), hasRole(...['Technical Manager']), validID('userId'), async (req,res)=>{
  const id = req.userId;
  const loggedInUser = req.auth;
  let edits = {};
  const userToDelete = await filterById('Users', id);
  try{
    if(userToDelete){
      deletion('Users', id);
      edits.timeStamp = new Date().toDateString();
      edits.col = "user";
      edits.op = "delete";
      edits.target = loggedInUser._id;
      edits.auth = loggedInUser;
    insert('Edits', edits)
    res.status(200).send(`User ${id} deleted successfully`)
    debugUser('router.delete.userId')
  }else{
    res.status(404).send('User not found')
  }
  }catch(e){
    debugUser(e);
  }
  
});

  
export  {router as userRouter};