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

function App() {
  const [page, setPage] = useState(null)

  useEffect(() => {
    if (page !== null) {
      console.log(page)
    }
    return;
  }, [page])

  return (
    <Routes>
      <Route path="/" element={<Layout page={page} />}>
        <Route index element={<Home setPage={setPage} />} />
        <Route path="aktualnosci" element={<News setPage={setPage} />} >
          <Route path=":postID" element={<Post setPage={setPage} />} />
        </Route>
        <Route path="wydarzenia" element={<Events setPage={setPage} />} />
        <Route path="kontakt" element={<Contact setPage={setPage} />} />
        <Route path="edycja" element={<Edit setPage={setPage} />} />
        <Route path="*" element={<NotFound setPage={setPage} />} />
      </Route>
    </Routes>
  );
}

const Layout = ({ page }) => {
  return (
    <main >
      <NavBar page={page} />
      <Outlet />
    </main>
  );
}

export default App;
