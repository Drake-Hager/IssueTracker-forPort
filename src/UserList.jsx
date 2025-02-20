import { useEffect, useState } from "react"
import UserListItem from "./UserListItem";
import axios from "axios";
import { toast } from "react-toastify";

export default function UserList({auth, showError, showSuccess}){

  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('')
  const [minAge, setMinAge] = useState(0);
  const [maxAge, setMaxAge] = useState(0)

const fetchUsers = async () =>{
    try{
      let response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, {withCredentials:true})
      if(response.status == 200){
        setUsers(response.data)
        toast(response.data)
      }
    }catch(e){
      console.log(e)
    }
  }
  useEffect(() =>{
  fetchUsers()
  },[])

  const handleSortBtn = async (e) =>{
    try{
      const value = e.target.value
    let sortResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`,{auth, params:{sortBy:value}}, {withCredentials:true});
    if(sortResponse.status == 200){
      setUsers(sortResponse.data);
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
      let response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, {auth, params:{minAge:minAge, maxAge:maxAge}} ,{withCredentials:true})
  if(response.status == 200){
    setUsers(response.data)
    showSuccess('Successfully sorted')
  } else{
    showError('Failed')
  }
  }catch(e){
      console.log(e)
    }
    }

    const handleSearchBtn = async () => {
      try{
        console.log(`searchText: ${searchText}`)
   let response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, {auth:auth, params:{keywords:searchText}}, {withCredentials:true})
      if(response.status == 200){
        setUsers(response.data)
      }else{
        showError('uh oh')
      }
      }catch(e){
        console.log(e.response)
      }
     
    }

    const handleRoleSortBtn = async (e) => {
      const value = e.target.value;
      try{
 let response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`,{auth, params:{role:value}} ,{withCredentials:true});
      if(response.status == 200){
        setUsers(response.data);
      }else{
        showError('Failed to filter')
      }
      }catch(e){
        console.log(e)
      }
     
    }


  return(
    <>
          <div className="row">
        <select className="form-select col-4 shrink p-2 m-2" onChange={handleSortBtn} aria-label='userSortBy'>
        <option value='givenName'>Given Name</option>
        <option value='familyName'>Family Name</option>
        <option value='role'>Role</option>
        <option value='oldest'>Oldest</option>
        <option value='newest'>Newest</option>
        </select>
        <input type="number" className="form-control shrink col-1 p-2 m-2" value={minAge} onChange={(e) => setMinAge(e.target.value)} placeholder="Minimum age"/>
        <input type="number" className="form-control shrink col-1 p-2 m-2" value={maxAge} onChange={(e) => setMaxAge(e.target.value)} placeholder="Maximum age"/>
        <button type="button" className="btn btn-btn col-1 p-1 ms-0 m-2" onClick={handleAgeBtn}>Search</button><br/>
        <input type="text" className="form-control shrink col-2 p-2 m-2 me-0" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Keywords"/>
      <button type="button" className="btn-btn btn col-1 p-1 ms-0 m-2" onClick={handleSearchBtn}>Search</button>
      <select className="form-select col-4 shrink p-2 m-2" onChange={handleRoleSortBtn} aria-label="userClassSortBy">
        <option value=''>None</option>
        <option value='Developer'>Developer</option>
        <option value='Business Analyst'>Business Analyst</option>
        <option value='Project Manager'>Project Manager</option>
        <option value='Technical Manager'>Technical Manager</option>
        <option value='Quality Analyst'>Quality Analyst</option>
      </select>
         </div>
        <div className="user-list" id="user-list">
      <div className="row">
      {users.map((user) => (
        <div key={user._id} className="col-3 m-3" >
          <UserListItem key={user._id} auth={auth} showError={showError} showSuccess={showSuccess} user={user} />
          </div>
      ))}
   </div> </div>
    </>
  )
}