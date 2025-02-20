import BugEditor from "./BugEditor"
import LoginForm from "./LoginForm"
import NavBar from "./NavBar"
import RegisterForm from "./RegisterForm"
import UserEditor from "./UserEditor"
import ReportBug from "./ReportBug"
import Footer from "./Footer"
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Routes, Route, Navigate, useNavigate} from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css';
import BugList from "./BugList"
import UserList from "./UserList"
import { useState } from "react"
import BugComments from "./BugComments"
import BugClassify from "./BugClassify"
import BugClosing from "./BugClosing"
import UserProfile from "./UserProfile"
import BugTestCase from "./BugTestCase"
import UserProfileEditor from "./UserProfileEditor"

function App() { 
  const [auth, setAuth] = useState();
  const navigate = useNavigate();

function onLogin(data){
  console.log(data)
    setAuth(data);
    console.log(data)
    navigate('/bug/list');
    showSuccess('Logged In!')
  }
  
  function onLogout(){
    setAuth(null);
    
    navigate('/login');
    showSuccess('Logged Out!')
  }

  function showError(message){
    toast(message, {type: 'error', position:"top-left"})
  }

  function showSuccess(message){
    toast(message, {type: 'success', position:"top-left"})
  }

 
  return (
    <>
    <ToastContainer/>
    <NavBar auth={auth} onLogout={onLogout}/>
    <br/>  
    <main className="container m-auto my-2">
    <Routes>
      <Route path="/" element={<Navigate to="/login"/>}/>
      <Route path="/login" element={<LoginForm onLogin={onLogin} showSuccess={showSuccess} showError={showError}/>}/>
      <Route path="/register" element={<RegisterForm onLogin={onLogin} showSuccess={showSuccess} showError={showError}/>}/>
      <Route path="/bug/list" element={<BugList auth={auth} showError={showError} showSuccess={showSuccess}/>}/>
      <Route path="/bug/:bugId" element={<BugEditor auth={auth} showError={showError} showSuccess={showSuccess}/>}/>
      <Route path="/bug/:bugId/report" element={<ReportBug showError={showError} showSuccess={showSuccess}/>}/>
      <Route path="/bug/:bugId/comment" element={<BugComments showError={showError} showSuccess={showSuccess}/>}/>
      <Route path="/bug/:bugId/classify" element={<BugClassify auth={auth} showError={showError} showSuccess={showSuccess}/>}/>
      <Route path="/bug/:bugId/close" element={<BugClosing auth={auth} showError={showError} showSuccess={showSuccess}/>}/>
      <Route path="/bug/:bugId/testCase" element={<BugTestCase auth={auth} showError={showError} showSuccess={showSuccess}/>}/>
      <Route path="/user/list" element={<UserList auth={auth} showError={showError} showSuccess={showSuccess}/>}/>
      <Route path="/user/:userId" element={<UserEditor showError={showError} showSuccess={showSuccess}/>}/>
      <Route path="/user/me" element={<UserProfile showError={showError} showSuccess={showSuccess} auth={auth}/>}/>
      <Route path="/user/edit/me" element={<UserProfileEditor showError={showError} showSuccess={showSuccess} auth={auth}/>}/>
    </Routes>
    </main>
    <Footer/>
    </>
  )
}

export default App
