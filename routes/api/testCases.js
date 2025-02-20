import express from 'express';
const router = express.Router();
import debug from 'debug';
const debugTestCase = debug('app:TestCases');
import {insert, filter, update,listAndFilter, filterById, deletionByObjId, filterByIdWithObjID, filterByContent, updateByObjId, updateByObjIdExtraSteps } from '../../database.js';
import Joi from 'joi';
import {validBody} from '../../middleware/validBody.js'
import {validID} from '../../middleware/validID.js';
import { hasRole, isLoggedIn } from '@merlin4/express-auth';

const testCaseSchema = Joi.object({
  status: Joi.string().required(), 
  createdBy: Joi.string()
})
const updateTestCaseSchema = Joi.object({
  status:Joi.string(),
  addedBy: Joi.string()
})

router.get('/:bugId/test',isLoggedIn(), hasRole(...['Developer', 'Business Analyst', 'Project Manager', 'Technical Manager', 'Quality Analyst']), validID('bugId'), async (req, res) => {
  const id = req.bugId;
  let bugSearch = await filterByIdWithObjID('Bugs', id);
  //debugTestCase(bugSearch)
  if(!bugSearch){
    res.status(404).send('Bug not found');
  }else{
    
      const testCase = await listAndFilter('TestCases',id)
    debugTestCase(testCase)

    res.status(200).json(testCase)
  }
});

router.post('/:bugId/test',isLoggedIn(),validID('bugId'), hasRole('Quality Analyst'), validBody(testCaseSchema), async(req, res)=>{
const bugId = req.bugId;
const newTest = req.body;
let edits = {};
const bugSearch = await filterByIdWithObjID('Bugs', bugId)
if(!bugSearch){
  res.status(400).json('Bug not found')
}else{
  try{
    //Using bugSearch
    //If there's a bugSearch.testCases array, create a new test case and push the id into that array
    //If there's not a bugSearch.testsCases array, create a new test case and an empty testCases array and push the id onto that array
if(bugSearch.testCases){
newTest.bugId = req.bugId
newTest.createdOn = new Date();
newTest.createdBy = req.body.createdBy || req.auth.email;
console.log(req.auth.email)
const result = await insert('TestCases', newTest); 
debugTestCase(result);
await updateByObjIdExtraSteps('Bugs', bugId,{$push:{testCases:newTest._id}})
}else{
  let tests = [];
  newTest.bugId = req.bugId
newTest.creationDate = new Date().toDateString();
const result = await insert('TestCases', newTest); 
edits.timeStamp = new Date().toDateString();
edits.col = "testcase";
edits.op = "update";
edits.target = result._id;
edits.update = newTest;
edits.auth = req.auth;
await insert('Edits', edits)
debugTestCase(result)
  tests.push(result._id);
  await updateByObjIdExtraSteps('Bugs',bugId, {$push:{testCases: tests}});
}
res.status(200).json('TestCase successfully added!')
  }catch(e){
    debugTestCase(e)
  }
}
});

router.get('/:bugId/test/:testId',isLoggedIn(),validID('bugId'),validID('testId'), hasRole(...['Developer', 'Business Analyst', 'Project Manager', 'Technical Manager', 'Quality Analyst']), async (req, res) =>{
  const bugId = req.bugId;
  const id = req.testId;
  const bugSearch = await filterById('Bugs', bugId);
  if(!bugSearch){
    res.status(404).json('Bug not found');
  }
  let test = bugSearch.testCases;
  let beacon;
  debugTestCase(test)
for(let i = 0; i < test.length; i++){
  if(test[i].toString() == id.toString()){
   beacon = test[i]
  }
}
debugTestCase(beacon)
const result = await filterByIdWithObjID('TestCases', beacon)
res.status(200).json(result)

});

router.patch('/:bugId/test/:testId',isLoggedIn(),validID('bugId'), validID('testId'), validBody(updateTestCaseSchema), hasRole('Quality Analyst'), async (req, res)=> {
  const bugId = req.bugId;
  const id = req.testId;
  const bugSearch = await filterById('Bugs', bugId)
  const testSearch = await filterById('TestCases', id)
  const testForUpdate = req.body;
  const edits = {};
  if(!bugSearch){
    res.status(404).json('Bug not found');
  }
  if(!testSearch){
    res.status(404).json('TestCase not found');
  }
  testForUpdate.lastUpdatedOn = new Date().toDateString();
  testForUpdate.lastUpdatedBy = req.auth.email;
  const testCase = await updateByObjId('TestCases', id, testForUpdate);
  edits.col = "testcase";
  edits.op = "update";
  edits.timeStamp = new Date().toDateString();
  edits.target = testCase._id;
  edits.update = testForUpdate;
  edits.auth = req.auth;
  res.status(200).json('TestCase successfully updated')
});

router.delete('/:bugId/test/:testId',isLoggedIn(), validID('testId'), validID('bugId'), hasRole('Quality Analyst'), async(req, res)=> {
  const bugId = req.bugId;
  const testId = req.testId;
  const testToDelete = await filterByIdWithObjID('TestCases',testId);
  const bugToUpdate = await filterByIdWithObjID('Bugs', bugId);
  let editsTest = {};
  let editsBug = {};
  let sacrifice;
  if(testToDelete){
    if(bugToUpdate){
      for(let i = 0; i < bugToUpdate.testCases.length;i++){
          if(bugToUpdate.testCases[i].toString() == testToDelete._id.toString()){
          sacrifice = bugToUpdate.testCases[i];
          }
      } debugTestCase(sacrifice)
       await deletionByObjId('TestCases', testId);
       editsTest.col = "testcase";
       editsTest.op = "delete";
       editsTest.timeStamp = new Date().toDateString();
       editsTest.target = testToDelete._id;
       editsTest.update = testToDelete;
       editsTest.auth = req.auth;
       await insert('Edits', editsTest);
       await updateByObjIdExtraSteps('Bugs', bugId, {$pull:{testCases:sacrifice}});
       editsBug.col = "bug";
       editsBug.op = "update";
       editsBug.timeStamp = new Date().toDateString();
       editsBug.target = bugId;
       editsBug.update = sacrifice;
       editsBug.auth = req.auth;
       await insert('Edits', editsBug)
       res.status(200).json(`TestCase successfully deleted`)
    }else{
      res.status(404).json('Bug not found')
    }
  }else{
    res.status(404).json('TestCase not found')
  }
});

export {router as testCasesRouter};