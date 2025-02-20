import axios from "axios";
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom";

export default function ReportBug({showError, showSuccess}){
const { bugId } = useParams()
const [report, setReport] = useState('')
const [bug, setBug] = useState('');

const findBugToReport = async () => {
  let response2 = await axios.get(`${import.meta.env.VITE_API_URL}/api/bugs/${bugId}`, {withCredentials:true})
  if(response2.status == 200){
    setBug(response2.data)
  }
}
const handleSubmit = async (e) => {
e.preventDefault();
try{
let response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/bugs/${bugId}/report`, {report:report}, {withCredentials:true});
if(response.status == 200){
showSuccess('Bug successfully reported')
}
}catch(e){
  showError(e.response?.data?.error)
}
}

useEffect(() => {
  findBugToReport()
})

return(<>  
<div className="container-fluid m-2 p-3">
<form className="form needs-validation" onSubmit={(e) => handleSubmit(e)} noValidate>
    <div className="position-relative">
    <label className="form-label" htmlFor="reportText"><strong>Report for {bug.title}</strong></label>
    <input type="text" className="form-control" id="reportText" onChange={(e) => setReport(e.target.value)}/>
    <button type="submit" className="btn btn-btn">Report</button>
  </div>
</form></div>
</>)
}