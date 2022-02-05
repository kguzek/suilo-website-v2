import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import MetaTags from "react-meta-tags";
import NotFound from "./NotFound";
import {
  PostCardPreview,
  fetchNewsData,
  MAIN_ITEMS_DEFAULT,
} from "../components/PostCardPreview";
import {
  fetchCachedData,
  conjugatePolish,
  DEFAULT_IMAGE,
  formatDate,
  removeSearchParam,
} from "../misc";
import { Bars } from "react-loader-spinner";

const Post = ({ setPage }) => {
  const [loaded, setLoaded] = useState(false);
  const [postData, setPostData] = useState({});
  const [newsData, setNewsData] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams({});
  const params = useParams();

  const cacheName = `news_post_${params.postID}`;

  /**Checks if there is a valid post data cache, and if so, return it if it's not too old. Otherwise fetches new data. */
  function updatePostData(updateCache = false) {
    /** Verifies that the API response is valid and returns the processed data. */
    function processJsonData(data) {
      if (data && !data.errorDescription) {
        data.photo = data.photo || DEFAULT_IMAGE;
        return data;
      }
      setPostData({ errorMessage: "Post nie istnieje." });
    }

    const args = {
      setData: setPostData,
      setLoaded,
      updateCache,
      onSuccessCallback: processJsonData,
      onFailData: {
        errorMessage: "Nastąpił błąd sieciowy. Spróbuj ponownie w krótce.",
      },
    };
    fetchCachedData(
      cacheName,
      `/news/${encodeURIComponent(params.postID)}`,
      args
    );
  }

  useEffect(() => {
    const updateCache = searchParams.get("refresh");
    fetchNewsData({ setNewsData, updateCache });
  }, []);

  useEffect(() => {
    setPage(cacheName);
    const updateCache = removeSearchParam(
      searchParams,
      setSearchParams,
      "refresh"
    );
    updatePostData(updateCache);
  }, [params.postID]);

  if (!loaded) {
    return (
      <div
        className="loading-whole-screen"
        style={{ backgroundColor: "transparent" }}
      >
        <Bars color="#FFA900" height={50} width={50} />
      </div>
    );
  }
  if (postData.errorMessage) {
    return <NotFound setPage={setPage} msg={postData.errorMessage} />;
  }
  const createdDate = formatDate(postData.date, true);
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
            <span style={{ fontWeight: "500" }}>{createdDate}</span>
            &nbsp;&nbsp;·&nbsp;&nbsp;{views}
            {/* {postData.modified && (
              <span>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <i>Ostatnia modyfikacja: {modifiedDate}</i>
              </span>
            )} */}
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
      <PostCardPreview type="main" data={newsData} startIndex={0} numItems={4} />
    </div>
  );
};

export default Post;
