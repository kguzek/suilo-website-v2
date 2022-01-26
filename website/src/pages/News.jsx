import React, { useState, useEffect } from "react";
import { Outlet, useParams, useSearchParams } from "react-router-dom";
import MetaTags from "react-meta-tags";
import { PostCardPreview, fetchNewsData } from "../components/PostCardPreview";

const News = ({ setPage }) => {
  const [pageIdx, setPageIdx] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [newsData, setNewsData] = useState([]);
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams({});

  useEffect(() => {
    setPage("news");
    if (params.postID !== undefined) {
      return;
    }
    const forceRefresh = searchParams.get("refresh");
    forceRefresh && setSearchParams({});
    fetchNewsData(setNewsData, setLoaded, forceRefresh, pageIdx);
  }, [params]);

  if (params.postID !== undefined) {
    return <Outlet />;
  }
  if (!loaded) {
    // TODO: Loading animation
    return (
      <div className="page-main" style={{ minHeight: "100vh" }}>
        Trwa ładowanie aktualności...
      </div>
    );
  }
  return (
    <div className="page-main" style={{ minHeight: "100vh" }}>
      <MetaTags>
        <title>
          Aktualności | Samorząd Uczniowski 1 Liceum Ogólnokształcącego w
          Gliwicach
        </title>
        <meta
          name="description"
          content="Aktualności z życia Samorządu Uczniowskiego, oraz 1 Liceum Ogólnokształącego w Gliwicach."
        />
        <meta property="og:title" content="Aktualności | SUILO Gliwice" />
        <meta property="og:image" content="" /> {/* TODO: Add image */}
      </MetaTags>
      <PostCardPreview type="primary" data={newsData} linkPrefix="post/" />
      <PostCardPreview type="secondary" data={newsData} linkPrefix="post/" />
      <PostCardPreview type="main" data={newsData} linkPrefix="post/" />
    </div>
  );
};

export default News;
