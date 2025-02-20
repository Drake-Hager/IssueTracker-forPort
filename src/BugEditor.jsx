import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
export default function BugEditor({auth, showError, showSuccess}){
  const { bugId } = useParams()
  const [bugTitle, setBugTitle] = useState('')
  const [bugClassification, setBugClassification] = useState('')
  const [bugAssignedTo, setBugAssignedTo] = useState('')
  const [bugCommentText, setBugCommentText] = useState('')

  const navigate = useNavigate();
  const handleSubmit = async (e) =>{
      e.preventDefault()
      try{
        let response2 = await axios.patch(`${import.meta.env.VITE_API_URL}/api/bugs/${bugId}`,{
        title:bugTitle, 
        classification:bugClassification,
        assignedToUserName:bugAssignedTo
      }, {withCredentials:true})
      if(response2.status == 200){
        showSuccess('successfully updated')
        setBugTitle(response2.data.title);
        setBugAssignedTo(response2.data.AssignedToUserName || 'N/A');
        setBugClassification(response2.data.classification)
        navigate('/bug/list')
      }else{
        showError('uh oh')
      }
      }catch(e){
        showError(e.message)
      }
      
    }

useEffect(() =>{
    const fetchBug = async() =>{
      console.log(import.meta.env.VITE_API_URL)
      let response = await axios.get(`${import.meta.env.VITE_API_URL}/api/bugs/${bugId}`, {withCredentials:true})
      if(response.status == 200){
      const bug = response.data;
        setBugTitle(bug.title);
        setBugAssignedTo(bug.assignedToUserName || 'N/A');
        setBugClassification(bug.classification)
    }else{
      showError('uh oh')
    }
    }
    fetchBug();
  },[bugId, showError])

  const handleSetCommentsBtn = async () =>{
    try{
      let response = await axios.post(`${import.meta.env.VITE_API_URL}/api/bugs/${bugId}/comments`, {content:bugCommentText}, {withCredentials:true})
      if(response.status == 200){
        showSuccess('Comment successfully added')
        navigate(`/bug/${bugId}/comment`);
      }else{
        showError('Comment failed to add')
      }
    }catch(e){
      console.log(e)
    }
  }

    const handleCommentsBtn = async () =>{
      navigate(`/bug/${bugId}/comment`);
    }

  const handleReportBtn = async() => {
    navigate(`/bug/${bugId}/report`);
    showSuccess('hehehehehehaha')
  }

  const handleClassifyBtn = async() =>{
    navigate(`/bug/${bugId}/classify`)
    showSuccess('yayayaya')
  }

  const handleCloseBtn = async () =>{
    navigate(`/bug/${bugId}/close`)
  }

  const handleTestCaseBtn = async () =>{
    navigate(`/bug/${bugId}/testCase`)
  }

  return(
    <form className="container-fluid dark-background" onSubmit={(e) => handleSubmit(e)}>
    <div className="formy">
    <label className="form-label"><strong>Bug Name</strong></label>
    <input type='text' className="form-control" value={bugTitle} onChange={(evt) => setBugTitle(evt.target.value)}/></div><br/>
    <div className="formy">
    <label className="form-label"><strong>Bug Classification</strong></label>
    <input type='text' className="form-control" value={bugClassification} onChange={(evt) => setBugClassification(evt.target.value)}/></div><br/>
    <div className="formy">
    <label className="form-label"><strong>Bug is Assigned to:</strong></label>
    <input type='text' className="form-control" value={bugAssignedTo} onChange={(evt) => setBugAssignedTo(evt.target.value)}/></div><br/>
    <button type="submit" className="btn btn-btn m-2">Click</button>
    {auth.role ? (<>
      <button type="button" className="btn btn-btn m-2" onClick={handleReportBtn}>Report Bug</button>
      <button type="button" className="btn btn-btn m-2" onClick={handleCommentsBtn}>Comments</button>
    </>) :  (<></>)} {auth.role.includes('Business Analyst') ? (<>
    <button type="button" className="btn btn-btn m-2" onClick={handleClassifyBtn}>Classify</button>
    <button type="button" className="btn btn-btn m-2" onClick={handleCloseBtn}>Close</button>
    </>) : (<></>)} {auth.role.includes('Quality Analyst') ? (<>
    <button type="button" className="btn btn-btn m-2" onClick={handleTestCaseBtn}>Testcases</button>
    </>) : (<></>)}
    <div className="input-group">
      <input type="text" className="form-control" onChange={(e) => setBugCommentText(e.target.value)} value={bugCommentText}/>
      <button type="button" className="btn-btn btn m-2" onClick={handleSetCommentsBtn}>Create Comment</button>
      
    </div>
    

    </form>
  )
}