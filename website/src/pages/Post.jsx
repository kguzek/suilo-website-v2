import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import MetaTags from "react-meta-tags";
import NotFound from "./NotFound";
import {
  PostCardPreview,
  fetchNewsData,
  MAIN_ITEMS_DEFAULT,
} from "../components/PostCardPreview";
import { conjugatePolish, API_URL, DEFAULT_IMAGE, formatDate } from "../misc";

const MAX_CACHE_AGE = 2; // hours

const Post = ({ setPage }) => {
  const [loaded, setLoaded] = useState(false);
  const [loadedNews, setLoadedNews] = useState(false);
  const [postData, setPostData] = useState({});
  const [newsData, setNewsData] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();

  /**Checks if there is a valid post data cache, and if so, return it if it's not too old. Otherwise fetches new data. */
  function updatePostData(updateCache = false) {
    /**Updates the post data with the data from the API JSON response and sets the 'loaded' status. */
    function processData(data) {
      if (!data) {
        console.log("ERROR: Could not retrieve post data.");
        setPostData({ errorDescription: "Data doesn't exist." });
        return setLoaded(true);
      }
      data.photo = data.photo || DEFAULT_IMAGE;
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
      setPostData(data);
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
            // console.log("Found existing cache for post data.", cache);
            setPostData(cache.data);
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
    const updateCache = searchParams.get("refresh");
    fetchNewsData({ setNewsData, setLoaded: setLoadedNews, updateCache });
  }, []);

  useEffect(() => {
    const updateCache = searchParams.get("refresh");
    updateCache && setSearchParams({});
    updatePostData(updateCache);
  }, [params.postID]);

  if (!loaded) {
    return null; // LOADING SCREEN //
  }
  if (postData.errorDescription) {
    return <NotFound setPage={setPage} msg="Post nie istnieje." />;
  }
  const newDate = formatDate(postData.date, true);
  const modifiedDate = formatDate(postData.modified, true);
  const views = conjugatePolish(postData.views || 0, "wyświetle", "ni", "ń");
  return (
    <div className="page-main">
      <MetaTags>
        <title>{postData.title}</title>
        <meta name="description" content={postData.text} />
        <meta property="og:title" content={postData.title} />
        <meta property="og:image" content="" /> {/* IMAGE TO BE ADDED */}
      </MetaTags>
      <div className="post-division">
        <article>
          <img className="post-image" src={postData.photo} alt={postData.alt} />
          {postData.imageAuthor && (
            <p className="image-author">Zdjęcie: {postData.imageAuthor}</p>
          )}
          <div className="post-info">
            <span style={{ fontWeight: "500" }}>{newDate}</span>
            {postData.modified && <i>{`Ostatnia modyfikacja: ${modifiedDate}`}</i>}
            <span>·</span>
            <span>{views}</span>
          </div>
          <h1 className="article-title">{postData.title}</h1>
          <p className="article-content">{postData.content}</p>
        </article>
        <PostCardPreview
          type="secondary"
          data={newsData}
          classOverride="post-sidebar"
          startIndex={MAIN_ITEMS_DEFAULT}
        />
      </div>
      <PostCardPreview type="main" data={newsData} startIndex={0} />
    </div>
  );
};

export default Post;
