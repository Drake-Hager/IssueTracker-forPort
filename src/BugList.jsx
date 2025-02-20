
import axios from "axios"
import { useState, useEffect } from "react"
import BugListItem from "./BugListItem";

export default function BugList({auth, showSuccess, showError}){
  
 const [bugs, setBugs] = useState([])
 const [searchText, setSearchText] = useState('')
 const [minAge, setMinAge] = useState(0)
 const [maxAge, setMaxAge] = useState(0)
 const [closedIsChecked, setClosedIsChecked] = useState(false);
 
   const fetchBugs = async () => {
 try{
    let response = await axios.get(`${import.meta.env.VITE_API_URL}/api/bugs`,  {withCredentials:true});
    console.log(response)
    if(response.status == 200){
      setBugs(response.data)
      showSuccess('It worked')
      
    }else{
      showError('No bugs found')
    }
  }catch(e){
    showError(e.message)
  }
  }
  useEffect(() => {
    fetchBugs()
  },[])
  
  const handleSearchBtn = async () => {
    try{
 let response2 = await axios.get(`${import.meta.env.VITE_API_URL}/api/bugs`, {auth: auth, params:{keywords:searchText}}, {withCredentials:true})
    if(response2.status == 200){
      showSuccess('Success')
      setBugs(response2.data)
    }else{
      showError('uh oh')
    }
    }catch(e){
      console.log(e.response)
    }
   
  }

  const handleSortBtn = async (e) =>{
    try{
      const value = e.target.value
    let sortResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/bugs`,{auth, params:{sortBy:value}}, {withCredentials:true});
    if(sortResponse.status == 200){
      setBugs(sortResponse.data);
      console.log(sortResponse.data)
      showSuccess('Successfully sorted')
    }else{
      showError('Sort failed')
    }
    }catch(e){
      console.log(e)
    }
    
  }

  const handleAgeBtn = async ()=>{
    try{
      let response = await axios.get(`${import.meta.env.VITE_API_URL}/api/bugs`, {auth, params:{minAge:minAge, maxAge:maxAge}} ,{withCredentials:true})
  if(response.status == 200){
    setBugs(response.data)
    showSuccess('Successfully sorted')
  } else{
    showError('failed')
  }
  }catch(e){
      console.log(e)
    }
    }
    
    const handleClassSortBtn = async (e) => {
      const value = e.target.value;
      try{
 let response = await axios.get(`${import.meta.env.VITE_API_URL}/api/bugs`,{auth, params:{classification:value}} ,{withCredentials:true});
      if(response.status == 200){
        setBugs(response.data);
        showSuccess('Successfully filtered')
      }else{
        showError('Failed to filter')
      }
      }catch(e){
        console.log(e)
      }
     
    }

    const handleClosedBtn = async (e)=>{
      try{
        const isChecked = e.target.checked;
        setClosedIsChecked(isChecked)
        if(isChecked == true){
          let response = await axios.get(`${import.meta.env.VITE_API_URL}/api/bugs`, {auth, params:{closed:isChecked}}, {withCredentials:true})
        if(response.status == 200){
          setBugs(response.data)
          showSuccess('Successfully filtered')
        }else{
          showError('Filter failed')
        }
        }else{
          fetchBugs()
        }
        
      }catch(e){
        console.log(e)
      }
    }
 
  return(
    <>
      <div className="row">
        <select className="form-select col-4 shrink p-2 m-2" onChange={handleSortBtn} aria-label='bugSortBy'>
        <option value='createdBy'>Author</option>
        <option value='title'>Title</option>
        <option value='newest'>Newest</option>
        <option value='oldest'>Oldest</option>
        <option value='classification'>Classification</option>
        <option value='assignedTo'>Assigned To</option>
        </select>
        <input type="number" className="form-control shrink col-2 p-2 m-2" value={minAge} onChange={(e) => setMinAge(e.target.value)} placeholder="Minimum age"/>
        <input type="number" className="form-control shrink col-2 p-2 m-2" value={maxAge} onChange={(e) => setMaxAge(e.target.value)} placeholder="Maximum age"/>
        <button type="button" className="btn btn-btn col-1 p-1 ms-0 m-2" onClick={handleAgeBtn}>Search</button><br/>
        <input type="text" className="form-control shrink col-2 p-2 m-2 me-0" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Keywords"/>
      <button type="button" className="btn-btn btn col-1 p-1 ms-0 m-2" onClick={handleSearchBtn}>Search</button>
      <select className="form-select col-4 shrink p-2 m-2" onChange={handleClassSortBtn} aria-label="bugClassSortBy">
        <option value='approved'>Approved</option>
        <option value='unapproved'>Unapproved</option>
        <option value='unclassified'>Unclassified</option>
      </select>
      <div className="form-check col-2">
        <div className="row">
         <label className="form-check-label col-6" htmlFor='closeCheck'><strong>Closed:</strong></label>
       <input type="checkbox" id="closeCheck" className="form-check-input col-2" checked={closedIsChecked} onChange={handleClosedBtn}/>
      </div>
        </div>
         </div>
      <div className="row">
      {bugs.map((bug) => (
        <div key={bug._id} className="col-3 m-3" >
          <BugListItem key={bug._id} auth={auth} showError={showError} showSuccess={showSuccess} bug={bug} />
          </div>
      ))}
      </div>
 </> )
}