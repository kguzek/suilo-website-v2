import React, { useState, useEffect } from "react";
import { Outlet, useParams, useSearchParams } from "react-router-dom";
import { MetaTags } from "react-meta-tags";
import { Bars } from "react-loader-spinner";
import { PostCardPreview, fetchNewsData } from "../components/PostCardPreview";
import { removeSearchParam } from "../misc";

const News = ({ setPage }) => {
  const [loaded, setLoaded] = useState(false);
  const [newsData, setNewsData] = useState([]);
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams({});

  useEffect(() => {
    if (params.postID !== undefined) {
      return;
    }
    setPage("news");
    const updateCache = removeSearchParam(
      searchParams,
      setSearchParams,
      "refresh"
    );
    // this raw value is later encoded in the fetchNewsData() function
    const pageNumber = searchParams.get("page") ?? 1;
    fetchNewsData({
      setNewsData,
      setLoaded,
      updateCache,
      pageNumber,
    });
  }, [params.postID]);

  if (params.postID !== undefined) {
    return <Outlet />;
  }
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
