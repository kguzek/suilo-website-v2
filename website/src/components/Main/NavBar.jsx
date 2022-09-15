import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Hamburger from "hamburger-react";
import LogoSU from "../../media/LogoSU";
import { CollapseableLink } from "./CollapseableLink";

const NavBar = ({ page, userInfo, loginAction, logoutAction, screenWidth }) => {
  const [isOpen, setOpen] = useState(false);

  const [isSafeToChange, setSafety] = useState(true);
  // Determine if the current user is permitted to edit any pages
  const userIsEditor =
    userInfo?.isAdmin || (userInfo?.canEdit ?? []).length > 0;

  useEffect(() => {
    setSafety(false);
    setTimeout(() => {
      setSafety(true);
    }, 250);
  }, [isOpen]);

  const _handleLogin = () => {
    if (userInfo) {
      logoutAction();
    } else {
      loginAction();
    }
  };

  function getIndicatorWidth() {
    const widths = {
      home: "translate-x-[2rem]",
      news: "translate-x-[8.425rem]",
      events: "translate-x-[16.7rem]",
      contact: "translate-x-[24.55rem]",
      other: "translate-x-[30.575rem]",
      default: "translate-x-[2rem]",
    };
    if (page) {
      for (const key in widths) {
        if (
          page === "edit" ||
          page === "archive" ||
          page === "voting" ||
          page === "marketplace"
        ) {
          return widths["other"];
        }
        if (page.startsWith(key)) {
          return widths[key];
        }
        if (page?.includes("post")) {
          return widths.news;
        }
        if (key === "edit" && !userIsEditor) {
          break;
        }
      }
    }
    return widths.default;
  }

  function getIndicatorTransform() {
    const transforms = {
      home: "w-9",
      news: "w-[4rem]",
      events: "w-[3.8rem]",
      contact: "w-11",
      other: "w-8",
      default: "w-9",
    };
    if (page) {
      for (const key in transforms) {
        if (
          page === "edit" ||
          page === "archive" ||
          page === "voting" ||
          page === "marketplace"
        ) {
          return transforms["other"];
        }
        if (!page.startsWith(key)) {
          continue;
        }
        if (key === "edit" && !userIsEditor) {
          break;
        }

        return transforms[key];
      }
    }
    return transforms.default;
  }

  if (screenWidth > 800) {
    return (
      <div
        className={`w-11/12 xl:w-10/12 z-50 flex flex-row justify-between align-middle absolute m-auto top-0 mt-0`}
      >
        <Link to="/" className="mt-3">
          <LogoSU width="3.5em" height="3.5em" />
        </Link>
        <div className=" relative">
          <div
            className={`absolute -top-[.1rem] bg-primary h-[.45rem] rounded-b-xl ${getIndicatorWidth()} ${getIndicatorTransform()} transition-all duration-300`}
          />
          <nav className="mt-5 w-fit m-auto">
            <Link
              to="/"
              className={`mx-4 p-2 relative group  transition duration-200 font-medium text-sm ${
                page === "home" ? "text-text1" : "text-text4"
              }`}
            >
              Główna
              <div className="absolute bottom-[.35rem] bg-primary left-0 ml-[.4rem] right-0 w-0 h-[2px] group-hover:w-10/12 transition-all duration-250 " />
            </Link>
            <Link
              to="aktualnosci"
              className={`mx-4 p-2 relative group transition duration-200 font-medium text-sm ${
                page === "news" || page?.includes("post")
                  ? "text-text1"
                  : "text-text4"
              }`}
            >
              Aktualności
              <div className="absolute bottom-[.35rem] bg-primary left-0 ml-[.32rem] right-0 w-0 h-[2px] group-hover:w-[90%] transition-all duration-250 " />
            </Link>
            <Link
              to="wydarzenia"
              className={`mx-4 p-2 relative group transition duration-200 font-medium text-sm ${
                page === "events" ? "text-text1" : "text-text4"
              }`}
            >
              Wydarzenia
              <div className="absolute bottom-[.35rem] bg-primary left-0 ml-[.32rem] right-0 w-0 h-[2px] group-hover:w-[90%] transition-all duration-250 " />
            </Link>
            <Link
              to="kontakt"
              className={`mx-4 p-2 relative group transition duration-200 font-medium text-sm ${
                page === "contact" ? "text-text1" : "text-text4"
              }`}
            >
              Kontakt
              <div className="absolute bottom-[.35rem] bg-primary left-0 ml-[.4rem] right-0 w-0 h-[2px] group-hover:w-10/12 transition-all duration-250 " />
            </Link>
            <CollapseableLink page={page}>
              <Link
                to="kiermasz"
                className={`mx-auto p-2 w-min relative group transition duration-200 font-medium text-sm ${
                  page === "marketplace" ? "text-text1" : "text-text4"
                }`}
              >
                Kiermasz
                <div className="absolute bottom-[.35rem] bg-primary left-0 ml-[.4rem] right-0 w-0 h-[2px] group-hover:w-[86%] transition-all duration-250 " />
              </Link>
              <Link
                to="glosowanie"
                className={`mx-auto p-2 relative group w-min transition duration-200 font-medium text-sm  ${
                  page === "voting" ? "text-text1" : "text-text4"
                }`}
              >
                Głosowanie
                <div className="absolute bottom-[.35rem] bg-primary left-0 ml-[.4rem] right-0 w-0 h-[2px] group-hover:w-[88%] transition-all duration-250 " />
              </Link>
              <Link
                to="archiwum-numerkow"
                className={`mx-auto p-2 relative group w-min whitespace-nowrap transition duration-200 font-medium text-sm ${
                  page === "archive" ? "text-text1" : "text-text4"
                }`}
              >
                Archiwum numerków
                <div className="absolute bottom-[.35rem] bg-primary left-0 ml-[.4rem] right-0 w-0 h-[2px] group-hover:w-[93%] transition-all duration-250 " />
              </Link>
              {userIsEditor && (
                <Link
                  to="edycja"
                  className={`mx-auto p-2 relative group w-min transition duration-200 font-medium text-sm ${
                    page === "edit" ? "text-text1" : "text-text4"
                  }`}
                >
                  Edycja
                  <div className="absolute bottom-[.35rem] bg-primary left-0 ml-[.4rem] right-0 w-0 h-[2px] group-hover:w-[81.5%] transition-all duration-250 " />
                </Link>
              )}
            </CollapseableLink>
          </nav>
        </div>
        <div className={`my-auto`}>
          <button
            className="text-sm font-medium text-primary  bg-white transition-all hover:drop-shadow-4xl drop-shadow-3xl hover:ring-primaryDark hover:ring-4 rounded-[.6rem] h-fit my-auto px-[1.4rem] py-[.675rem] -ml-7"
            onClick={_handleLogin}
          >
            {userInfo ? "Wyloguj się" : "Zaloguj się"}
          </button>
        </div>
      </div>
    );
  } else {
    return (
      <div
        className={`flex flex-row z-50 justify-between align-middle w-11/12 absolute m-auto top-0 mt-4`}
      >
        <Link to="/">
          <LogoSU width={40} height={40} />
        </Link>
        <div className="relative w-3/4">
          <div
            className={`
              ${isOpen ? "bg-white" : "bg-transparent"}
              ${isOpen ? "drop-shadow-2xl" : "drop-shadow-none"}
              ${isOpen ? "h-fit" : "h-11"}
              absolute right-0 -top-2
              transition-all
              w-full
              -mr-3
              rounded-2xl
              z-50
              duration-200
            `}
          >
            <div className="flex justify-between">
              <div />
              <Hamburger
                toggled={isOpen}
                toggle={isSafeToChange ? setOpen : null}
                duration={0.3}
                distance="md"
                color={isOpen ? "#FFA900" : "#fff"}
                rounded
                size={26}
              />
            </div>
            <nav
              className={`
                ${isOpen ? "flex" : "hidden"}
                ${isOpen ? "opacity-100" : "opacity-0"}
                flex-col
                relative
                justify-center
                align-top
                transition-all
                duration-200
              `}
            >
              <Link
                onClick={() => setOpen(false)}
                to="/"
                className={`
                  flex
                  ${isOpen ? "opacity-100" : "opacity-0"}
                  ${
                    page === "home"
                      ? "text-text1 underline decoration-primary"
                      : "text-text4"
                  }
                  w-fit
                  text-xl
                  px-6
                  py-2
                  my-2
                  m-auto
                  transition-all
                  duration-200
                `}
              >
                Główna
              </Link>
              <Link
                onClick={() => setOpen(false)}
                to="aktualnosci"
                className={`
                  flex
                  ${isOpen ? "opacity-100" : "opacity-0"}
                  ${
                    page === "news" || page?.includes("post")
                      ? "text-text1 underline decoration-primary"
                      : "text-text4"
                  }
                  w-fit
                  text-xl
                  px-6
                  py-2
                  my-2
                  m-auto
                  transition-all
                  duration-200
                `}
              >
                Aktualności
              </Link>
              <Link
                onClick={() => setOpen(false)}
                to="wydarzenia"
                className={`
                  flex
                  ${isOpen ? "opacity-100" : "opacity-0"}
                  ${
                    page === "events"
                      ? "text-text1 underline decoration-primary"
                      : "text-text4"
                  }
                  w-fit
                  text-xl
                  px-6
                  py-2
                  my-2
                  m-auto
                  transition-all
                  duration-200
                `}
              >
                Wydarzenia
              </Link>
              <Link
                onClick={() => setOpen(false)}
                to="kontakt"
                className={`
                  flex
                  ${isOpen ? "opacity-100" : "opacity-0"}
                  ${
                    page === "contact"
                      ? "text-text1 underline decoration-primary"
                      : "text-text4"
                  }
                  w-fit
                  text-xl
                  px-6
                  py-2
                  my-2
                  m-auto
                  transition-all
                  duration-200
                `}
              >
                Kontakt
              </Link>
              <Link
                onClick={() => setOpen(false)}
                to="kiermasz"
                className={`
                  flex
                  ${isOpen ? "opacity-100" : "opacity-0"}
                  ${
                    page === "marketplace"
                      ? "text-text1 underline decoration-primary"
                      : "text-text4"
                  }
                  w-fit
                  text-xl
                  px-6
                  py-2
                  my-2
                  m-auto
                  transition-all
                  duration-200
                `}
              >
                Kiermasz
              </Link>
              <Link
                onClick={() => setOpen(false)}
                to="glosowanie"
                className={`
                  flex
                  ${isOpen ? "opacity-100" : "opacity-0"}
                  ${
                    page === "voting"
                      ? "text-text1 underline decoration-primary"
                      : "text-text4"
                  }
                  w-fit
                  text-xl
                  px-6
                  py-2
                  my-2
                  m-auto
                  transition-all
                  duration-200
                `}
              >
                Głosowanie
              </Link>
              <Link
                onClick={() => setOpen(false)}
                to="archiwum-numerkow"
                className={`
                  flex
                  ${isOpen ? "opacity-100" : "opacity-0"}
                  ${
                    page === "archive"
                      ? "text-text1 underline decoration-primary"
                      : "text-text4"
                  }
                  w-fit
                  text-xl
                  px-6
                  py-2
                  my-2
                  m-auto
                  transition-all
                  duration-200
                `}
              >
                Numerki
              </Link>
              {userInfo ? (
                <Link
                  onClick={() => setOpen(false)}
                  to="edycja"
                  className={`
                  flex
                  ${isOpen ? "opacity-100" : "opacity-0"}
                  ${
                    page === "edit"
                      ? "text-text1 underline decoration-primary"
                      : "text-text4"
                  }
                  w-fit
                  text-xl
                  px-6
                  py-2
                  my-2
                  m-auto
                  transition-all
                  duration-200
                `}
                >
                  {" "}
                  Edycja
                </Link>
              ) : null}
              <div
                className={`
                  ${isOpen ? "opacity-100" : "opacity-0"}
                  bg-primary
                  m-auto
                  w-fit
                  inline-flex
                  justify-center
                  mt-6
                  py-3
                  px-6 
                  mb-7 
                  drop-shadow-md
                  cursor-pointer
                  transition-all
                  duration-200
                  rounded-lg
                `}
                onClick={() => {
                  _handleLogin();
                  setOpen(false);
                }}
              >
                <p className="text-white text-md font-medium">
                  {userInfo ? "Wyloguj się" : "Zaloguj się"}
                </p>
              </div>
            </nav>
          </div>
        </div>
      </div>
    );
  }
};

export default NavBar;
