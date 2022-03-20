import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import MetaTags from "react-meta-tags";
import NotFound from "./NotFound";
import {
  PostCardPreview,
  fetchNewsData,
} from "../components/News/PostCardPreview";
import DialogBox from "../components/DialogBox";
import {
  fetchCachedData,
  conjugatePolish,
  DEFAULT_IMAGE,
  formatDate,
  removeSearchParam,
  getDataFromFilename,
  copyToClipboard,
} from "../misc";
import YouTube from "react-youtube";
import LoadingScreen from "../components/LoadingScreen";
import { ExternalLink, Share2 } from "react-feather";

const Post = ({ setPage, reload, setReload }) => {
  const [loaded, setLoaded] = useState(false);
  const [postData, setPostData] = useState(null);
  const [photoLink, setPhotoLink] = useState(DEFAULT_IMAGE);
  const [newsData, setNewsData] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [sharePopup, setSharePopup] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 320, height: 180 });
  const params = useParams();
  const ref = useRef(null);

  useLayoutEffect(() => {
    setDimensions({
      width: ref.current ? ref.current.offsetWidth : 0,
      height: ref.current ? ref.current.offsetHeight : 0,
    });
  }, [ref.current]);

  const cacheName = `news_post_${params.postID}`;

  /**Checks if there is a valid post data cache, and if so, return it if it's not too old. Otherwise fetches new data. */
  function updatePostData(updateCache = false) {
    function checkLinks(data) {
      getDataFromFilename(data.photo, "1920x1080", setPhotoLink);
      setPostData(data);
    }

    const args = {
      setData: checkLinks,
      setLoaded,
      updateCache,
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
    setReload(false);
    setLoaded(false);
    updatePostData();
  }, [reload]);

  if (!loaded) return <LoadingScreen />;
  if (!postData || postData.errorMessage) {
    return <NotFound setPage={setPage} />;
  }
  const createdDate = formatDate(postData.date);
  // const modifiedDate = formatDate(postData.modified);
  const views = conjugatePolish(postData.views, "wyświetle", "nie", "nia", "ń");
  return (
    <div className="w-11/12 xl:w-10/12 flex flex-col justify-center align-top">
      <MetaTags>
        <title>{postData.title}</title>
        <meta name="description" content={postData.rawContent} />
        <meta property="og:title" content={postData.title} />
        <meta property="og:image" content="" /> {/* IMAGE TO BE ADDED */}
      </MetaTags>
      <DialogBox
        header="Zrobione!"
        content="Skopiowano link do artykułu. Teraz możesz się nim podzielić ze znajomymi."
        duration={3500}
        isVisible={sharePopup}
        setVisible={setSharePopup}
      />
      <div className="grid grid-cols-1 lg:grid-cols-4 mt-6 lg:mt-10 gap-10 xl:gap-12">
        <article className="col-span-1 lg:col-span-3">
          <img
            className="aspect-video w-full object-cover rounded-xl lg:rounded-3xl drop-shadow-5xl"
            src={photoLink ?? postData.photo}
            alt={postData.alt}
          />
          {postData.photoAuthor && (
            <p className="text-[#444444]/75 font-light text-xs w-full text-right pt-1 pr-px sm:font-normal sm:text-sm">
              Zdjęcie: {postData.photoAuthor}
            </p>
          )}
          {!postData.photoAuthor && (
            <p className="text-bg font-light text-xs w-full text-right pt-1 pr-px sm:font-normal sm:text-sm">
              .
            </p>
          )}
          <div className="text-[#707070] text-sm sm:text-base font-normal">
            <time className="font-medium" dateTime={postData.date}>
              {createdDate}
            </time>
            &nbsp;&nbsp;·&nbsp;&nbsp;{views}
            {/* {postData.modified && (
              <span>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <i>Ostatnia modyfikacja: {modifiedDate}</i>
              </span>
            )} */}
          </div>

          <h1 className="text-text1 w-full font-bold tracking-[.015rem] leading-8 text-[1.6rem] md:leading-[2.7rem] sm:text-3xl md:text-4xl">
            {postData.title}
          </h1>
          <div
            dangerouslySetInnerHTML={{ __html: postData.formattedContent }}
            className="text-[#222222] text-left md:text-left mt-4 leading-[1.85rem] lg:leading-9 mb-2  lg:text-xl  font-normal text-lg"
          ></div>
          {postData.ytID && (
            <div className="w-full mt-5 aspect-video" ref={ref}>
              <YouTube
                videoId={postData.ytID}
                opts={{ height: dimensions.height, width: dimensions.width }}
              />
            </div>
          )}
          {postData.author && (
            <p className=" font-normal text-base w-full text-right mt-6 text-[#444444]/50">
              Artykuł dodany przez:{" "}
              <span className="font-medium text-[#444444]/100">
                {postData.author}
              </span>
            </p>
          )}
          <div className="w-full inline-flex justify-end mt-3 mb-16">
            {postData.link && (
              <a
                target="_blank"
                title={`Link z posta: ${postData.link}`}
                href={postData.link}
                className={
                  "transition-all cursor-pointer hover:ring-2 hover:ring-primary/30 pb-[.45rem] pr-[.45rem] pt-[.55rem] pl-[.55rem] ml-2 drop-shadow-3xl rounded-xl aspect-square bg-gray-50"
                }
              >
                <ExternalLink
                  size={28}
                  className={`aspect-square pt-px h-[1.5rem] m-auto stroke-2 stroke-primary transition-all duration-150`}
                />
              </a>
            )}
            <button
              onClick={() =>
                copyToClipboard(window.location.href, setSharePopup)
              }
              title="Udostępnij"
              className={
                "transition-all inline-flex py-[.6rem] bg-primary hover:ring-2 hover:ring-primary/30 active:drop-shadow-5xl cursor-pointer ml-2 drop-shadow-3xl rounded-xl px-[1.1rem]"
              }
            >
              <Share2
                size={28}
                className={`aspect-square  h-[1.5rem]  my-auto stroke-2 stroke-white`}
              />
              <p className="text-white pl-[.35rem] my-auto font-medium text-base pr-[.2rem] -tracking-[.015rem]">
                Udostępnij
              </p>
            </button>
          </div>
        </article>
        <aside className="hidden lg:grid lg:grid-cols-1 h-fit lg:col-span-1 gap-5 mb-6">
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
