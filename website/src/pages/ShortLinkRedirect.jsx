import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotFound from "./NotFound";
import { API_URL } from "../misc";

export default function ShortLinkRedirect({ setPage }) {
  const [redirected, setRedirected] = useState(null);
  const navigate = useNavigate();

  function fetchData() {
    const url = `${API_URL}/links${window.location.pathname}`;
    fetch(url).then((res) => {
      res.json().then((data) => {
				if (res.status !== 200) {
					console.log("No such URL (no entry in database)", data);
					return setRedirected(false);
				}
        if (!data || !data.destination) {
          console.log("No such URL (data doesn't contain a destination URL)");
          return setRedirected(false);
        }
        console.log(`Redirecting to '${data.destination}'...`);
        setRedirected(true);
        navigate(data.destination);
      });
    });
  }
  useEffect(() => {
    setPage("redirect");
    fetchData();
  }, []);
  if (redirected === null) {
    return null; // Loading...
  }
	const msg = redirected ? "Przekierowanie linku działa, natomiast adres docelowy nie istnieje." : undefined;
	return <NotFound setPage={setPage} msg={msg} />;
}
