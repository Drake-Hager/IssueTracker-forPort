import axios from "axios";
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom";

export default function BugClosing({showError, showSuccess}){
  const { bugId } = useParams();
  const [bugClosedStatus, setBugClosedStatus] = useState();

  const navigate = useNavigate();
  const handleBugClosing = async () => {
    try{
      if(bugClosedStatus){
        let response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/bugs/${bugId}/close`, {closed:bugClosedStatus}, {withCredentials:true})
      if(response.status == 200){
        if(bugClosedStatus == true || bugClosedStatus == 'true'){
          showSuccess('Bug successfully closed')
          navigate('/bug/list')
        }else if(bugClosedStatus == false || bugClosedStatus == 'false'){
          showSuccess('Bug successfully reopened')
          navigate('/bug/list')
        }
        
        
      }else{
        showError('Bug failed to close')
      }
      }else{
        showError('Please select an option')
      }
    }catch(e){
      console.log(e)
    }
  }
  
  return(<>
  <div className="input-group">
    <select className="form-select" onChange={(e) => setBugClosedStatus(e.target.value)} aria-label="ClosedSelect">
      <option value='nothing'></option>
      <option value='false'>Open</option>
      <option value='true'>Closed</option>
    </select>
    <button className="btn btn-btn" onClick={handleBugClosing} type="button">Close</button>
  </div>
  </>)
}