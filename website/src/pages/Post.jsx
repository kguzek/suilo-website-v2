import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MetaTags from "react-meta-tags";
import { PostCardPreview, fetchData } from "../components/PostCardPreview";
import { conjugatePolish } from "../misc";

// Change API URL in production
const API_URL = "http://localhost:5001/suilo-page/europe-west1/app/api/news/";
const MAX_CACHE_AGE = 2; // hours

const testDataMain = [
  /*{
    id: `ijsdfb32tew`,
    title: `Adam Sarkowicz: "uczymy do ostatniego żywego ucznia" `,
    textShort: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
    content: `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. `,
    date: new Date(),
    photo: `https://www.sportslaski.pl/static/thumbnail/article/med/13452.jpg`,
    views: `2137`,
    alt: "",
    postAuthor: "Mikołaj Mrózek",
    imageAuthor: "Mikołaj Mrózek",
  },
  {
    id: `sdf89ub8743`,
    title: `SpeedDating edycja 2022 - informacje`,
    textShort: `Nowa edycja SpeedDating'u już przednami, w tym poście znajdziecie wszystkie przydatne informacje dotyczące tegorocznej edycji wydarzenia.`,
    date: new Date(),
    photo: `https://images.unsplash.com/photo-1544911845-1f34a3eb46b1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
    views: `4326`,
  },
  {
    id: `534879bjifsd`,
    title: `PiS znowu atakuje polską edukację `,
    textShort: `Co tu dużo mówić, w końcu żyjemy w Polsce.. Niemniej tutaj mamy dla was krótkie podsumownie aktualnych informacji dotyczących LexCzarnek i idiotyzmów polskiego obozu rządzącego. `,
    date: new Date(),
    photo: `https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
    views: `42069`,
  },
  {
    id: `432fsdsdffd`,
    title: `Fotorelacja z wycieczki do babiogórskiego parku narodowego`,
    textShort: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
    date: new Date(),
    photo: `https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
    views: `2137`,
  },*/
];

const Post = ({ setPage }) => {
  const [loaded, setLoaded] = useState(false);
  const [currentPostData, setCurrentPostData] = useState({});
  const [dataMain, setDataMain] = useState([]);
  const [dataPrimary, setDataPrimary] = useState([]);
  const [dataSecondary, setDataSecondary] = useState([]);

  let params = useParams();
  let navigate = useNavigate();

  function updatePostData() {
    function processData(data) {
      if (!data) {
        console.log("ERROR: Could not retrieve post data.");
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
    // check if there is a valid news data cache
    const cache = JSON.parse(localStorage.getItem(params.postID));
    if (cache) {
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
      // the cache is too old
      localStorage.removeItem(params.postID);
    }

    const url = API_URL + params.postID;
    fetch(url).then((res) => {
      res.json().then(processData);
    });
  }

  useEffect(() => {
    setPage("news");
    fetchData(1, setDataMain, setDataPrimary, setDataSecondary, () => { });
    updatePostData();
  }, [params]);

  if (params.postID === undefined) {
    navigate("/aktualnosci");
    return null;
  } else if (!loaded) {
    updatePostData()
    return null; // LOADING SCREEN //
  } else {
    const newDate = new Date(currentPostData.date).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const views = conjugatePolish(currentPostData.views || 0, "wyświetle", "ni", "ń")
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
            <p className="image-author">
              Zdjęcie: {currentPostData.imageAuthor}
            </p>
            <p className="post-info">
              <span style={{ fontWeight: "500" }}>{newDate}</span>
              &nbsp;&nbsp;·&nbsp;&nbsp;{views}
            </p>
            <h1 className="article-title">{currentPostData.title}</h1>
            <p className="article-content">{currentPostData.content}</p>
          </article>
          <div className="post-sidebar">
            <PostCardPreview type="secondary" data={dataSecondary} />
          </div>
        </div>
        <div className="main-grid">
          <PostCardPreview type="main" data={dataMain} />
        </div>
      </div>
    );
  }
};

export default Post;
