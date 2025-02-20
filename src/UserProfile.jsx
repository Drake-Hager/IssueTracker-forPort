import axios from "axios"
import moment from "moment"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"

export default function UserProfile({showError, showSuccess, auth}){
  const [user, setUser] = useState({})
  const [roles, setRoles] = useState([])
  const userId = auth._id
  const navigate = useNavigate()
const fetchUserInfo = async ()=>{
  try{
    let response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${userId}`, {withCredentials:true})
    if(response.status == 200){
      showSuccess('User gotten')
      setUser(response.data)
    }else{
      showError('Failed to get user')
    }
  }catch(e){
    console.log(e)
  }
}

useEffect(() =>{
  fetchUserInfo()
},[])

 useEffect(() =>{
  const handleRoles = () =>{
    if(!user.role || user.role.length === 0){
      setRoles(["No Roles"])
    }
    else if(user.role.length > 1){
      setRoles([...user.role])
    }
    else{
        setRoles([user.role]);
      }
     }
  handleRoles();
 }, [user.role]);

 const handleEditProfile = () =>{
  navigate(`/user/${userId}`)
 }

  return(<>
  <div className="card">
    <div className="card-body">
      <h4 className="card-title">{user.fullName}</h4>
      <h5 className="card-text text-muted">{user.email}</h5>
      {roles.map((role, index) =>(
      <div key={index} className={`ms-1 badge ${roles.includes("No Roles") ? "bg-danger" : "bg-success"}`}>
          {role}
          {index < roles.length - 1 && <></>}
        </div>
      ))}
    </div>
    <div className="card-footer">
      <div className="row">
        <h5 className="card-text">Profile created: {moment(user.creationDate).fromNow()}</h5>
        {auth.role.includes(...['Technical Manager']) ? (<button type="button" className="btn btn-btn" onClick={handleEditProfile}>Edit Profile</button>) : (<></>)}
      </div>
      
    </div>
  </div>
  </>)
}