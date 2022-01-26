import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import MetaTags from "react-meta-tags";
import NotFound from "./NotFound";
import { PostCardPreview, fetchNewsData } from "../components/PostCardPreview";
import { conjugatePolish, API_URL } from "../misc";

const MAX_CACHE_AGE = 2; // hours

const Post = ({ setPage }) => {
  const [loaded, setLoaded] = useState(false);
  const [loadedNews, setLoadedNews] = useState(false);
  const [currentPostData, setCurrentPostData] = useState({});
  const [dataMain, setDataMain] = useState([]);
  const [_dataPrimary, setDataPrimary] = useState([]);
  const [dataSecondary, setDataSecondary] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();

  function updatePostData(updateCache = false) {
    /**Updates the post data with the data from the API JSON response and sets the 'loaded' status. */
    function processData(data) {
      if (!data) {
        console.log("ERROR: Could not retrieve post data.");
        setCurrentPostData({ errorDescription: "Data doesn't exist." });
        return setLoaded(true);
      }
      const newCache = {
        date: new Date(),
        data,
      };
      if (data.errorDescription) {
        console.log("Post data contains error. Not saving cache.");
      } else {
        localStorage.setItem(params.postID, JSON.stringify(newCache));
        console.log("Created cache for post data.", newCache);
      }
      setCurrentPostData(data);
      setLoaded(true);
    }
    // check if there is a valid post data cache
    const cache = JSON.parse(localStorage.getItem(params.postID));
    if (cache) {
      if (!updateCache) {
        // check if the cache contains no error
        if (cache.data && !cache.data.errorDescription) {
          // check if the cache is younger than 24 hours old
          const cacheDate = Date.parse(cache.date);
          const dateDifferenceSeconds = (new Date() - cacheDate) / 1000;
          if (dateDifferenceSeconds / 3600 < MAX_CACHE_AGE) {
            console.log("Found existing cache for post data.", cache);
            setCurrentPostData(cache.data);
            return setLoaded(true);
          }
        }
      }
      // remove the existing cache
      localStorage.removeItem(params.postID);
    }

    fetch(`${API_URL}/news/${params.postID}`).then((res) => {
      res.json().then(processData);
    });
  }

  useEffect(() => {
    setPage("news");
    if (!loadedNews) {
      fetchNewsData(
        setDataMain,
        setDataPrimary,
        setDataSecondary,
        setLoadedNews
      );
    }
    const forceRefresh = searchParams.get("refresh");
    forceRefresh && setSearchParams({});
    updatePostData(forceRefresh);
  }, []);

  if (!loaded) {
    return null; // LOADING SCREEN //
  }
  if (currentPostData.errorDescription) {
    setPage("not_found");
    return <NotFound setPage={setPage} msg="Post nie istnieje." />;
  }
  const newDate = new Date(currentPostData.date).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const views = conjugatePolish(
    currentPostData.views || 0,
    "wyświetle",
    "ni",
    "ń"
  );
  return (
    <div className="page-main">
      <MetaTags>
        <title>{currentPostData.title}</title>
        <meta name="description" content={currentPostData.text} />
        <meta property="og:title" content={currentPostData.title} />
        <meta property="og:image" content="" /> {/* IMAGE TO BE ADDED */}
      </MetaTags>
      <div className="post-division">
        <article>
          <img
            className="post-image"
            src={currentPostData.photo}
            alt={currentPostData.alt}
          />
          <p className="image-author">Zdjęcie: {currentPostData.imageAuthor}</p>
          <p className="post-info">
            <span style={{ fontWeight: "500" }}>{newDate}</span>
            &nbsp;&nbsp;·&nbsp;&nbsp;{views}
          </p>
          <h1 className="article-title">{currentPostData.title}</h1>
          <p className="article-content">{currentPostData.content}</p>
        </article>
        <div className="post-sidebar">
          <PostCardPreview
            type="secondary"
            data={dataSecondary}
            fromPost={true}
          />
        </div>
      </div>
      <div className="main-grid">
        <PostCardPreview type="main" data={dataMain} fromPost={true} />
      </div>
    </div>
  );
};

export default Post;
