import express from 'express';

const router = express.Router();
import debug from 'debug';
const debugComment = debug('app:Comments');
import { insert, update, filterById, filterByIdWithObjID } from '../../database.js';
import Joi from 'joi';
import {validBody} from '../../middleware/validBody.js';
import {validID} from '../../middleware/validID.js'
import {  isLoggedIn, hasRole } from '@merlin4/express-auth';

const commentSchema = Joi.object({
  content: Joi.string().required(),
  creationDate: Joi.date(),
  bugId: Joi.string()
})

router.get('/:bugId/comments',isLoggedIn(), hasRole(...['Developer', 'Business Analyst', 'Project Manager', 'Quality Analyst', 'Technical Manager']), validID('bugId'), async (req, res)=>{
  const id = req.bugId;
   let bugSearch = await filterByIdWithObjID('Bugs', id);
    if(!bugSearch){
      res.status(404).send('Bug not found');
    }else{
      let com = bugSearch.comments;
      let result = [];
      let comment;
        for(let i = 0; i < com.length; i++){
      comment = await filterByIdWithObjID('Comments', com[i]);
      if(comment){
      result.push(comment);
      }
      }
      res.json(result).status(200);
      //let commentSearch = await filterByIdWithObjID('Comments', com);
      debugComment(comment)
      debugComment(result);
}
});

router.get('/:bugId/comments/:commentId',isLoggedIn(), hasRole(...['Developer', 'Business Analyst', 'Project Manager', 'Quality Analyst', 'Technical Manager']), validID('bugId'), async (req, res)=>{
  const id = req.params.commentId;
  const bugId = req.bugId;
   let bugSearch = await filterById('Bugs', bugId);
    if(!bugSearch){
      res.status(404).send('Bug not found');
    }else{
      let com = bugSearch.comments;
    for(let i=0; i<com.length; i++){
      if(com[i] == id){
        let comment = await filterByIdWithObjID('Comments', com[i]);
        res.json(comment).status(200);
        debugComment(comment);
    }
  }
}
});

router.post('/:bugId/comments',isLoggedIn(), hasRole(...['Developer', 'Business Analyst', 'Project Manager', 'Quality Analyst', 'Technical Manager']), validID('bugId'),validBody(commentSchema), async (req, res)=>{
  const newComment = req.body;
  const id = req.bugId
  const bug = await filterById('Bugs', id);
    newComment.creationDate = new Date();
    newComment.bugId = req.bugId;
    newComment.author = req.auth.email;
    debugComment(newComment);
  try{
  const comment = await filterById('Comments', newComment._id);
  if(comment && comment.commentId == newComment.commentId){
    res.status(400).send(`Comment ${comment.commentId} is already registered`);
  }else{
    const commenty = await insert('Comments', newComment);
    if(!commenty || !commenty._id){
      res.status(400).send('failed to insert comment')
    }
    bug.comments.push(commenty._id);
    await update('Bugs', id, bug);
    res.status(200).send(`New comment: ${newComment.content} has been successfully added.`);
  }}catch(e){
    debugComment(e);
  }
});

export  {router as commentRouter};