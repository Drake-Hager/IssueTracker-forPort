import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function UserProfileEditor({auth, showError, showSuccess}){
  const [userEmail, setUserEmail] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [userFirstName, setUserFirstName] = useState('')
  const [userFamilyName, setUserFamilyName] = useState('')

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault()
    let response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/users/me`,{auth:auth, email:userEmail, password: userPassword, givenName:userFirstName, lastName:userFamilyName} ,{withCredentials:true})
    if(response.status == 200){
      showSuccess('successfully updated')
      navigate('/user/list')
    }else{
      showError('failed to update')
    }
  }

  const fetchUser = async () =>{
    let response2 = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/me`, {auth}, {withCredentials:true})
    if(response2.status == 200){
      const user = response2.data
      setUserEmail(user.email)
      setUserPassword(user.password)
      setUserFirstName(user.givenName)
      setUserFamilyName(user.familyName)
    }else{
      showError(response2.message)
    }}


  useEffect(() =>{
    fetchUser()
  },[])

  return(
    <div className="container-fluid">
      <div className="formy">
    <label className="form-label"><strong>Email Address</strong></label>
    <input type="email" className="form-control" value={userEmail} onChange={(evt) => setUserEmail(evt.target.value)}/></div><br/>
    <div className="formy">
    <label className="form-label"><strong>Password</strong></label>
    <input type="password" className="form-control" value={userPassword} onChange={(evt) => setUserPassword(evt.target.value)}/></div><br/>
    <div className="formy">
    <label className="form-label"><strong>First Name</strong></label>
    <input type="text" className="form-control" value={userFirstName} onChange={(evt) => setUserFirstName(evt.target.value)}/></div><br/>
    <div className="formy">
    <label className="form-label"><strong>Family Name</strong></label>
    <input type="text" className="form-control" value={userFamilyName} onChange={(evt) => setUserFamilyName(evt.target.value)}/></div><br/>
    <button type="submit" className="btn btn-btn" onClick={(e) => handleSubmit(e)}>Click</button>
    </div>
  )
}