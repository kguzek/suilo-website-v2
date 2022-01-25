import React, { useState, useEffect } from "react";
import { Outlet, useParams, useNavigate } from "react-router-dom";
import MetaTags from "react-meta-tags";
import { useCookies } from "react-cookie";
import PostCardPrimary from "../components/PostCardPrimary";
import PostCardSecondary from "../components/PostCardSecondary";
import PostCardMain from "../components/PostCardMain";

// Change API URL in production
const API_URL = "http://localhost:5001/suilo-page/europe-west1/app/api/news/";
// Temporary image URL if an article has none specified
const DEFAULT_IMAGE = "https://i.stack.imgur.com/6M513.png";

// Set number of items on page to 3 primary, 4 secondary and 8 main.
// Can introduce useState variable for user customisability or leave it hard-coded.
const ITEMS_PER_PAGE = 3 + 4 + 8;
const MAX_CACHE_AGE = 2; // hours

///////////////////////////
const testDataPrimary = [
  {
    id: `ijsdfb32tew`,
    title: `Adam Sarkowicz: "uczymy do ostatniego żywego ucznia" `,
    textShort: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
    date: new Date(),
    photo: `https://www.sportslaski.pl/static/thumbnail/article/med/13452.jpg`,
    views: `2137`,
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
];
const testDataSecondary = [
  {
    id: `432fsdsdffd`,
    title: `Fotorelacja z wycieczki do babiogórskiego parku narodowego`,
    textShort: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
    date: new Date(),
    photo: `https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
    views: `2137`,
  },
  {
    id: `5349769fgdgfd`,
    title: `Teorie spiskowe odnośnie p. Dziedzica [ZOBACZ ZDJĘCIA]`,
    textShort: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
    date: new Date(),
    photo: `https://images.unsplash.com/photo-1470145318698-cb03732f5ddf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80`,
    views: `2137`,
  },
  {
    id: `ijsfdsfdfsd32`,
    title: `Kalendarz maturalny 2022`,
    textShort: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
    date: new Date(),
    photo: `https://images.unsplash.com/photo-1506784365847-bbad939e9335?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1168&q=80`,
    views: `4324`,
  },
  {
    id: `34243423tew`,
    title: `Nowe obostrzenia na terenie szkoły`,
    textShort: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
    date: new Date(),
    photo: `https://images.unsplash.com/photo-1584744982491-665216d95f8b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
    views: `2137`,
  },
];
const testDataMain = [
  {
    id: `ijsdfb32tew`,
    title: `Adam Sarkowicz: "uczymy do ostatniego żywego ucznia" `,
    textShort: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
    date: new Date(),
    photo: `https://www.sportslaski.pl/static/thumbnail/article/med/13452.jpg`,
    views: `2137`,
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
  },
  {
    id: `5349769fgdgfd`,
    title: `Teorie spiskowe odnośnie p. Dziedzica [ZOBACZ ZDJĘCIA]`,
    textShort: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
    date: new Date(),
    photo: `https://images.unsplash.com/photo-1470145318698-cb03732f5ddf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80`,
    views: `2137`,
  },
  {
    id: `ijsfdsfdfsd32`,
    title: `Kalendarz maturalny 2022`,
    textShort: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
    date: new Date(),
    photo: `https://images.unsplash.com/photo-1506784365847-bbad939e9335?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1168&q=80`,
    views: `4324`,
  },
  {
    id: `34243423tew`,
    title: `Nowe obostrzenia na terenie szkoły`,
    textShort: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
    date: new Date(),
    photo: `https://images.unsplash.com/photo-1584744982491-665216d95f8b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
    views: `2137`,
  },
];
///////////////////////////

/** Compare two objects that contain a 'date' attribute. */
function sortArticles(article1, article2) {
  return new Date(article2.date) - new Date(article1.date);
}

const News = ({ setPage }) => {
  const [pageIdx, setPageIdx] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [dataMain, setDataMain] = useState([]);
  const [dataPrimary, setDataPrimary] = useState([]);
  const [dataSecondary, setDataSecondary] = useState([]);
  let params = useParams();

  /** Fetch the data for the news article previews. */
  function fetchData(pageNumber, itemsOnPage) {
    /** Populate the data containers with the API request response's JSON data. */
    function processJsonData(data) {
      if (!data) {
        console.log("Could not retrieve data");
        return setLoaded(true);
      }
      const _data = {
        main: [],
        primary: [],
        secondary: [],
      };
      for (let article of data.contents.sort(sortArticles)) {
        if (!article.photo) {
          article.photo = DEFAULT_IMAGE;
        }
        if (_data.primary.length < 3) {
          _data.primary.push(article);
          continue;
        }
        if (_data.secondary.length < 4) {
          _data.secondary.push(article);
          continue;
        }
        _data.main.push(article);
      }
      const newCache = {
        date: new Date(),
        dataMain: _data.main,
        dataPrimary: _data.primary,
        dataSecondary: _data.secondary,
      }
      localStorage.setItem(
        `page_${pageNumber}`,
        JSON.stringify(newCache)
      );
      console.log("Created cache for news data.", newCache);
      setDataMain(_data.main);
      setDataPrimary(_data.primary);
      setDataSecondary(_data.secondary);
      setLoaded(true);
    }

    // check if there is a valid news data cache
    const cache = JSON.parse(localStorage.getItem(`page_${pageNumber}`));
    if (cache) {
      // check if the cache is younger than 24 hours old
      const cacheDate = Date.parse(cache.date);
      const dateDifferenceSeconds = (new Date() - cacheDate) / 1000;
      if (dateDifferenceSeconds / 3600 < MAX_CACHE_AGE) {
        console.log("Found existing cache for news data.", cache);
        setDataMain(cache.dataMain);
        setDataPrimary(cache.dataPrimary);
        setDataSecondary(cache.dataSecondary);
        return setLoaded(true);
      }
      // the cache is too old
      localStorage.removeItem(`page_${pageNumber}`);
    }

    // Set URL parameters
    const url = `${API_URL}?page=${pageNumber}&items=${itemsOnPage}`;
    fetch(url).then((res) => {
      res.json().then(processJsonData);
    });
  }

  useEffect(() => {
    setPage("news");
    fetchData(pageIdx, ITEMS_PER_PAGE);
  }, [pageIdx]);

  const _renderPreview = (data, type) => {
    if (data === undefined) {
      return null;
    }
    const elem =
      type === "main"
        ? PostCardMain
        : type === "primary"
        ? PostCardPrimary
        : PostCardSecondary;
    return data.map((el, idx) =>
      React.createElement(elem, { key: el.id + idx, data: el })
    );
  };

  if (params.postID !== undefined) {
    return <Outlet />;
  } else if (!loaded) {
    console.log("Loading news..");
    return (
      <div className="page-main" style={{ minHeight: "100vh" }}>
        {/* loading animation */}
        Trwa ładowanie aktualności...
      </div>
    );
  } else {
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
          <meta property="og:image" content="" /> {/* IMAGE TO BE ADDED */}
        </MetaTags>
        <div className="primary-grid">
          {_renderPreview(dataPrimary, "primary")}
        </div>
        <div className="secondary-grid">
          {_renderPreview(dataSecondary, "secondary")}
        </div>
        <div className="main-grid">{_renderPreview(dataMain, "main")}</div>
      </div>
    );
  }
};

export default News;
