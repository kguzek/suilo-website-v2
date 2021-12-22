import logo from './logo.svg';
import './App.css';
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={ /***** default ***/} />
        <Route path="aktualnosci" element={ /***** ***/} >
          <Route path=":postID" element={ /*****navigate(`/invoices/${newInvoice.id}`)***/} />
        </Route>
        <Route path="wydarzenia" element={ /***** ***/} />
        <Route path="kontakt" element={ /***** ***/} />
        <Route path="edycja" element={ /***** ***/} />
        <Route path="*" element={ /***** ***/} />
      </Route>
    </Routes>
  );
}

export default App;
