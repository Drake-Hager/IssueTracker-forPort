import axios from "axios"
import moment from "moment"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

export default function BugTestCase({auth, showSuccess, showError}){
  const { bugId } = useParams()
  const [bugTestCases, setBugTestCases] = useState([])
  console.log(bugTestCases)
  const fetchBugTestCases = async() =>{
    try{
      let response = await axios.get(`${import.meta.env.VITE_API_URL}/api/bugs/${bugId}/test`, {withCredentials:true})
      if(response.status == 200){
        showSuccess('TestCases found')
        setBugTestCases(response.data || [])
      }else{
        showError('TestCases not found')
      }
    }catch(e){
      console.log(e)
    }
  }

  useEffect(() =>{
    fetchBugTestCases()
  },[bugTestCases._id])

  return(
  <div className="container fluid">
  {bugTestCases.length > 0 ? (
  bugTestCases.map((testCase) => (
        <div key={testCase._id} className="card col-10 m-auto" >
    <div className="card-body">
      <h4 className="card-title">Created By: {testCase.createdBy}</h4>
      <h5 className="card-text">Status: {testCase.status}</h5>
      <h5 className="card-text">Bug Id: {testCase.bugId}</h5>
    </div>
    <div className="card-footer">
      
    </div>
  </div>
      ))) : (<h2>No testCases found</h2>)
  }
  </div>)
}