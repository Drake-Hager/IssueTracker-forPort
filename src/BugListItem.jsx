
import { useEffect, useState } from 'react'
import  moment  from 'moment'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function BugListItem({bug, auth, showError, showSuccess}){
  
  const navigate = useNavigate()
  const [buggy, setBuggy] =useState('')
  try{
    const handleSubmit = async () => {
    let response = await axios.get(`${import.meta.env.VITE_API_URL}/api/bugs/${bug._id}`, {withCredentials: true})
    if(response.status == 200){
      setBuggy(response.data)
    }else{
        showError('uh oh')
    }
  }
  useEffect(() =>{
    handleSubmit()
  },[bug._id])
  }catch(e){
    console.log(e.message)
  }
  
  return(
    <div className="card mb-2">
  <div className="card-body">
    <h5 className="card-title">{bug.title}</h5>
    <h6 className="card-subtitle mb-2 text-muted">{bug.createdBy}</h6>
    <p className="card-text">Assigned to: {bug.assignedToUserName ? bug.assignedToUserName : "N/A"}</p>
    <p className="card-text">Created on: {bug.creationDate}</p>
    <div className={`badge ${bug.classification == "approved" ? "bg-success" : bug.classification == "unapproved" ? "bg-danger" : bug.classification == "duplicate" ? "bg-danger" : bug.classification == "unclassified" ? "bg-warning" : ""}`}>{bug.classification}</div>
    <div className={`badge ${bug.closed == false || bug.closed == 'false'? "bg-success" : bug.closed == true || bug.closed == 'true' ? "bg-danger" : ""}`}>{bug.closed == false ? 'open' : 'closed'}</div>
  </div>
  <div className="card-footer">
    Created By: {bug.createdBy} {moment(bug.creationDate).fromNow()}<br/>
    
    { auth.role.includes('Business Analyst') || auth.role.includes('Technical Manager') || auth.role.includes('Quality Analyst') ?  <Link to={`/bug/${bug._id}`}>View Details</Link> : ''}
  </div>
</div>
  )
}