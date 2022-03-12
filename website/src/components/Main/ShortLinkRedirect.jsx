import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotFound from "../../pages/NotFound";
import { fetchWithToken } from "../../firebase";
import LoadingScreen from "../LoadingScreen";

export default function ShortLinkRedirect({ setPage }) {
  const [redirected, setRedirected] = useState(null);
  const navigate = useNavigate();

  function fetchShortLinkData() {
    fetchWithToken("/links" + window.location.pathname).then(
      (res) => {
        res.json().then((data) => {
          if (!res.ok) {
            console.log("No such short URL (no entry in database).", data);
            return setRedirected(false);
          }
          if (!data?.destination) {
            console.log(
              "No such short URL (data doesn't contain a destination URL).",
              data
            );
            return setRedirected(false);
          }
          console.log(`Redirecting to '${data.destination}'...`);
          setRedirected(true);
          navigate(data.destination);
        });
      },
      (error) => {
        console.log("Error retrieving short link data!", error);
        setRedirected(false);
      }
    );
  }
  useEffect(() => {
    setPage("redirect");
    fetchShortLinkData();
  }, []);
  if (redirected === null) return <LoadingScreen />;
  const msg =
    redirected &&
    "Przekierowanie linku działa, natomiast adres docelowy nie istnieje.";
  return <NotFound setPage={setPage} msg={msg} />;
}
