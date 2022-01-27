import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MetaTags from "react-meta-tags";
import { ArrowRight, Youtube, Instagram, Facebook } from "react-feather";
import { useCookies } from "react-cookie";
import Blob from "../media/blob";
import SuPhoto from "../media/su-photo.jpg";
import PostCardPreview, { fetchNewsData } from "../components/PostCardPreview";
import { SECONDARY_ITEMS_DEFAULT } from "../components/PostCardPreview";
import { API_URL, formatDate } from "../misc";

const Home = ({ setPage }) => {
  const [luckyNumbers, setLuckyNumbers] = useState([3, 14]);
  const [forDate, setForDate] = useState(formatDate());
  const [newsData, setNewsData] = useState([{}]);
  const [cookies, setCookies, removeCookies] = useCookies();

  function fetchLuckyNumbers() {
    const cache = cookies.lucky_numbers_cache;
    if (cache && cache.date === formatDate()) {
      // console.log("Found existing cache for lucky numbers data.");
      setLuckyNumbers(cache.luckyNumbers);
      setForDate(cache.date);
      return;
    }
    fetch(`${API_URL}/luckyNumbers/v2`).then((res) => {
      if (res.status !== 200) {
        setLuckyNumbers(["?", "?"]);
        return;
      }
      res.json().then((data) => {
        if (!data) {
          setLuckyNumbers(["?", "?"]);
          return;
        }
        const newCache = {
          date: formatDate(data.date),
          luckyNumbers: data.luckyNumbers,
          excludedClasses: data.excludedClasses,
        };
        console.log("Created new cache for lucky numbers data.");
        setLuckyNumbers(data.luckyNumbers);
        setForDate(newCache.date);
        setCookies("lucky_numbers_cache", newCache, { sameSite: "lax" });
      });
    });
  }

  useEffect(() => {
    setPage("home");
    fetchLuckyNumbers();
    fetchNewsData({ setNewsData, maxItems: SECONDARY_ITEMS_DEFAULT });
  }, []);

  const _scrollDown = () => {
    document
      .getElementsByClassName("home-2")[0]
      .scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <div className="page-main">
      <MetaTags>
        <title>
          Samorząd Uczniowski 1 Liceum Ogólnokształcącego w Gliwicach
        </title>
        <meta
          name="description"
          content={`Oficjalna strona internetowa Samorządu Uczniowskiego 1 Liceum Ogólnokształcącego w Gliwicach Gliwice. Informacje z życia szkoły, o Samorządzie i  kontakt. Szczęśliwe numerki na dzień ${forDate} to: ${luckyNumbers[0]} i ${luckyNumbers[1]}`}
        />
        <meta
          property="og:title"
          content="Samorząd Uczniowski 1 Liceum Ogólnokształcącego w Gliwicach"
        />
        <meta property="og:image" content="" /> {/* IMAGE TO BE ADDED */}
      </MetaTags>
      <div className="home-1">
        <div className="CTA">
          <h1>Samorząd Uczniowski</h1>
          <h4>I Liceum Ogólnokształcącego w Gliwicach</h4>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              marginTop: "0em",
            }}
          >
            <Link to="/aktualnosci" className="CTA-primary">
              Nasze działania
            </Link>
            <Link
              to="/kontakt"
              className="CTA-secondary"
              style={{ marginLeft: "1.5em" }}
            >
              Kontakt
            </Link>
          </div>
        </div>
        <div
          className="LN"
          title={`szczęśliwe numerki na dziś to: ${luckyNumbers[0]} i ${luckyNumbers[1]} `}
        >
          <h5>Szczęśliwe numerki:</h5>
          <div className="LN-box">
            <div className="LN-container">
              <p className="LN-txt">{luckyNumbers[0]}</p>
            </div>
            <div className="LN-container">
              <p className="LN-txt">{luckyNumbers[1]}</p>
            </div>
          </div>
          <h5
            style={{
              paddingTop: ".45em",
              fontSize: "1.4em",
              opacity: ".9",
              paddingBottom: "2vh",
            }}
          >
            {forDate}
          </h5>
        </div>
        <div className="more" onClick={() => _scrollDown()}>
          <div className="more1" />
          <div className="more2">więcej</div>
        </div>
      </div>
      <div className="home-2">
        <div className="top-description">
          <div className="description-image">
            <img
              src={SuPhoto}
              alt="Zdjęcie przewodniczących wchodzących w główny skład Samorządu Uczniowskiego 1 Liceum Ogólnokształcącego w Gliwicach"
            />
          </div>
          <div
            className="info-part"
            title="Kim jest Samorząd Uczniowski 1 Liceum Ogólnokształcącego w Gliwicach"
          >
            <h2 className="description-header" title="informacje o Samorządzie">
              Nasza drużyna
            </h2>
            <p className="description-p">
              Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
              nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
              erat, sed diam voluptua. At vero eos et accusam et justo duo
              dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
              sanctus est Lorem ipsum dolor sit amet. Lorem
            </p>
          </div>
        </div>
      </div>
      <div className="main-roles">
        <div className="person-container">
          <p className="person-class">2C</p>
          <img className="person-avatar" alt="Szymon Wróbel" />
          <div
            className="person-description"
            title="Marszałek Samorządu Uczniowskiego 1 Liceum Ogólnokształcącego w Gliwicach"
          >
            <p className="person-name">Szymon Wróbel</p>
            <p className="person-role">Marszałek</p>
          </div>
        </div>
        <div className="person-container">
          <p className="person-class">3Ap</p>
          <img className="person-avatar" alt="Adam Kurzak" />
          <div
            className="person-description"
            title="Sekretarz Samorządu Uczniowskiego 1 Liceum Ogólnokształcącego w Gliwicach"
          >
            <p className="person-name">Adam Kurzak</p>
            <p className="person-role">Sekretarz</p>
          </div>
        </div>
        <div className="person-container">
          <p className="person-class">3Bg</p>
          <img className="person-avatar" alt="Mikołaj Mrózek" />
          <div
            className="person-description"
            title="Skarbnik i Konsultant Samorządu Uczniowskiego 1 Liceum Ogólnokształcącego w Gliwicach"
          >
            <p className="person-name">Mikołaj Mrózek</p>
            <p className="person-role">Skarbink; Konsultant</p>
          </div>
        </div>
        <div className="person-container">
          <img className="person-avatar" alt="Barbara Białowąs" />
          <div
            className="person-description"
            title="Opiekun Samorządu Uczniowskiego 1 Liceum Ogólnokształcącego w Gliwicach"
          >
            <p className="person-name">Barbara Białowąs</p>
            <p className="person-role">Opiekun</p>
          </div>
        </div>
      </div>
      <div className="home-section-header">
        <h2>Aktualności</h2>
        <Link to="/aktualnosci" className="link-more">
          <p>zobacz wszystko</p>
          <ArrowRight
            size={22}
            strokeWidth={"2px"}
            style={{ marginBottom: "-0em" }}
            color="#FFA900"
          />
        </Link>
      </div>
      <PostCardPreview
        type="secondary"
        data={newsData}
        linkPrefix="aktualnosci/post/"
        classOverride="home-3"
        startIndex={0}
      />
      <div className="home-4">
        <a
          className="social-media-btn"
          href="https://www.facebook.com/SUILOGliwice"
          target="_blank"
        >
          <Facebook size={44} strokeWidth={1.35} color="#858585" />
          <p>/SUILOGliwice</p>
        </a>
        <a
          className="social-media-btn"
          href="https://www.instagram.com/suilo_gliwice/"
          target="_blank"
        >
          <Instagram
            size={44}
            strokeWidth={1.35}
            color="#858585"
            style={{ marginRight: ".4em" }}
          />
          <p>/suilo_gliwice</p>
        </a>
        <a
          className="social-media-btn"
          href="https://www.youtube.com/channel/UCOHtZM1JWEVaWs8pZATmZ_g"
          target="_blank"
        >
          <Youtube
            size={44}
            strokeWidth={1.35}
            color="#858585"
            style={{ marginRight: ".4em" }}
          />
          <p>/SUILOGliwice</p>
        </a>
        <a
          className="social-media-btn"
          href="https://www.instagram.com/jedynkatv/"
          target="_blank"
        >
          <Instagram
            size={44}
            strokeWidth={1.35}
            color="#858585"
            style={{ marginRight: ".4em" }}
          />
          <p>/jedynkatv</p>
        </a>
        <a
          className="social-media-btn"
          href="https://www.youtube.com/channel/UC48_30_99lSOq_ZyuTe9yOA"
          target="_blank"
        >
          <Youtube
            size={44}
            strokeWidth={1.35}
            color="#858585"
            style={{ marginRight: ".4em" }}
          />
          <p>/JedynkaTV</p>
        </a>
      </div>
    </div>
  );
};

export default Home;
