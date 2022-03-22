import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MetaTags from "react-meta-tags";
import InputDropdown from "../components/Editor/InputComponents/InputDropdown";
import { fetchNewsData } from "../components/News/PostCardPreview";
import { fetchCachedData, removeSearchParam } from "../misc";
import { PostEdit } from "../components/Editor/PostEdit";
import { EventEdit } from "../components/Editor/EventEdit";
import { CalendarEdit } from "../components/Editor/CalendarEdit";
import { LinkEdit } from "../components/Editor/LinkEdit";
import { PermissionEdit } from "../components/Editor/PermissionEdit";
import LoadingScreen from "../components/LoadingScreen";
import { DEBUG_MODE } from "../firebase";

const PAGES = {
  news: "Aktualności",
  events: "Wydarzenia",
  calendar: "Kalendarz",
  links: "Skracanie linków",
  users: "Użytkownicy",
};

const PAGE_NAMES = Object.values(PAGES);

export default function Edit({
  setPage,
  user,
  userPerms = {},
  loginAction,
  reload,
  setReload,
}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // `editPicker` is an index of `editPickerOptions`
  const [editPicker, setEditPicker] = useState(0);

  // API data storage
  const [newsData, setNewsData] = useState([]);
  const [linksData, setLinksData] = useState({});
  const [usersData, setUsersData] = useState({});
  const [eventsData, setEventsData] = useState({});
  const [calendarData, setCalendarData] = useState({});
  const [storageContents, setStorageContents] = useState({});
  const [loadedNews, setLoadedNews] = useState(false);
  const [loadedLinks, setLoadedLinks] = useState(false);
  const [loadedUsers, setLoadedUsers] = useState(false);
  const [loadedEvents, setLoadedEvents] = useState(false);
  const [loadedCalendar, setLoadedCalendar] = useState(false);
  const [loadedStorageContents, setLoadedPhotos] = useState(false);

  // Calendar fetch options
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());

  /** Fetch the news post data from the cache or API. */
  function fetchNews(forceUpdate = false) {
    setLoadedNews(false);
    fetchNewsData({
      setNewsData,
      setLoaded: setLoadedNews,
      updateCache: forceUpdate,
      allItems: true,
    });
  }

  /** Fetch the short links data from the cache or API. */
  function fetchLinks(forceUpdate = false) {
    const fetchArgs = {
      setData: setLinksData,
      setLoaded: setLoadedLinks,
      updateCache: forceUpdate,
    };
    fetchCachedData("links_all", "links", fetchArgs);
  }

  /** Fetch the users data from the cache or API. */
  function fetchUsers(forceUpdate = false) {
    setLoadedUsers(false);
    const fetchArgs = {
      setData: setUsersData,
      setLoaded: setLoadedUsers,
      updateCache: forceUpdate,
    };
    fetchCachedData("users", "/users", fetchArgs);
  }

  /** Fetch the events data from the cache or API. */
  function fetchEvents(forceUpdate = false) {
    setLoadedEvents(false);
    const fetchArgs = {
      setData: setEventsData,
      setLoaded: setLoadedEvents,
      updateCache: forceUpdate,
    };
    fetchCachedData("events", "/events", fetchArgs);
  }

  /** Fetch the calendar data from the cache or API. */
  function fetchCalendar(forceUpdate = false) {
    setLoadedCalendar(false);
    if (forceUpdate) {
      // Remove calendar caches for all months
      for (const cacheName in localStorage) {
        if (cacheName.startsWith("calendar")) {
          localStorage.removeItem(cacheName);
        }
      }
    }
    const fetchArgs = {
      setData: setCalendarData,
      setLoaded: setLoadedCalendar,
      updateCache: forceUpdate,
    };
    const _month = parseInt(month) + 1;
    const fetchURL = `/calendar/${year}/${_month}/`;
    const cacheName = `calendar_${year}_${_month}`;
    fetchCachedData(cacheName, fetchURL, fetchArgs);
  }

  /** Fetch the storage contents data from the cache or API. */
  function fetchStorageContents(forceUpdate = false) {
    setLoadedPhotos(false);
    const fetchArgs = {
      setData: setStorageContents,
      setLoaded: setLoadedPhotos,
      updateCache: forceUpdate,
    };
    fetchCachedData("storage", "/storage", fetchArgs);
  }

  /** Populate the data from the cache or API. */
  function fetchData() {
    const updateCache = !!removeSearchParam(
      searchParams,
      setSearchParams,
      "refresh"
    );

    for (const fetchFunc of [
      fetchNews,
      fetchLinks,
      fetchUsers,
      fetchEvents,
      fetchStorageContents,
    ]) {
      fetchFunc(updateCache);
    }
  }

  // Initial page load
  useEffect(fetchData, []);

  useEffect(() => {
    if (!reload) {
      return;
    }
    // The page content has updated on the server side; reload it
    setReload(false);
    fetchData();
    fetchCalendar();
  }, [reload]);

  useEffect(() => {
    // Update calendar when month changed
    fetchCalendar();
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
    DEBUG_MODE && console.debug(
      "Waiting for the user to be determined before displaying edit screen."
    );
    return <LoadingScreen />;
  }

  const userCanEdit = (userPerms.canEdit ?? []).map((page) => PAGES[page]);
  const editPickerOptions = userPerms.isAdmin
    ? PAGE_NAMES // Give permission to edit all pages
    : PAGE_NAMES.filter((page) => userCanEdit.includes(page)); // Give permission for individual pages

  // Failsafe to prevent the user seeing the edit UI in case of a bug - ez?
  if (editPickerOptions.length === 0) {
    return (
      <p style={{ paddingBottom: "100%" }}>
        Nie masz uprawnień do wyświetlania tej strony.
      </p>
    );
  }

  const selectedPage = editPickerOptions[editPicker];
  return (
    <div className="w-11/12 xl:w-10/12 min-h-[80vh] mt-16 flex flex-col justify-start align-middle mb-6 ">
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
      <div className="mx-auto w-11/12 sm:w-10/12 md:w-8/12 lg:w-3/4 xl:w-2/3">
        <div className=" m-auto w-1/2">
          <InputDropdown
            label="Element strony do edycji"
            currentValue={editPicker}
            onChangeCallback={(val) => setEditPicker(parseInt(val))}
            valueDisplayObject={editPickerOptions}
          />
        </div>
        <div className="w-full m-auto">
          {selectedPage === PAGE_NAMES[0] ? (
            <PostEdit
              data={newsData}
              loaded={loadedNews && loadedStorageContents}
              refetchData={() => fetchNews(true)}
              refetchStorage={() => fetchStorageContents(true)}
              photos={storageContents.photos}
            />
          ) : selectedPage === PAGE_NAMES[1] ? (
            <EventEdit
              data={eventsData}
              loaded={loadedEvents && loadedStorageContents}
              refetchData={() => fetchEvents(true) & fetchStorageContents(true)}
              refetchStorage={() => fetchStorageContents(true)}
              photos={storageContents.photos}
            />
          ) : selectedPage === PAGE_NAMES[2] ? (
            <CalendarEdit
              data={calendarData}
              loaded={loadedCalendar}
              year={year}
              month={month}
              setYear={setYear}
              setMonth={setMonth}
              refetchData={() => fetchCalendar(true)}
            />
          ) : selectedPage === PAGE_NAMES[3] ? (
            <LinkEdit
              data={linksData}
              loaded={loadedLinks}
              refetchData={() => fetchLinks(true)}
            />
          ) : (
            selectedPage === PAGE_NAMES[4] && (
              <PermissionEdit
                data={usersData}
                loaded={loadedUsers}
                refetchData={() => fetchUsers(true)}
                userPerms={userPerms}
                allPerms={Object.keys(PAGES)}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
