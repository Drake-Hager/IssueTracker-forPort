
import { useState, useEffect } from "react";
import './project.css'
import axios from "axios";
import { useNavigate } from "react-router-dom";
export default function RegisterForm({onLogin, showError, showSuccess}){

  const [email, setEmail] = useState('')
  const [emailConfirm, setEmailConfirm] = useState('')
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const navigate = useNavigate();
  useEffect(() => {

  }, []);
  const handleSubmit = async (evt) =>{
    evt.preventDefault()
    try{
      console.log(import.meta.env.VITE_API_URL)
      let response = await axios.post(`${import.meta.env.VITE_API_URL}/api/users`, {email: email, password: password, givenName: firstName, familyName: lastName, fullName: `${firstName} ` + `${lastName}`}, {withCredentials: true})
      console.log(response)
      if(response.status == 200){
        onLogin(response.data)
        navigate("/bug/list")
        showSuccess(response.data)
        console.log(`email:${response.data.email}, password: ${response.data.password}, firstName: ${response.data.givenName}, lastName: ${response.data.familyName}`)
      }else{
        showError(`Could not create`)
      }
    }catch(e){
      if(e.response){
      console.log('Response data:' ,e.response.data)
      console.log('Response status:', e.response.status)
      console.log('Response headers:', e.response.headers)
      showError(e.response?.data?.message)
      }else if(e.request){
        console.log('Request data: ', e.request)
        showError(e.request)
      }else{
        console.log('Error message: ', e.message);
        showError('An Error occurred while setting up the request')
      }
    }
    
  }
  
return(
  <form className="col-8 p-4 m-auto needs-validation" noValidate>
  <div className="container-fluid service-box">
    <br/>
  <div className="position-relative col-9">
  <label className="form-label"><strong>Email Address</strong></label>
  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} id="emailInput" className={`col-4 form-control ${email ? "is-valid":"is-invalid"}`}/>
  <div className="valid-tooltip">
      Looks good!
    </div>
    <div className="invalid-tooltip">
      Please enter your Email
    </div></div><br/>
    <div className="position-relative col-9">
  <label className="form-label"><strong>Confirm Email Address</strong></label>
  <input type="email" value={emailConfirm} onChange={(e) => setEmailConfirm(e.target.value)} className={`col-4 form-control ${emailConfirm == email ? "is-valid": "is-invalid"}`}/>
  <div className="valid-tooltip">
      Looks good!
    </div>
    <div className="invalid-tooltip">
    Emails do not match
    </div></div><br/>
    <div className="position-relative col-9">
  <label className="form-label"><strong>Password</strong></label>
  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} id="passwordInput" className={`col-4 form-control ${password ? "is-valid" : "is-invalid"}`}/>
  <div className="valid-tooltip">
      Looks good!
    </div>
    <div className="invalid-tooltip">
      Please enter your Password
    </div></div><br/>
    <div className="position-relative col-9">
  <label className="form-label"><strong>Confirm Password</strong></label>
  <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} className={`col-4 form-control ${passwordConfirm == password ? "is-valid": "is-invalid"}`}/>
  <div className="valid-tooltip">
      Looks good!
    </div>
    <div className="invalid-tooltip">
      Passwords do not match
    </div></div><br/>
    <div className="position-relative col-9">
  <label className="form-label"><strong>First Name</strong></label>
  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={`col-4 form-control ${firstName ? "is-valid" : "is-invalid"}`}/>
  <div className="valid-tooltip">
      Looks good!
    </div>
    <div className="invalid-tooltip">
      Passwords do not match
    </div></div><br/>
    <div className="position-relative col-9">
  <label className="form-label"><strong>Family Name</strong></label>
  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={`col-4 form-control ${lastName ? "is-valid" : "is-invalid"}`}/>
  <div className="valid-tooltip">
      Looks good!
    </div>
    <div className="invalid-tooltip">
      Passwords do not match
    </div></div><br/><br/>
    <button type='submit' className="btn btn-btn" onClick={(evt) => handleSubmit(evt)}>Register</button></div>
  
  </form>
)
}