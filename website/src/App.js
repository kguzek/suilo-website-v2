import {
  BrowserRouter,
  Routes,
  Route,
  Outlet
} from "react-router-dom";
import News from './pages/News'
import Home from './pages/Home'
import Edit from './pages/Edit'
import Events from './pages/Events'
import Contact from './pages/Contact'
import Post from './pages/Post'
import NotFound from './pages/NotFound'

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<App />}>
          {/* <Route index element={<Home />} /> */}
          {/* <Route path="aktualnosci" element={<News />} >
            <Route path=":postID" element={<Post />} />
          </Route>
          <Route path="wydarzenia" element={<Events />} />
          <Route path="kontakt" element={<Contact />} />
          <Route path="edycja" element={<Edit />} />
          <Route path="*" element={<NotFound />} /> */}
        </Route>
      </Routes>
      <p>dsf</p>
      {/* <Outlet /> */}
    </div>

  );
}

export default App;
