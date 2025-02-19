
//import { useState } from "react"
import { NavLink } from "react-router-dom"
export default function NavBar({auth, onLogout}){
//  const [navIndex, setNavIndex] = useState(0)
console.log(auth)
 function onClickLogout(evt){
  evt.preventDefault()
    onLogout()
     }
  return(
    <header>
    <nav className="navbar navbar-expand-lg navbar-light bg-light w-100">
  <NavLink className="logo navbar- text-light ps-2" href="#">IssueTracker</NavLink>
  <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
    <span className="navbar-toggler-icon"></span>
  </button>
  <div className="collapse navbar-collapse w-100" id="navbarNav">
    <ul className="menu navbar-nav w-100">
      <li className="nav-item active p-1">
        <NavLink className="nav-link">Home</NavLink>
      </li>
      {!auth ? (<>  <li className="nav-item ms-auto mr-2 p-1">
        <NavLink className="nav-link" to="/register">Register</NavLink>
      </li>
        <li className="nav-item p-1">
        <NavLink className="nav-link" to="/login">Login</NavLink>
      </li> </>
      ) : (<>
       <li className="nav-item ms-auto p-1">
       <NavLink className="nav-link" to="/login" onClick={(evt) => onClickLogout(evt)}>Logout</NavLink>
     </li>
       <li className="nav-item p-1">
        <NavLink className="nav-link" to="/user/me" >Welcome {auth.email}</NavLink>
      </li>
      <li className="nav-item p-1">
        <NavLink className="nav-link" to="/user/list">Users</NavLink>
      </li>
      <li className="nav-item p-1">
        <NavLink className="nav-link" to="/bug/list">Bugs</NavLink>
      </li>
      </>
      )}
    </ul>
  </div>
</nav>
    </header>
  )
}