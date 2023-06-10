import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { PostCardPreview, fetchNewsData } from '../components/News/PostCardPreview';
import PageSelector from '../components/PageSelector';
import { removeSearchParam } from '../misc';
import LoadingScreen from '../components/LoadingScreen';

const News = ({ setPage, reload, setReload, collectionInfo }) => {
  const [loaded, setLoaded] = useState(false);
  const [newsData, setNewsData] = useState([]);
  const [newsPage, setNewsPage] = useState(1);
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  /** Fetches the data from the cache or API. */
  const _populatePageContents = useCallback((pageNumber, updateCache = false) => {
    fetchNewsData({
      setNewsData,
      setLoaded,
      updateCache,
      pageNumber: pageNumber,
    });
  }, []);

  useEffect(() => {
    if (params.postID !== undefined) {
      // Specific post is being rendered
      return;
    }
    const pageNumber = searchParams.get('page') || 1;
    setNewsPage(pageNumber);
    setPage('news');
    setLoaded(false);
    const updateCache = !!removeSearchParam(searchParams, setSearchParams, 'refresh');
    _populatePageContents(pageNumber, updateCache);
  }, [params.postID, setPage, searchParams, setSearchParams, _populatePageContents]);

  useEffect(() => {
    if (!reload) {
      return;
    }
    // The page content has updated on the server side; reload it
    setReload(false);
    setLoaded(false);
    _populatePageContents(newsPage);
  }, [reload, setReload, newsPage, _populatePageContents]);

  if (params.postID !== undefined) {
    return <Outlet />;
  }
  if (!loaded) return <LoadingScreen />;

  return (
    <div className="w-11/12 xl:w-10/12 flex flex-col justify-center align-top">
      <Helmet>
        <title>Aktualności | Samorząd Uczniowski I LO</title>
        <meta
          name="description"
          content="Aktualności Samorządu Uczniowskiego oraz z życia naszego liceum."
        />
        <meta property="og:title" content="Aktualności" />
        <meta property="og:image" content="" /> {/* TODO: Add image */}
      </Helmet>
      {
        //SHOW THIS LAYOUT ONLY ON FIRST PAGE
        newsPage === 1 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:mt-12 w-full gap-5 my-6 md:my-9 md:gap-4 lg:gap-7">
              <PostCardPreview type="primary" data={newsData} linkPrefix="post/" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 w-full gap-4 mb-10 md:mb-8 md:gap-3 lg:gap-5">
              <PostCardPreview type="secondary" data={newsData} linkPrefix="post/" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-11 my-5 md:my-7">
              <PostCardPreview type="main" data={newsData} linkPrefix="post/" />
            </div>
          </>
        ) : (
          // OTHER PAGES SHOULD BE IN MAIN LAYOUT
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-11 mt-12 my-5 md:my-20">
              <PostCardPreview type="main" data={newsData} linkPrefix="post/" numItems={15} />
            </div>
          </>
        )
      }
      <PageSelector
        page={newsPage}
        numPages={Math.ceil(collectionInfo.numDocs / 15)}
        onChange={setNewsPage}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
      />
    </div>
  );
};

export default News;
