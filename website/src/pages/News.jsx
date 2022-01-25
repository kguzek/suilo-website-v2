import React, { useState, useEffect } from "react";
import { Outlet, useParams, useNavigate } from "react-router-dom";
import MetaTags from "react-meta-tags";
import { PostCardPreview, fetchData } from "../components/PostCardPreview";

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

const News = ({ setPage }) => {
  const [pageIdx, setPageIdx] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [dataMain, setDataMain] = useState([]);
  const [dataPrimary, setDataPrimary] = useState([]);
  const [dataSecondary, setDataSecondary] = useState([]);
  let params = useParams();

  useEffect(() => {
    setPage("news");
    fetchData(
      pageIdx,
      setDataMain,
      setDataPrimary,
      setDataSecondary,
      setLoaded
    );
  }, [pageIdx]);

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
          <PostCardPreview type="primary" data={dataPrimary} />
        </div>
        <div className="secondary-grid">
          <PostCardPreview type="secondary" data={dataSecondary} />
        </div>
        <div className="main-grid">
          <PostCardPreview type="main" data={dataMain} />
        </div>
      </div>
    );
  }
};

export default News;
