import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import {MongoClient, ObjectId} from 'mongodb';
import debug from 'debug';
const debugDb = debug('app:Database');
import jwt from 'jsonwebtoken'
import { fetchRoles, mergePermissions } from '@merlin4/express-auth';

//Generate/Parse an ObjectId
const newId = (str) => new ObjectId(str);
const app = express();
app.use(express.json());
//Global variable storing the open connection, do not use it directly
let _db = null;

//Connect to the database
async function connect(){
  if(!_db){
    const dbUrl = process.env.DB_URL;
    const dbName = process.env.DB_NAME;
    const client = await MongoClient.connect(dbUrl);
    _db = client.db(dbName);
    debugDb('Connected to the database');
  }
return _db;
}

async function ping(){
  const db = await connect();
  return db.command({ping: 1});
  debugDb('Ping.')
}

async function list(collectionName){
  try{
    const db = await connect();
  const result = await db.collection(collectionName).find({}).toArray();
  return result;
  }catch(e){
    debugDb(e);
}}

async function listAndFilter(collectionName, Id){
  try{
    const db = await connect();
    const result = await db.collection(collectionName).find({bugId:Id}).toArray();
    return result;
  }catch(e){
    debugDb(e)
}}

async function insert(collectionName, data){
  try{
    const db = await connect();
    const result = await db.collection(collectionName).insertOne(data);
    if (result.insertedId) {
      document._id = result.insertedId;
    }
    return result;
  }catch(e){
    debugDb(e);
}}

async function filter(collectionName, emaily){
  try{
    const db = await connect();
    const result = await db.collection(collectionName).findOne({email:emaily});
    return result;
  }catch(e){
    debugDb(e);
}}

async function filterById(collectionName, Id){
  try{
    const db = await connect();
const result = await db.collection(collectionName).findOne({_id:newId(Id)});
return result;
  }catch(e){
    debugDb(e);
}}

async function filterByIdWithObjID(collectionName, Id){
    try{
      const db = await connect();
      const result = await db.collection(collectionName).findOne({_id:Id});
      return result;
  }catch(e){
    debugDb(e);
}}

async function filterByTitle(collectionName, title){
  try{
    const db = await connect();
    const result = await db.collection(collectionName).findOne({title:title});
    return result;
}catch(e){
  debugDb(e);
}}

async function update(collectionName,userId, userData){
  try{
    const db = await connect();
    const result = await db.collection(collectionName).updateOne({_id:newId(userId)}, {$set:userData});
    return result;
  }catch(e){
    debugDb(e);
}}

async function updateByObjId(collectionName, Id, Data){
    try{
      const db = await connect();
      const result = await db.collection(collectionName).updateOne({_id:Id}, {$set:Data});
      return result;
    }catch(e){
      debugDb(e)
}}

async function updateByObjIdExtraSteps(collectionName, Id, Data){
    try{
      const db = await connect();
      const result = await db.collection(collectionName).updateOne({_id:Id}, Data)
      return result;
    }catch(e){
      debugDb(e)
}}

async function deletion(collectionName, userId){
  try{
    const db = await connect();
    const result = await db.collection(collectionName).deleteOne({_id: newId(userId)});
    return result;
  }catch(e){
    debugDb(e);
}}

async function deletionByObjId(collectionName, Id){
    try{
      const db = await connect();
      const result = await db.collection(collectionName).deleteOne({_id:Id});
      return result;
    }catch(e){
      debugDb(e)
}}

async function filterByContent(collectionName, content){
    try{
      const db = await connect();
      const result = await db.collection(collectionName).findOne({content:content});
      return result;
    }catch(e){
      debugDb(e);
}}

async function pipeline(collectionName, pipeline){
  try{
    const db = await connect();
  const result = await db.collection(collectionName).aggregate(pipeline)
  return result;
  }catch(e){
    debugDb(e)
}}

async function issueAuthToken(user){ 
  try{
    const token = jwt.sign({_id:user._id, email: user.email, role: user.role}, process.env.JWT_SECRET, {expiresIn: '1h'}) 
    return token
     }catch(e){
    debugDb(e)
  }}
  
async function issueAuthCookie(res, token){
  const cookieOptions = {httpOnly:true, maxAge: 1000*60*60, sameSite: 'strict', secure:true};
  res.cookie('authToken', token, cookieOptions);
}
async function findRoleByName(role){
  try{
    const db = await connect();
  const result = await db.collection('Roles').find({name:role}).toArray();
  return result
  }catch(e){
    debugDb(e)
  }
  
}

export {newId, connect, ping, list,listAndFilter,findRoleByName, insert,pipeline, filter, update, filterById, deletion, filterByTitle,updateByObjIdExtraSteps,issueAuthToken, issueAuthCookie, filterByIdWithObjID, filterByContent, updateByObjId, deletionByObjId};
ping();