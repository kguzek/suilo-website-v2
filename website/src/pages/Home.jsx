import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MetaTags from "react-meta-tags";
import { ArrowRight, Youtube, Instagram, Facebook } from "react-feather";
import PostCardPreview, {
  fetchNewsData,
} from "../components/News/PostCardPreview";
import SuPhoto from "../media/su-photo.jpg";
import { fetchCachedData, formatDate } from "../misc";
import LoadingScreen from "../components/LoadingScreen";

const Home = ({ setPage, reload, setReload, screenWidth }) => {
  const [newsData, setNewsData] = useState([]);
  const [numbersData, setNumbersData] = useState({});
  const [loadedNews, setLoadedNews] = useState(false);
  const [loadedNumbers, setLoadedNumbers] = useState(false);

  const newsItems =
    screenWidth > 1024 ? 5 : screenWidth > 768 ? 4 : screenWidth > 640 ? 3 : 2;

  /** Fetch the news data from cache or API. */
  function fetchNews() {
    setLoadedNews(false);
    fetchNewsData({
      setNewsData,
      setLoaded: setLoadedNews,
      maxItems: 5,
    });
  }

  /** Fetch the lucky numbers data from cache or API. */
  function fetchLuckyNumbers(forceUpdate = false) {
    setLoadedNumbers(false);
    const fetchArgs = {
      setData: setNumbersData,
      setLoaded: setLoadedNumbers,
      updateCache: forceUpdate,
    };
    fetchCachedData("luckyNumbers", "/luckyNumbers/v2", fetchArgs);
  }

  useEffect(() => {
    setPage("home");
    fetchLuckyNumbers();
    fetchNews();
  }, []);

  useEffect(() => {
    if (!reload) {
      return;
    }
    // The page content has updated on the server side; reload it
    setReload(false);
    fetchNews();
    fetchLuckyNumbers();
  }, [reload]);

  const _scrollDown = () => {
    document
      .getElementById("home-2")
      .scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const forDate = formatDate(numbersData.date);
  const luckyNumbers = loadedNumbers
    ? numbersData.luckyNumbers
    : ["...", "..."];

  return (
    <div className="flex w-11/12 xl:w-10/12 flex-col justify-center align-top">
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
      <div className=" -mt-14 md:-mt-[4.5rem]  h-screen w-full grid grid-cols-1 lg:grid-cols-5 relative justify-items-stretch content-center">
        <div className="flex flex-col pb-3 pt-4 col-span-1 lg:col-span-3">
          <h1 className="font-bold text-text1 text-5xl pb-2 lg:text-10xl lg:pb-0 xl:text-[3.5rem]">
            Samorząd Uczniowski
          </h1>
          <h4 className="font-normal text-text4 pb-1 mb-4 xl:mb-6 text-xl sm:text-2xl  xl:text-[1.65rem]">
            I Liceum Ogólnokształcącego w Gliwicach
          </h4>
          <div className="inline-flex flex-row justify-start align-middle">
            <Link
              to="/aktualnosci"
              className="text-white text-md sm:text-lg xl:text-xl font-medium whitespace-nowrap bg-gradient-to-br from-primary to-secondary rounded-[.95rem] px-5 py-2 sm:py-[.625rem] sm:px-8 xl:py-[.75rem] xl:px-10 drop-shadow-3xl hover:drop-shadow-4xl active:drop-shadow-5xl hover:scale-[1.015] active:scale-[.985] animate-all"
            >
              Nasze działania
            </Link>
            <Link
              to="/kontakt"
              className="ml-9 sm:ml-10 etxt-primary py-2 sm:py-[.625rem] text-md sm:text-lg  xl:text-xl xl:ml-12 xl:py-[.75rem] font-regular transition-all hover:text-primaryDark"
            >
              Kontakt
            </Link>
          </div>
        </div>
        <div
          className="flex flex-col pt-8 md:pt-0 col-span-1 lg:col-span-2 sm:pt-7 sm:-mb-6 lg:mb-0"
          title={`Szczęśliwe numerki na ${forDate} to ${luckyNumbers[0]} i ${luckyNumbers[1]}.`}
        >
          <h5 className="font-light text-text2 text-xl lg:text-white lg:text-2xl xl:text-[1.6rem] text-right mt-5 lg:mt-0 pt-3 pb-2 lg:pt-0 ">
            Szczęśliwe numerki:
          </h5>
          <div className="flex flex-row justify-end">
            <div className="bg-white rounded-2xl w-28 md:w-32 lg:w-[8.75rem] xl:w-[9.25rem] lg:rounded-[1.25rem] transition-all aspect-LN justify-center align-middle inline-flex drop-shadow-3xl ">
              <p className="font-extrabold text-primary text-6xl md:text-7xl xl:text-[4.85rem] m-auto">
                {luckyNumbers[0]}
              </p>
            </div>
            <div className="bg-white rounded-2xl w-28 md:w-32 lg:w-[8.75rem] xl:w-[9.25rem] lg:rounded-[1.25rem] transition-all aspect-LN justify-center align-middle inline-flex drop-shadow-3xl ml-5">
              <p className="font-extrabold text-primary text-6xl md:text-7xl xl:text-[4.85rem] m-auto">
                {luckyNumbers[1]}
              </p>
            </div>
          </div>
          <div className="inline-flex justify-end">
            <Link to="/archiwum-numerkow" className="w-fit">
              <h5 className="opacity-90 font-normal pt-2 text-lg lg:text-xl text-text2 lg:text-white text-right">
                {forDate}
              </h5>
            </Link>
          </div>
        </div>
        <div
          className="more animate-bounce -rotate-90 duration-[5000]"
          onClick={_scrollDown}
        >
          <div className="-rotate-90 origin-bottom-left">
            <div className="more1" />
            <div className="more2">więcej</div>
          </div>
        </div>
      </div>
      <div id="home-2" className="w-full my-24 py-9 pb-0 mb-14 lg:mb-16">
        <div className="grid w-full grid-cols-1 align-center lg:grid-cols-2 m-auto relative">
          <div className="w-full m-auto rounded-xl relative lg:pr-10">
            <img
              className="drop-shadow-2lg rounded-xl md:rounded-3xl"
              src={SuPhoto}
              alt="Zdjęcie przewodniczących wchodzących w główny skład Samorządu Uczniowskiego 1 Liceum Ogólnokształcącego w Gliwicach"
            />
          </div>
          <article
            className="w-full lg:pl-3 lg:m-auto"
            title="O Samorządzie Uczniowskim 1 Liceum Ogólnokształcącego w Gliwicach"
          >
            <h2 className="text-text1 font-bold text-3xl xl:text-4xl pt-5 lg:pt-0">
              Nasza drużyna
            </h2>
            <p className="text-text2 select-all font-normal leading-8 text-lg xl:text-[1.2rem] xl:leading-[2.2rem] text-left md:text-left pt-3">
              Do Samorządu Uczniowskiego I Liceum Ogólnokształcącego im. Edwarda
              Dembowskiego w Gliwicach należą wszyscy uczniowie, a w jego radzie
              zasiadają przewodniczący klas oraz osoby wybrane na stanowiska
              Marszałka, Sekretarza i Skarbnika. Wspólnie dbamy o to, aby
              szkolna norma była bardziej atrakcyjna, a codzienność - bardziej
              urozmaicona. Organizujemy i współorganizujemy wydarzenia
              okolicznościowe, prowadzimy tzw. szczęśliwe numerki, niesiemy
              pomoc poprzez nagłaśnianie spraw uczniowskich, organizację zbiórek
              i wiele innych. Jesteśmy tu dla was -&nbsp;
              <i className="font-medium text-text2">od uczniów dla uczniów.</i>
            </p>
          </article>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 w-full gap-2 sm:gap-4 mb-20 place-content-stretch place-items-center lg:gap-8 xl:gap-16 lg:w-11/12 m-auto">
        <div className="relative inline-flex flex-col justify-center w-11/12 sm:w-9/12 md:w-full 2xl:w-11/12">
          <p className="absolute text-[#f0f0f0] -z-10 xl:-bottom-[3.5rem] text-5xl -bottom-9 -right-3 xl:-right-8 font-extrabold xl:text-[4.4rem]">
            2C
          </p>
          <img
            src={require("../media/wrobel.jpg")}
            className="z-10  drop-shadow-3xl bg-red-500 aspect-square w-2/5 m-auto rounded-full translate-y-2/5"
            alt="Szymon Wróbel"
          />
          <div
            className="bg-white w-full drop-shadow-3xl py-4 rounded-xl inline-flex align-middle flex-col"
            title="Marszałek Samorządu Uczniowskiego 1 Liceum Ogólnokształcącego w Gliwicach"
          >
            <p className="text-text1 font-semibold whitespace-nowrap m-auto mt-4 text-base sm:text-xl sm:mt-12 md:mt-4 md:text-base select-all lg:text-xl lg:mt-7">
              Szymon Wróbel
            </p>
            <p className="text-text1 font-extralight whitespace-nowrap m-auto italic text-sm lg:mb-1">
              Marszałek
            </p>
          </div>
        </div>
        <div className="relative inline-flex flex-col justify-center w-11/12 sm:w-9/12 md:w-full 2xl:w-11/12">
          <p className="absolute text-[#f0f0f0] -z-10 xl:-bottom-[3.5rem] text-5xl -bottom-9 -right-3 xl:-right-8 font-extrabold xl:text-[4.4rem]">
            3Ap
          </p>
          <img
            src={require("../media/kurzak.jpg")}
            className="z-10  drop-shadow-3xl bg-red-500 aspect-square w-2/5 m-auto rounded-full translate-y-2/5"
            alt="Adam Kurzak"
          />
          <div
            className="bg-white w-full drop-shadow-3xl py-4 rounded-xl inline-flex align-middle flex-col"
            title="Sekretarz Samorządu Uczniowskiego 1 Liceum Ogólnokształcącego w Gliwicach"
          >
            <p className="text-text1 font-semibold whitespace-nowrap m-auto mt-4 text-base sm:text-xl sm:mt-12 md:mt-4 md:text-base lg:text-xl select-all lg:mt-7">
              Adam Kurzak
            </p>
            <p className="text-text1 font-extralight whitespace-nowrap m-auto italic text-sm lg:mb-1">
              Sekretarz
            </p>
          </div>
        </div>
        <div className="relative inline-flex flex-col justify-center w-11/12 sm:w-9/12 md:w-full 2xl:w-11/12">
          <p className="absolute text-[#f0f0f0] -z-10 xl:-bottom-[3.5rem] text-5xl -bottom-9 -right-3 xl:-right-8 font-extrabold xl:text-[4.4rem]">
            3Bg
          </p>
          <img
            src={require("../media/mruz.jpg")}
            className="z-10 drop-shadow-3xl bg-red-500 aspect-square w-2/5 m-auto rounded-full translate-y-2/5"
            alt="Mikołaj Mrózek"
          />
          <div
            className="bg-white w-full drop-shadow-3xl py-4 rounded-xl inline-flex align-middle flex-col"
            title="Skarbnik i Konsultant Samorządu Uczniowskiego 1 Liceum Ogólnokształcącego w Gliwicach"
          >
            <p className="text-text1 font-semibold whitespace-nowrap m-auto mt-4 text-base sm:text-xl select-all sm:mt-12 md:mt-4 md:text-base lg:text-xl lg:mt-7">
              Mikołaj Mrózek
            </p>
            <p className="text-text1 font-extralight whitespace-nowrap m-auto italic text-sm lg:mb-1">
              Skarbnik
            </p>
          </div>
        </div>
        <div className="relative inline-flex flex-col justify-center w-11/12 sm:w-9/12 md:w-full 2xl:w-11/12">
          <img
            src={require("../media/bialowas.png")}
            className="z-10  drop-shadow-3xl aspect-square w-2/5 m-auto rounded-full translate-y-2/5"
            alt="Barbara Białowąs"
          />
          <div
            className="bg-white w-full drop-shadow-3xl py-4 rounded-xl inline-flex align-middle flex-col"
            title="Opiekun Samorządu Uczniowskiego 1 Liceum Ogólnokształcącego w Gliwicach"
          >
            <p className="text-text1 -tracking-[0.015rem] font-semibold whitespace-nowrap m-auto mt-4 text-base sm:text-xl sm:mt-12 md:mt-4 md:text-base select-all lg:text-xl lg:mt-7">
              Barbara Białowąs
            </p>
            <p className="text-text1 font-extralight whitespace-nowrap m-auto italic text-sm lg:mb-1">
              Opiekun
            </p>
          </div>
        </div>
      </div>
      <div className="w-full justify-between inline-flex align-bottom flex-row mt-16">
        <h2 className="text-text1 font-semibold text-2xl lg:text-3xl text-left">
          Aktualności
        </h2>
        <Link
          to="/aktualnosci"
          className="inline-flex flex-row align-middle group transition-all pt-1"
        >
          <p className="text-primary font-medium m-auto group-hover:text-primaryDark transition-all text-sm sm:text-base">
            zobacz wszystko
          </p>
          <ArrowRight
            size={22}
            className="m-auto mb-[.2rem] ml-1 stroke-primary group-hover:stroke-primaryDark transition-all stroke-[1.75] sm:stroke-2"
          />
        </Link>
      </div>
      {loadedNews ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 w-full gap-3 grid-rows-1 sm:gap-4 my-2 mb-8 ">
          <PostCardPreview
            type="secondary"
            data={newsData}
            linkPrefix="aktualnosci/post/"
            classOverride="home-3"
            startIndex={0}
            numItems={newsItems}
          />
        </div>
      ) : (
        <LoadingScreen fullscreen={false} />
      )}

      <div className="flex flex-row flex-wrap justify-center align-middle mb-5 mt-4 lg:mb-7 lg:mt-6 lg:w-full lg:justify-around">
        <a
          className="cursor-pointer text-[#858585] opacity-75 hover:opacity-100 transition-all px-5 py-3 inline-flex flex-row align-middle"
          href="https://www.facebook.com/SUILOGliwice"
          target="_blank"
          rel="noreferrer"
        >
          <Facebook size={38} strokeWidth={1.4} color="#858585" />
          <p className="font-semibold text-lg tracking-wide m-auto">
            /SUILOGliwice
          </p>
        </a>
        <a
          className="cursor-pointer text-[#858585] opacity-75 hover:opacity-100 transition-all px-5 py-3 inline-flex flex-row align-middle"
          href="https://www.instagram.com/suilo_gliwice/"
          target="_blank"
          rel="noreferrer"
        >
          <Instagram
            size={38}
            strokeWidth={1.4}
            color="#858585"
            style={{ marginRight: ".4em" }}
          />
          <p className="font-semibold text-lg tracking-wide m-auto">
            /suilo_gliwice
          </p>
        </a>
        <a
          className="cursor-pointer text-[#858585] opacity-75 hover:opacity-100 transition-all px-5 py-3 inline-flex flex-row align-middle"
          href="https://www.youtube.com/channel/UCOHtZM1JWEVaWs8pZATmZ_g"
          target="_blank"
          rel="noreferrer"
        >
          <Youtube
            size={38}
            strokeWidth={1.4}
            color="#858585"
            style={{ marginRight: ".4em" }}
          />
          <p className="font-semibold text-lg tracking-wide m-auto">
            /SUILOGliwice
          </p>
        </a>
        <a
          className="cursor-pointer text-[#858585] opacity-75 hover:opacity-100 transition-all px-5 py-3 inline-flex flex-row align-middle"
          href="https://www.instagram.com/jedynkatv/"
          target="_blank"
          rel="noreferrer"
        >
          <Instagram
            size={38}
            strokeWidth={1.4}
            color="#858585"
            style={{ marginRight: ".4em" }}
          />
          <p className="font-semibold text-lg tracking-wide m-auto">
            /jedynkatv
          </p>
        </a>
        <a
          className="cursor-pointer text-[#858585] opacity-75 hover:opacity-100 transition-all px-5 py-3 inline-flex flex-row align-middle"
          href="https://www.youtube.com/channel/UC48_30_99lSOq_ZyuTe9yOA"
          target="_blank"
          rel="noreferrer"
        >
          <Youtube
            size={38}
            strokeWidth={1.4}
            color="#858585"
            style={{ marginRight: ".4em" }}
          />
          <p className="font-semibold text-lg tracking-wide m-auto">
            /JedynkaTV
          </p>
        </a>
      </div>
    </div>
  );
};

export default Home;
