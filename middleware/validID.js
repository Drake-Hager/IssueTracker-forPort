import { ObjectId } from "mongodb";

const validID = (paramName) => {
  return (req, res, next) =>{
    try{
      req[paramName] = new ObjectId(req.params[paramName]);
      return next();
    }
  catch(e){
    return res.status(400).json({
      error: `${paramName} was not a valid ObjectId`
    })
  }
}}

export {validID}