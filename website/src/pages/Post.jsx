import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import MetaTags from "react-meta-tags";
import { Bars } from "react-loader-spinner";
import NotFound from "./NotFound";
import {
  PostCardPreview,
  fetchNewsData,
} from "../components/News/PostCardPreview";
import {
  fetchCachedData,
  conjugatePolish,
  DEFAULT_IMAGE,
  formatDate,
  removeSearchParam,
  getURLfromFileName,
} from "../misc";
import YouTube from "react-youtube";

const Post = ({ setPage, reload }) => {
  const [loaded, setLoaded] = useState(false);
  const [postData, setPostData] = useState(null);
  const [photoLink, setPhotoLink] = useState(DEFAULT_IMAGE);
  const [newsData, setNewsData] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [width, setWidth] = useState(320);
  const params = useParams();
  const ref = useRef(null);

  useEffect(() => {
    setWidth(ref.current ? ref.current.offsetWidth : 0);
  }, [ref.current]);

  const cacheName = `news_post_${params.postID}`;

  /**Checks if there is a valid post data cache, and if so, return it if it's not too old. Otherwise fetches new data. */
  function updatePostData(updateCache = false) {
    /** Verifies that the API response is fvalid and returns the processed data. */
    function processJsonData(data) {
      if (data && !data.errorDescription) {
        data.photo || (data.photo = DEFAULT_IMAGE);
        return data;
      }
      setPostData({ errorMessage: "Post nie istnieje." });
    }

    function checkLinks(data) {
      getURLfromFileName(data.photo, "1920x1080", setPhotoLink);
      setPostData(data);
    }

    const args = {
      setData: checkLinks,
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
    // Start loading animation
    setLoaded(false);
    setPhotoLink(DEFAULT_IMAGE);
    // setPage("news");
    const updateCache = !!removeSearchParam(
      searchParams,
      setSearchParams,
      "refresh"
    );
    updatePostData(updateCache);
  }, [params.postID]);

  useEffect(() => {
    if (!reload) {
      return;
    }
    // The page content has updated on the server side; reload it
    setLoaded(false);
    updatePostData();
  }, [reload]);

  if (!loaded) {
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
  if (postData.errorMessage) {
    return <NotFound setPage={setPage} msg={postData.errorMessage} />;
  }
  const createdDate = formatDate(postData.date);
  // const modifiedDate = formatDate(postData.modified, true);
  const views = conjugatePolish(postData.views, "wyświetle", "nie", "nia", "ń");
  return (
    <div className="w-11/12 xl:w-10/12 flex flex-col justify-center align-top">
      <MetaTags>
        <title>{postData.title}</title>
        <meta name="description" content={postData.text} />
        <meta property="og:title" content={postData.title} />
        <meta property="og:image" content="" /> {/* IMAGE TO BE ADDED */}
      </MetaTags>
      <div className="grid grid-cols-1 lg:grid-cols-4 mt-6 lg:mt-10 gap-10 xl:gap-12">
        <article ref={ref} className="col-span-1 lg:col-span-3">
          <img
            className="aspect-video w-full object-cover rounded-xl lg:rounded-3xl drop-shadow-sm"
            src={photoLink ?? postData.photo}
            alt={postData.alt}
          />
          {postData.photoAuthor && (
            <p className="text-[#444444]/75 font-light text-xs w-full text-right py-1 pr-px sm:font-normal sm:text-sm">
              Zdjęcie: {postData.photoAuthor}
            </p>
          )}
          {!postData.photoAuthor && (
            <p className="text-bg font-light text-xs w-full text-right py-1 pr-px sm:font-normal sm:text-sm">
              .
            </p>
          )}
          <div className="text-[#707070] text-sm sm:text-base font-normal lg:pb-1">
            <span className="font-medium">{createdDate}</span>
            &nbsp;&nbsp;·&nbsp;&nbsp;{views}
            {/* {postData.modified && (
              <span>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <i>Ostatnia modyfikacja: {modifiedDate}</i>
              </span>
            )} */}
          </div>

          <h1 className="text-text1 w-full font-bold tracking-wide leading-8 text-[1.6rem] sm:text-3xl lg:max-w-prose md:text-4xl">
            {postData.title}
          </h1>
          <div
            dangerouslySetInnerHTML={{ __html: postData.content }}
            className="text-[#222222] text-justify md:text-left mt-4 leading-[1.85rem] lg:leading-9 lg:mt-5  lg:text-xl  font-normal text-lg"
          ></div>
          {postData.ytID && (
            <YouTube
              videoId={postData.ytID}
              opts={{ height: width * (9 / 16), width: width }}
            />
          )}
          {postData.author && (
            <p className="mb-16 font-normal text-base w-full text-right mt-5 text-[#444444]/50">
              Artykuł dodany przez:{" "}
              <span className="font-medium text-[#444444]/100">
                {postData.author}
              </span>
            </p>
          )}
        </article>
        <aside className="hidden lg:grid lg:grid-cols-1 lg:col-span-1 gap-3 mb-6">
          <PostCardPreview
            type="secondary"
            data={newsData}
            startIndex={2}
            numItems={5}
          />
          {/* FIX TUTAJ BO NIE DIZALALO TO Z MAIN DEFAULT UP^^*/}
        </aside>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-8 lg:gap-11 my-5 md:my-10">
        <PostCardPreview
          type="main"
          data={newsData}
          startIndex={0}
          numItems={4}
        />
      </div>
    </div>
  );
};

export default Post;
