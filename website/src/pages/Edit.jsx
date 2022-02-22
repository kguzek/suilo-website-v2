import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MetaTags from "react-meta-tags";
import { Plus, Trash, Edit3 } from "react-feather";
import { Bars } from "react-loader-spinner";
import InputBox from "../components/InputBox";
import InputArea from "../components/InputArea";
import InputDropdown from "../components/InputDropdown";
import InputFile from "../components/InputFile";
import { fetchNewsData } from "../components/PostCardPreview";
import { fetchCachedData, formatDate, removeSearchParam } from "../misc";

const editPickerOptions = ["Aktualności", "Wydarzenia", "Kalendarz"];

function PostEdit({ data, loaded, refetchData }) {
  const [currentlyActive, setCurrentlyActive] = useState("_default");
  const [title, setTitle] = useState("");

  // Display loading screen if news data hasn't been retrieved yet
  if (!loaded) {
    return (
      <div style={{ backgroundColor: "transparent" }}>
        <Bars color="#FFA900" height={50} width={50} />
      </div>
    );
  }

  const posts = {};
  for (const post of data) {
    posts[post.id] = post.title;
  }

  function _handleSubmit(e) {
    e.preventDefault();
    refetchData();
  }

  function _handleDelete() {}

  return (
    <form className="edit-segment" onSubmit={_handleSubmit}>
      <InputDropdown
        label="Post do edycji"
        currentValue={currentlyActive}
        onChangeCallback={setCurrentlyActive}
        defaultLabel="Nowy post"
        valueDisplayObject={posts}
      />
      <InputBox
        name="post-title"
        placeholder="Tytuł"
        maxLength={60}
        value={title}
        onChange={setTitle}
      />
      {/* PLACE FOR TEXT EDITOR */}
      <InputFile
        placeholder="Miniatura"
        acceptedExtensions=".jpeg, .jpg, .png,"
      />
      <div className="fr" style={{ width: "100%", justifyContent: "right" }}>
        {currentlyActive !== "_default" && (
          <button
            type="button"
            className="delete-btn"
            onClick={() => _handleDelete()}
          >
            <Trash color="rgb(252, 63, 30)" size={20} />
            <p>usuń post</p>
          </button>
        )}
        <button type="submit" className="add-btn">
          {currentlyActive !== "_default" ? (
            <Edit3 color="#FFFFFF" size={24} />
          ) : (
            <Plus color="#FFFFFF" size={24} />
          )}
          <p>{currentlyActive !== "_default" ? "edytuj post" : "dodaj post"}</p>
        </button>
      </div>
    </form>
  );
}

function EventEdit({ data, loaded, refetchData }) {
  const [currentlyActive, setCurrentlyActive] = useState("_default");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [place, setPlace] = useState("");

  // Display loading screen if events data hasn't been retrieved yet
  if (!loaded) {
    return (
      <div style={{ backgroundColor: "transparent" }}>
        <Bars color="#FFA900" height={50} width={50} />
      </div>
    );
  }

  const events = {};
  for (const event of data?.contents || []) {
    const date = formatDate(event.date);
    events[event.id] = `${event.title} (${date})`;
  }

  function _handleSubmit(e) {
    e.preventDefault();
    refetchData();
  }

  function _handleDelete() {}

  return (
    <form className="edit-segment" onSubmit={_handleSubmit}>
      <InputDropdown
        label="Wydarzenie do edycji"
        currentValue={currentlyActive}
        onChangeCallback={setCurrentlyActive}
        defaultLabel="Nowe wydarzenie"
        valueDisplayObject={events}
      />
      <InputBox
        name="event-name"
        placeholder="Nazwa"
        maxLength={60}
        value={name}
        onChange={setName}
      />
      <InputArea
        name="event-description"
        placeholder="Opis"
        maxLength={256}
        value={description}
        onChange={setDescription}
      />
      <InputBox
        name="event-date"
        type="date"
        pattern="dd/mm/yyyy"
        placeholder="Data wydarzenia"
        value={date}
        onChange={setDate}
      />
      <div
        className="fr"
        style={{
          width: "100%",
          margin: "-1em 0",
          justifyContent: "space-between",
        }}
      >
        <InputBox
          width="47%"
          name="event-time-start"
          type="time"
          pattern="HH:mm"
          placeholder="Godzina rozpoczęcia"
          value={timeStart}
          onChange={setTimeStart}
        />
        <p className="from-to-indicator">-</p>
        <InputBox
          width="47%"
          name="event-time-end"
          type="time"
          pattern="HH:mm"
          placeholder="Godzina zakończenia"
          value={timeEnd}
          onChange={setTimeEnd}
        />
      </div>
      <InputBox
        name="location"
        placeholder="Miejsce wydarzenia"
        maxLength={30}
        value={place}
        onChange={setPlace}
      />
      {/* PLACE FOR TEXT EDITOR */}
      <InputFile
        placeholder="Miniatura"
        acceptedExtensions=".jpeg, .jpg, .png,"
      />
      <div className="fr" style={{ width: "100%", justifyContent: "right" }}>
        {currentlyActive !== "_default" && (
          <button
            type="button"
            className="delete-btn"
            onClick={() => _handleDelete()}
          >
            <Trash color="rgb(252, 63, 30)" size={20} />
            <p>usuń wydarzenie</p>
          </button>
        )}
        <button type="submit" className="add-btn">
          {currentlyActive !== "_default" ? (
            <Edit3 color="#FFFFFF" size={24} />
          ) : (
            <Plus color="#FFFFFF" size={24} />
          )}
          <p>
            {currentlyActive !== "_default"
              ? "edytuj wydarzenie"
              : "dodaj wydarzenie"}
          </p>
        </button>
      </div>
    </form>
  );
}

function CalendarEdit({ data, loaded, refetchData, setYear, setMonth }) {
  const [currentlyActive, setCurrentlyActive] = useState("_default");
  const [name, setName] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [type, setType] = useState("");

  // Display loading screen if calendar data hasn't been retrieved yet
  if (!loaded) {
    return (
      <div style={{ backgroundColor: "transparent" }}>
        <Bars color="#FFA900" height={50} width={50} />
      </div>
    );
  }

  const calendarEvents = {};
  for (const event of data?.contents || []) {
    calendarEvents[event.id] = event.title;
  }

  let eventSubtypes = data?.eventSubtypes || [
    "Subtype A",
    "Subtype B",
    "Subtype C",
  ];
  function _handleSubmit(e) {
    e.preventDefault();
    refetchData();
  }

  function _handleDelete() {}

  return (
    <form className="edit-segment" onSubmit={_handleSubmit}>
      <InputDropdown
        label="Typ wydarzenia"
        currentValue={type}
        onChangeCallback={setType}
        // defaultLabel="Inne"
        valueDisplayObject={Object.fromEntries(eventSubtypes.entries())}
      />
      <InputBox
        maxLength={60}
        name="event-name"
        placeholder="Nazwa wydarzenia"
        value={name}
        onChange={setName}
      />
      <div
        className="fr"
        style={{
          width: "100%",
          margin: "-1em 0",
          justifyContent: "space-between",
        }}
      >
        <InputBox
          width="47%"
          name="event-time-start"
          type="date"
          pattern="dd/mm/yyyy"
          placeholder="Rozpoczęcie"
          value={dateStart}
          onChange={setDateStart}
        />
        <p className="from-to-indicator">-</p>
        <InputBox
          width="47%"
          name="event-time-end"
          type="date"
          pattern="dd/mm/yyyy"
          placeholder="Zakończenie"
          value={dateEnd}
          onChange={setDateEnd}
        />
      </div>
      <InputDropdown
        label="Wydarzenie do edycji"
        currentValue={currentlyActive}
        onChangeCallback={setCurrentlyActive}
        defaultLabel="Nowe wydarzenie"
        valueDisplayObject={calendarEvents}
      />
      <div className="fr" style={{ width: "100%", justifyContent: "right" }}>
        {currentlyActive !== "_default" && (
          <button
            type="button"
            className="delete-btn"
            onClick={() => _handleDelete()}
          >
            <Trash color="rgb(252, 63, 30)" size={20} />
            <p>usuń wydarzenie</p>
          </button>
        )}
        <button type="submit" className="add-btn">
          {currentlyActive !== "_default" ? (
            <Edit3 color="#FFFFFF" size={24} />
          ) : (
            <Plus color="#FFFFFF" size={24} />
          )}
          <p>
            {currentlyActive !== "_default"
              ? "edytuj wydarzenie"
              : "dodaj wydarzenie"}
          </p>
        </button>
      </div>
    </form>
  );
}

export default function Edit({ setPage, canEdit, loginAction, user }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // `editPicker` is an index of `editPickerOptions`
  const [editPicker, setEditPicker] = useState(0);

  // API data storage
  const [newsData, setNewsData] = useState({});
  const [eventsData, setEventsData] = useState({});
  const [calendarData, setCalendarData] = useState({});
  const [loadedNews, setLoadedNews] = useState(false);
  const [loadedEvents, setLoadedEvents] = useState(false);
  const [loadedCalendar, setLoadedCalendar] = useState(false);

  // Calendar fetch options
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

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
    const fetchArgs = {
      setData: setCalendarData,
      setLoaded: setLoadedCalendar,
      updateCache: forceUpdate,
      onSuccessCallback: (data) =>
        data && !data.errorDescription ? data : null,
    };
    const fetchURL = `/calendar/${year}/${month}/`;
    const cacheName = `calendar_${year}_${month}`;
    fetchCachedData(cacheName, fetchURL, fetchArgs);
  }

  // Populate the API data
  useEffect(() => {
    const updateCache = !!removeSearchParam(
      searchParams,
      setSearchParams,
      "refresh"
    );

    for (const fetchFunc of [_fetchNews, _fetchEvents, _fetchCalendar]) {
      fetchFunc(updateCache);
    }
  }, []);

  useEffect(() => {
    if (canEdit || user === undefined) {
      setPage("edit");
    } else {
      navigate("/");
      setPage("home");
      loginAction();
    }
  }, [canEdit, user]);

  // Display loading screen if the user hasn't been loaded yet
  if (user === undefined) {
    return (
      <div
        className="loading-whole-screen"
        style={{ backgroundColor: "transparent" }}
      >
        <Bars color="#FFA900" height={50} width={50} />
      </div>
    );
  }

  return (
    <div
      style={{ paddingTop: "2.5em", justifyContent: "left" }}
      className="page-main"
    >
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
      <div style={{ width: "50%" }}>
        <InputDropdown
          label="Element strony do edycji"
          currentValue={editPicker}
          onChangeCallback={setEditPicker}
          defaultLabel={""}
          valueDisplayObject={editPickerOptions}
        />
      </div>
      {/* use == instead of === to compare integers with number strings
      (editPicker can be a string representing a number e.g. "1") */}
      {editPicker == 0 && (
        <PostEdit
          data={newsData}
          loaded={loadedNews}
          refetchData={() => _fetchNews(true)}
        />
      )}
      {editPicker == 1 && (
        <EventEdit
          data={eventsData}
          loaded={loadedEvents}
          refetchData={() => _fetchEvents(true)}
        />
      )}
      {editPicker == 2 && (
        <CalendarEdit
          data={calendarData}
          loaded={loadedCalendar}
          setYear={setYear}
          setMonth={setMonth}
          refetchData={() => _fetchCalendar(true)}
        />
      )}
    </div>
  );
}
