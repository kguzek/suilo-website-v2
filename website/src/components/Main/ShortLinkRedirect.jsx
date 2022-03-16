import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotFound from "../../pages/NotFound";
import { fetchWithToken } from "../../firebase";
import LoadingScreen from "../LoadingScreen";
import { fetchCachedData, isURL } from "../../misc";

export default function ShortLinkRedirect({ setPage }) {
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  /** Callback function for when the data is fetched. */
  function setData(data) {
    const destination = data?.destination;
    if (!destination) return;
    if (isURL(destination)) {
      // External, absolute URL
      window.location.href = destination;
    } else {
      // Internal, relative page link
      navigate(destination);
    }
  }

  function fetchShortLinkData() {
    // Trim the leading slash from the cache name
    const path = window.location.pathname;
    const cacheName = "links_" + path.substring(1, path.length);
    const fetchURL = "/links" + path;
    const fetchArgs = {
      setData,
      setLoaded,
    };
    fetchCachedData(cacheName, fetchURL, fetchArgs);
  }
  useEffect(() => {
    setPage("redirect");
    fetchShortLinkData();
  }, []);
  if (!loaded) return <LoadingScreen />;
  return <NotFound setPage={setPage} />;
}
