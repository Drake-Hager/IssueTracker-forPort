import { useEffect, useState } from "react"
import { Link } from "react-router-dom";

export default function UserListItem({auth, user}){
 
  const [roles, setRoles] = useState([])
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
  
  return(
    <div className="user-list-item" id="user-item">
      <div className="card mb-2">
  <div className="card-body">
    <h5 className="card-title">{user.fullName}</h5><br/>
    <p className="card-text">{user.email}</p>
    {roles.map((role, index) =>(
      <div key={index} className={`ms-1 badge ${roles.includes("No Roles") ? "bg-danger" : "bg-success"}`}>
          {role}
          {index < roles.length - 1 && <></>}
        </div>
      ))}
      <div className="card-footer">
        { auth.role.includes('Technical Manager') ? <Link to={`/user/${user._id}`}>Edit</Link> : ''}
        
        </div>
  </div>
</div>
    </div>
  )
}