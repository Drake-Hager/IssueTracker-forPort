
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";

export default function BugComments({showError, showSuccess}){
  const { bugId } = useParams();
  const [comments, setComments] = useState([])

  const fetchBugComments = async () =>{
    try{
let response = await axios.get(`${import.meta.env.VITE_API_URL}/api/bugs/${bugId}/comments`, {withCredentials:true})
    console.log(response)
if(response.status == 200){
      setComments(response.data)
      showSuccess('Comments found')
    }else{
      showError('Comments not found')
    }
    }catch(e){
      console.log(e)
    }
    
  }

  useEffect(() => {
    fetchBugComments()
  },[bugId])
  return(<>
  {comments.map((comment) =>(
    <div key={comment._id} className="card col-10 m-auto m-2">
    <div className="card-body">
      <h4 className="card-title">{comment.author}</h4>
      <h5 className="card-text">{comment.content}</h5>
    </div>
    <div className="card-footer">
      <h5 className="card-text">{moment(comment.creationDate).fromNow()}</h5>
    </div>
  </div>
  ))}
  
  </>)
}