import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotFound from "../../pages/NotFound";
import LoadingScreen from "../LoadingScreen";
import { fetchCachedData, isURL } from "../../misc";

export default function ShortLinkRedirect({ setPage }) {
  const [loaded, setLoaded] = useState(null);
  const [redirectingExternal, setRedirectingExternal] = useState(false);;
  const navigate = useNavigate();

  /** Callback function for when the data is fetched. */
  function setData(data) {
    const destination = data?.destination;
    if (!destination) return;
    if (isURL(destination)) {
      // External, absolute URL
      setRedirectingExternal(true);
      window.location.href = destination;
    } else {
      // Internal, relative page link
      navigate(destination);
    }
  }

  function fetchShortLinkData() {
    const path = window.location.pathname;
    // Trim the leading slash from the cache name
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

  if (!loaded || redirectingExternal) return <LoadingScreen />;
  return <NotFound setPage={setPage} />;
}
