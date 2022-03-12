import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MetaTags from "react-meta-tags";
import { Bars } from "react-loader-spinner";
import InputDropdown from "../components/Editor/InputComponents/InputDropdown";
import { fetchNewsData } from "../components/News/PostCardPreview";
import {
  fetchCachedData,
  getFileNameFromFirebaseUrl,
  removeSearchParam,
} from "../misc";
import { updateMetadata } from "firebase/storage";
import { PostEdit } from "../components/Editor/PostEdit";
import { EventEdit } from "../components/Editor/EventEdit";
import { CalendarEdit } from "../components/Editor/CalendarEdit";
import { LinkEdit } from "../components/Editor/LinkEdit";
import { PermissionEdit } from "../components/Editor/PermissionEdit";

const PAGES = {
  news: "Aktualności",
  events: "Wydarzenia",
  calendar: "Kalendarz",
  linkShortener: "Linki",
  permissions: "Uprawnienia",
};

export default function Edit({ setPage, user, userPerms = {}, loginAction }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // `editPicker` is an index of `editPickerOptions`
  const [editPicker, setEditPicker] = useState(0);

  // API data storage
  const [newsData, setNewsData] = useState([]);
  const [eventsData, setEventsData] = useState({});
  const [calendarData, setCalendarData] = useState({});
  const [linksData, setLinksData] = useState({});
  const [loadedNews, setLoadedNews] = useState(false);
  const [loadedEvents, setLoadedEvents] = useState(false);
  const [loadedCalendar, setLoadedCalendar] = useState(false);
  const [loadedLinks, setLoadedLinks] = useState(false);

  // Calendar fetch options
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());

  /** Fetch the news post data from the cache or API. */
  function _fetchNews(forceUpdate = false) {
    setLoadedNews(false);
    fetchNewsData({
      setNewsData,
      setLoaded: setLoadedNews,
      updateCache: forceUpdate,
      allItems: true,
    });
  }

  /** Fetch the events data from the cache or API. */
  function _fetchEvents(forceUpdate = false) {
    setLoadedEvents(false);
    const fetchArgs = {
      setData: setEventsData,
      setLoaded: setLoadedEvents,
      updateCache: forceUpdate,
      onSuccessCallback: (data) =>
        data && !data.errorDescription ? data : null,
    };
    fetchCachedData("events", "/events", fetchArgs);
  }

  /** Fetch the calendar data from the cache or API. */
  function _fetchCalendar(forceUpdate = false) {
    setLoadedCalendar(false);
    // Remove calendar caches for all months
    for (const cacheName in localStorage) {
      if (cacheName.startsWith("calendar")) {
        localStorage.removeItem(cacheName)
      }
    }
    const fetchArgs = {
      setData: setCalendarData,
      setLoaded: setLoadedCalendar,
      updateCache: forceUpdate,
      onSuccessCallback: (data) =>
        data && !data.errorDescription ? data : null,
    };
    const _month = parseInt(month) + 1;
    const fetchURL = `/calendar/${year}/${_month}/`;
    const cacheName = `calendar_${year}_${_month}`;
    fetchCachedData(cacheName, fetchURL, fetchArgs);
  }

  function _fetchLinks(forceUpdate = false) {
    const fetchArgs = {
      setData: setLinksData,
      setLoaded: setLoadedLinks,
      updateCache: forceUpdate,
      onSuccessCallback: (data) =>
        data && !data.errorDescription ? data : null,
    };
    fetchCachedData("shortLinks", "links", fetchArgs);
  }

  // Populate the API data
  useEffect(() => {
    const updateCache = !!removeSearchParam(
      searchParams,
      setSearchParams,
      "refresh"
    );

    for (const fetchFunc of [
      _fetchNews,
      _fetchEvents,
      _fetchCalendar,
      _fetchLinks,
    ]) {
      fetchFunc(updateCache);
    }
  }, []);

  useEffect(() => {
    // Update calendar when month changed
    _fetchCalendar();
  }, [month, year]);

  useEffect(() => {
    if (userPerms.isAdmin || userPerms.canEdit?.length > 0) {
      // Wait until the user is determined; don't kick out just yet in case the user is logged in
      setPage("edit");
    } else {
      // User has been determined to be `null`, or they have no edit permissions
      navigate("/");
      setPage("home");
      if (user === null) {
        // User is not logged in; show popup
        loginAction();
      }
    }
  }, [userPerms, user, navigate]);

  // Display loading screen if the user hasn't been loaded yet
  if (user === undefined) {
    console.log(
      "Waiting for the user to be determined before displaying edit screen."
    );
    return <LoadingScreen />;
  }

  const userCanEdit = userPerms.canEdit ?? [];
  const editPickerOptions = userPerms.isAdmin
    ? Object.values(PAGES) // Give permission to edit all pages
    : userCanEdit.map((perm) => PAGES[perm]); // Give permission for individual pages

  // Failsafe to prevent the user seeing the edit UI in case of a bug
  if (editPickerOptions.length === 0) {
    return (
      <p style={{ paddingBottom: "100%" }}>
        Nie masz uprawnień do wyświetlania tej strony.
      </p>
    );
  }
  return (
    <div className="w-11/12 xl:w-10/12 min-h-[83vh] mt-16 flex flex-col justify-start align-middle ">
      <MetaTags>
        <title>
          Edycja treści | Samorząd Uczniowski 1 Liceum Ogólnokształcącego w
          Gliwicach
        </title>
        <meta
          name="description"
          content="Edycja zawartości strony Samorządu Uczniowskiego 1 Liceum Ogólnokształącego w Gliwicach."
        />
        <meta property="og:title" content="Edycja | SUILO Gliwice" />
        <meta property="og:image" content="" /> {/* TODO: Add image */}
      </MetaTags>
      <div className="mx-auto w-2/3">
        <div className=" m-auto w-1/2">
          <InputDropdown
            label="Element strony do edycji"
            currentValue={editPicker}
            onChangeCallback={(val) => setEditPicker(parseInt(val))}
            valueDisplayObject={editPickerOptions}
          />
        </div>
        <div className="w-full m-auto">
          {editPicker === 0 ? (
            <PostEdit
              data={newsData}
              loaded={loadedNews}
              refetchData={() => _fetchNews(true)}
            />
          ) : editPicker === 1 ? (
            <EventEdit
              data={eventsData}
              loaded={loadedEvents}
              refetchData={() => _fetchEvents(true)}
            />
          ) : editPicker === 2 ? (
            <CalendarEdit
              data={calendarData}
              loaded={loadedCalendar}
              year={year}
              month={month}
              setYear={setYear}
              setMonth={setMonth}
              refetchData={() => _fetchCalendar(true)}
            />
          ) : editPicker === 3 ? (
            <LinkEdit
              data={linksData}
              loaded={loadedLinks}
              refetchData={() => _fetchLinks(true)}
            />
          ) : editPicker === 4 ? (
            <PermissionEdit />
          ) : (
            "Invalid edit picker option!"
          )}
        </div>
      </div>
    </div>
  );
}

/** An unclickable button to be rendered when an API request has been sent and is awaiting a response. */
export function LoadingButton({
  isOpaque = false,
  height = 25,
  width = 90,
  className,
}) {
  let _className = className ?? "delete-btn";
  let colour = "#FFA900";
  if (isOpaque) {
    className ?? (_className = "add-btn");
    colour = "#FFFFFF";
  }
  return (
    <button
      type="button"
      className={_className}
      style={{ cursor: "not-allowed" }}
    >
      <div style={{ backgroundColor: "transparent" }}>
        <Bars color={colour} height={height} width={width} />
      </div>
    </button>
  );
}

/** Renders a loading screen when the data hasn't loaded yet. */
export function LoadingScreen() {
  return (
    <div style={{ backgroundColor: "transparent", marginBottom: "100%" }}>
      <Bars color="#FFA900" height={50} width={50} />
    </div>
  );
}
