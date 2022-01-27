import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bars } from "react-loader-spinner";
import NotFound from "./NotFound";
import { API_URL } from "../misc";

export default function ShortLinkRedirect({ setPage }) {
  const [redirected, setRedirected] = useState(null);
  const navigate = useNavigate();

  function fetchData() {
    const url = `${API_URL}/links${window.location.pathname}`;
    fetch(url)
      .then((res) => {
        res.json().then((data) => {
          if (res.status !== 200) {
            console.log("No such short URL (no entry in database).", data);
            return setRedirected(false);
          }
          if (!data || !data.destination) {
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
      })
      .catch((error) => {
        console.log("Error retrieving short link data!", error);
        setRedirected(false);
      });
  }
  useEffect(() => {
    setPage("redirect");
    fetchData();
  }, []);
  if (redirected === null) {
    return (
      <div className="page-main" style={{ minHeight: "100vh" }}>
        <div
          className="loading-whole-screen"
          style={{ backgroundColor: "transparent" }}
        >
          <Bars color="#FFA900" height={50} width={50} />
        </div>
      </div>
    );
  }
  const msg = redirected
    ? "Przekierowanie linku działa, natomiast adres docelowy nie istnieje."
    : undefined;
  return <NotFound setPage={setPage} msg={msg} />;
}
