import axios from "axios";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function BugClassify({showError, showSuccess}){
  const { bugId } = useParams()
  const [bugClassification, setBugClassification] = useState()

  const navigate = useNavigate();
    const handleSetClass = async () =>{
      try{
        let response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/bugs/${bugId}`,{classification: bugClassification}, {withCredentials:true} )
      if(response.status == 200){
        showSuccess('Bug successfully classified')
        navigate('/bug/list')
      }else{
        showError('Bug failed to be classified')
      }
      }catch(e){
        console.log(e)
      }
      
    }

  return(<>
  <select className="form-select" value={bugClassification} onChange={(e) => setBugClassification(e.target.value)} aria-label="bugClassifySelect">
    <option value='unclassified'>Unclassified</option>
    <option value='duplicate'>Duplicate</option>
    <option value='approved'>Approved</option>
    <option value='unapproved'>Unapproved</option>
  </select>
  <button type="button" className="btn btn-btn" onClick={handleSetClass}>Classify</button>
  </>)
}