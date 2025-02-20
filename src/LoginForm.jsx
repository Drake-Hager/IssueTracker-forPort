import { useEffect, useState } from "react"
import axios from 'axios';

export default function LoginForm({onLogin,showSuccess, showError}){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')  
  const [message, setMessage] = useState('')


  useEffect(() => {

  })
const handleSubmit = async (e)=>{
  e.preventDefault();

try{
  let response =  await axios.post(`${import.meta.env.VITE_API_URL}/api/users/login`, {email:email, password:password}, {withCredentials:true});
  console.log(response);
  if(response.status == 200){
    setMessage(response.data.message);
    console.log(`OnLogin response: ${response.data}`)
    onLogin({email:response.data.email, role:response.data.role, _id: response.data._id});
  }else{
    showError('User not found');
  }
}catch(e){
  if(e?.response?.data?.error){
    showError(e.response?.data?.error)
  }
  else if(e?.response?.data?.error?.detail){
    showError(e.response.data.error.detail)
  }else{
    showError(e.message)
  }
}
}

  return(
    <form className="needs-validation col-7 m-auto p-4" onSubmit={(e) => handleSubmit(e)} noValidate>
    <div className="container-fluid service-box">
    <br/> 
    <div className="col-md-9 position-relative">
      <label htmlFor="loginText1" className="form-label"><strong>Email Address</strong></label>
    <input type="email" id="loginText1" required  value={email} onChange={(evt) => setEmail(evt.target.value)} className={`form-control col-4 ${email ? "is-valid": "is-invalid"}`}/>
    <div className="valid-tooltip">
      Looks good!
    </div>
    <div className="invalid-tooltip">
      Please enter your Email
    </div>
    </div>
    <br/>
    <div className="col-md-9 position-relative">
    <label className="form-label"><strong>Password</strong></label>
    <input type="password" required minLength={8} value={password} onChange={(evt) => setPassword(evt.target.value)} className={`form-control col-4 ${password.length >= 8  ? "is-valid": "is-invalid"}`}/>
    <div className="valid-tooltip">
      Looks good!
    </div>
    <div className="invalid-tooltip">
      Please enter your password
    </div></div>
    <br/><br/>
    <button type="submit" className="btn btn-btn m-3">Login</button>
    <br/>
    <h2 className="result" id="result">{message}</h2>
    </div></form>
  )
}
