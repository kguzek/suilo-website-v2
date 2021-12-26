import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
} from "react-router-dom";
import React, { useState, useEffect } from 'react'
import './styles/app.css'
import News from './pages/News'
import Home from './pages/Home'
import Edit from './pages/Edit'
import Events from './pages/Events'
import Contact from './pages/Contact'
import Post from './pages/Post'
import NotFound from './pages/NotFound'
import NavBar from './components/NavBar'
import LoginScreen from './components/LoginScreen'

function App() {
  const [page, setPage] = useState(null)
  const [logged, setLogged] = useState(false) // to integrate with actual login state, can be swapped to parent/outside variable passed into this child
  const [startLogging, setLogging] = useState(false)

  //---debug code---//
  // useEffect(() => { 
  //   if (page !== null) {
  //     console.log(page)
  //   }
  //   return;
  // }, [page])

  const loginAction = () => {
    // console.log("zalogowoano!")
    // setLogged(true)
    // CALL LOG SCREEN
    setLogging(true);
  }

  const logoutAction = () => {
    // console.log("wylogowano!")
    setLogged(false)
    // LOGOUT (to integrate with backend) !!!!!! -------------------------- !!!!
  }

  return (
    <Routes>
      <Route path="/" element={<Layout page={page} logged={logged} loginAction={loginAction} logoutAction={logoutAction} setLogging={setLogging} startLogging={startLogging} setLogged={setLogged} />}>
        <Route index element={<Home setPage={setPage} />} />
        <Route path="aktualnosci" element={<News setPage={setPage} />} >
          <Route path=":postID" element={<Post setPage={setPage} />} />
        </Route>
        <Route path="wydarzenia" element={<Events setPage={setPage} />} />
        <Route path="kontakt" element={<Contact setPage={setPage} />} />
        <Route path="edycja" element={<Edit setPage={setPage} logged={logged} loginAction={loginAction} />} />
        <Route path="*" element={<NotFound setPage={setPage} />} />
      </Route>
    </Routes>
  );
}

const Layout = ({ page, logged, loginAction, logoutAction, startLogging, setLogging, setLogged }) => {
  return (
    <main>
      <NavBar page={page} logged={logged} loginAction={loginAction} logoutAction={logoutAction} />
      <Outlet />
      <LoginScreen setLogging={setLogging} setLogged={setLogged} startLogging={startLogging} />
    </main>
  );
}

export default App;
