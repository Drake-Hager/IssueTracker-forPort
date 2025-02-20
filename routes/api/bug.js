import express from 'express';
const router = express.Router();

import debug from 'debug';
const debugBug = debug('app:Bug');
import Joi from 'joi';
import { insert,pipeline, update, filterById, filterByTitle } from '../../database.js';
import {validBody} from '../../middleware/validBody.js'
import { validID } from '../../middleware/validID.js';
import { hasPermission, hasRole, isLoggedIn } from '@merlin4/express-auth';

const objectSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  stepsToReproduce: Joi.string().required(),
  creationDate: Joi.date(),
  classification: Joi.string(),
  assignedToUserId: Joi.string(),
  assignedToUserName: Joi.string(),
  assignedOn: Joi.date(),
  closed: Joi.string(),
  closedOn: Joi.date(),
  lastUpdated: Joi.date()
});
const updateObjectSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string(),
  stepsToReproduce: Joi.string(),
  creationDate: Joi.date(),
  classification: Joi.string(),
  assignedToUserId: Joi.string(),
  assignedToUserName: Joi.string(),
  assignedOn: Joi.date(),
  status: Joi.string(),
  lastUpdated: Joi.date(),
  role: Joi.string()
})
const classSchema = Joi.object({
  classification: Joi.string().required()
});
const assignSchema = Joi.object({
  assignedToUserId: Joi.string().required(),
  assignedToUserName: Joi.string().required()
});
const closeSchema = Joi.object({
  closed: Joi.string().required(),
});
const reportSchema = Joi.object({
  report: Joi.string().required()
})


router.get('', async (req, res)=>{
  let {keywords, classification, minAge, maxAge, closed, sortBy, pageNumber, pageSize} = req.query
  let match = {}
  let sort = {createdBy:1};
debugBug(`req.auth: ${JSON.stringify(req.auth)}`)
  try{
    if(keywords){match.$text = {$search: keywords};}
    if(classification){match.classification = classification}
    if(closed){match.closed = true}
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
  case "newest": sort = {creationDate: 1};break;
  case "oldest": sort = {creationDate: -1};break;
  case "title": sort = {title: 1, creationDate:1};break;
  case "classification": sort = {classification: 1, creationDate: 1};break;
  case "assignedTo": sort = {assignedToUserName: 1, creationDate: 1};break;
  case "createdBy": sort = {createdBy: 1, creationDate: 1}
}
    pageNumber = parseInt(pageNumber) || 1;
    pageSize = parseInt(pageSize) || 10;
    const skip = (pageNumber - 1) * pageSize;
    const limit = pageSize;
    const pipeliney = [{$match:match}, {$sort: sort}, {$skip: skip}, {$limit: limit}];
    const cursor = await pipeline('Bugs', pipeliney);
    const users = await cursor.toArray()
     res.status(200).json(users);
}catch(e){
  debugBug(e)
}});

router.post('', hasRole(...['Developer', 'Business Analyst', 'Project Manager', 'Technical Manager', 'Quality Analyst']), validBody(objectSchema), async (req, res)=>{
  const newBug = req.body;
  let edits = {};
  const buggy = await filterByTitle('Bugs', newBug.title);
if(buggy && buggy.title == newBug.title){
  res.status(400).send(`Bug ${buggy.title} is already registered`)
}else{ 
    
    newBug.creationDate = new Date().toDateString();
    newBug.author = req.auth.email;
    newBug.classification = "unclassified";
    newBug.closed = false;
    const bug = await insert('Bugs', newBug);

    edits.timeStamp = new Date().toDateString();
    edits.col = "bug";
    edits.op = "insert";
    edits.target = bug._id
    await insert('Edits', edits)
    console.log(newBug)
    res.status(200).send(`New bug: ${newBug.title} has been successfully added.`)
  }
});

router.patch('/:bugId/classify',isLoggedIn(), validID('bugId'),validBody(classSchema), async (req, res) =>{
  const id = req.bugId
  const classy = req.body;
  const bugSearch = await filterById('Bugs', id);
  let edits = {};
  if(bugSearch){

      if(req.auth.permissions.canClassifyAnyBug == true){

    classy.lastUpdated = new Date().toDateString();
    classy.classifiedOn = new Date().toDateString();
    classy.classifiedBy = req.auth.email;
    const bug = await update('Bugs', id, classy);
    edits.timeStamp = new Date().toDateString();
    edits.col = "bug";
    edits.op = "update";
    edits.target = bug._id;
    edits.update = classy;
    edits.auth = req.auth;
    insert('Edits', edits)
   res.status(200).send('Bug classified!')
      }
      if(req.auth.permissions.canEditIfAssignedTo == true){
        if(bugSearch.assignedToUserId == req.auth._id){
classy.lastUpdated = new Date().toDateString();
    classy.classifiedOn = new Date().toDateString();
    classy.classifiedBy = req.auth.email;
    const bug = await update('Bugs', id, classy);
    edits.timeStamp = new Date().toDateString();
    edits.col = "bug";
    edits.op = "update";
    edits.target = bug._id;
    edits.update = classy;
    edits.auth = req.auth;
    insert('Edits', edits)
   res.status(200).send('Bug classified!')
        }else{
          res.status(401).json(`Bug is not assigned to you`)
        }
        
      }
      if(req.auth.permissions.canEditMyBug == true){
        if(bugSearch.createdBy == req.auth.email){
          classy.lastUpdated = new Date().toDateString();
    classy.classifiedOn = new Date().toDateString();
    classy.classifiedBy = req.auth.email;
    const bug = await update('Bugs', id, classy);
    edits.timeStamp = new Date().toDateString();
    edits.col = "bug";
    edits.op = "update";
    edits.target = bug._id;
    edits.update = classy;
    edits.auth = req.auth;
    insert('Edits', edits)
   res.status(200).send('Bug classified!')
        }
      }
  }else{
    res.status(404).send(`Bug ${id} not found`)
  }
});

router.put('/:bugId/assign',isLoggedIn(), validID('bugId'),validBody(assignSchema), async (req, res) =>{
const id = req.bugId;
const bugToAssign = req.body;
const bugSearch = await filterById('Bugs', id);
let edits = {};

  const user = await filterById('Users', bugToAssign.assignedToUserId);
  if(!user){
    res.status(400).send('User not found')
  }
  if(bugSearch){
      if(req.auth.permissions.canReassignAnyBug == true){
        bugToAssign.assignedToUserId = user._id;
bugToAssign.assignedToUserName = user.fullName;
bugToAssign.assignedOn = new Date().toDateString();
bugToAssign.assignedBy = req.auth.email;
bugToAssign.lastUpdated = new Date().toDateString();
await update('Bugs', id, bugToAssign);
const bugSearch2 = await filterById('Bugs', id)
edits.timeStamp = new Date().toDateString();
edits.col = "bug";
edits.op = "update";
edits.target = bugSearch2._id;
edits.update = bugToAssign;
edits.auth = req.auth;
insert('Edits', edits)
res.status(200).send('Bug assigned!')
      }
      if(req.auth.permissions.canReassignIfAssignedTo == true){
        if(bugSearch.assignedToUserId == req.auth._id){
          bugToAssign.assignedToUserId = user._id;
bugToAssign.assignedToUserName = user.fullName;
bugToAssign.assignedOn = new Date().toDateString();
bugToAssign.assignedBy = req.auth.email;
bugToAssign.lastUpdated = new Date().toDateString();
await update('Bugs', id, bugToAssign);
const bugSearch2 = await filterById('Bugs', id)
edits.timeStamp = new Date().toDateString();
edits.col = "bug";
edits.op = "update";
edits.target = bugSearch2._id;
edits.update = bugToAssign;
edits.auth = req.auth;
insert('Edits', edits)
res.status(200).send('Bug assigned!')
        }else{
          res.status(401).json(`This bug is not assigned to you`)
        }
      }
      if(req.auth.permissions.canEditMyBug == true){
        if(bugSearch.createdBy == req.auth.email){
          bugToAssign.assignedToUserId = user._id;
bugToAssign.assignedToUserName = user.fullName;
bugToAssign.assignedOn = new Date().toDateString();
bugToAssign.assignedBy = req.auth.email;
bugToAssign.lastUpdated = new Date().toDateString();
await update('Bugs', id, bugToAssign);
const bugSearch2 = await filterById('Bugs', id)
edits.timeStamp = new Date().toDateString();
edits.col = "bug";
edits.op = "update";
edits.target = bugSearch2._id;
edits.update = bugToAssign;
edits.auth = req.auth;
insert('Edits', edits)
res.status(200).send('Bug assigned!')
        }else{
          res.status(401).json(`This Bug is not yours`)
      }}

}else{
  res.status(404).send(`Bug ${id} not found`)
}
});

router.patch('/:bugId/close',isLoggedIn(), hasRole(...['Business Analyst']), validID('bugId'),validBody(closeSchema), async (req, res)=>{
  const id = req.bugId;
  const bugToClose = req.body;
  let edits = {};
  const bugSearch = await filterById('Bugs', id);
  if(bugSearch){
      bugToClose.closedOn = bugToClose.closedOn || new Date();
      bugToClose.lastUpdated = bugToClose.lastUpdated || new Date();
      update('Bugs', id, bugToClose);
      const bug = await filterById('Bugs', id);
      edits.timeStamp = new Date().toDateString();
      edits.col = "bug";
      edits.op = "update";
      edits.target = bug._id;
      edits.update = bugToClose;
      edits.auth = req.auth;
      res.status(200).send('Bug Closed!')
  }else{
    res.status(404).send(`Bug ${id} not found`)
  }
});

router.patch('/:bugId/report',isLoggedIn(),validBody(reportSchema), validID('bugId'), async (req, res) =>{
const id = req.bugId;
const report = req.body;
if(id && report){
  await update('Bugs', id, report)
  res.status(200).json('Successfully reported');
}else{
  res.status(404).json('There was an error')
}
})

router.patch('/:bugId',isLoggedIn(), validID('bugId'),validBody(updateObjectSchema), async (req, res)=>{
const id = req.bugId;
const bugToUpdate = filterById('Bugs', id);
const updatedBug = req.body;
const edits = {};
console.log('PATCH ROUTE HIT')
if(bugToUpdate){
      updatedBug.lastUpdatedOn = new Date().toDateString();
  updatedBug.lastUpdatedBy = req.auth.email;
 const bug = update('Bugs', id, updatedBug);
  edits.timeStamp = new Date().toDateString();
  edits.col = "bug";
  edits.op = "update";
  edits.target = bug._id;
  edits.update = updatedBug;
  edits.auth = req.auth;
  insert('Edits', edits)
    res.status(200).send(`Bug ${id} successfully updated`)
}else{
  res.status(400).type('text/plain').send('Bug not found')
}}
);
router.get('/:bugId',isLoggedIn(), hasRole(...['Developer', 'Business Analyst', 'Project Manager', 'Technical Manager', 'Quality Analyst']), validID('bugId'),  async (req, res)=>{
  const id = req.bugId;
  debugBug(req.auth)
  const bugToFind = await filterById('Bugs', id);
  if(bugToFind){
    res.status(200).json(bugToFind)
  }else{
    res.status(404).type('text/plain').send(`Bug ${id} not found.`)
  }
});


export {router as bugRouter}