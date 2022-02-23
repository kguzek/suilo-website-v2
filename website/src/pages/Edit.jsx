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
import {
  fetchCachedData,
  formatDate,
  formatTime,
  removeSearchParam,
} from "../misc";
import { serialiseDateArray } from "../common";
import { auth, fetchWithToken } from "../firebase";

const editPickerOptions = ["Aktualności", "Wydarzenia", "Kalendarz"];

function PostEdit({ data, loaded, refetchData }) {
  const [currentlyActive, setCurrentlyActive] = useState("_default");
  const [author, setAuthor] = useState(auth.currentUser.displayName);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [imageAuthor, setImageAuthor] = useState("");
  const [imageAltText, setImageAltText] = useState("");

  useEffect(() => {
    if (!loaded) {
      return;
    }
    // Get the currently selected post
    const post = (data || [])
      .filter((post) => post.id === currentlyActive)
      .shift();
    if (!post) {
      // No currently selected post
      for (const setVar of [
        setTitle,
        setDescription,
        setImageURL,
        setImageAuthor,
        setImageAltText,
      ]) {
        setVar("");
      }
      setAuthor(auth.currentUser.displayName);
      return;
    }
    setAuthor(post.author);
    setTitle(post.title);
    setDescription(post.content);
    // photo properties are all nullable
    setImageURL(post.photo || "");
    setImageAuthor(post.photoAuthor || "");
    setImageAltText(post.photoAlt || "");
  }, [currentlyActive]);

  // Display loading screen if news data hasn't been retrieved yet
  if (!loaded) {
    return (
      <div style={{ backgroundColor: "transparent" }}>
        <Bars color="#FFA900" height={50} width={50} />
      </div>
    );
  }

  const posts = {};
  for (const post of data || []) {
    posts[post.id] = post.title;
  }

  function _handleSubmit(e) {
    e.preventDefault();
    let url = "/news/";
    let method = "POST";
    // Check if an existing post is selected
    if (currentlyActive !== "_default") {
      method = "PUT";
      url += currentlyActive;
    }
    const shortDescription = description.substring(0, 180);
    // ?date=null&author=autor&title=Tytuł Postu&text=Krótka treść postu...&content=Wydłużona treść postu.&photo=null&photoAuthor=null&alt=null
    const params = {
      date: new Date().toJSON(),
      author,
      title,
      text: shortDescription,
      content: description,
      photo: imageURL,
      photoAuthor: imageAuthor,
      alt: imageAltText,
    };
    fetchWithToken(url, method, params);
    refetchData();
  }

  function _handleDelete() {
    // TODO: Are you sure you want to delete? etc. popup modal
    fetchWithToken(`/news/${currentlyActive}`, "DELETE");
    refetchData();
  }

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
      <InputArea
        name="post-description"
        placeholder="Opis"
        maxLength={256}
        value={description}
        onChange={setDescription}
      />
      <InputBox
        name="post-author"
        placeholder="Autor"
        maxLength={60}
        value={author}
        disabled={true}
      />
      <InputFile
        placeholder={"Miniatura"}
        onChange={() => {} /* TODO: integrate backend image hosting */}
        acceptedExtensions=".jpeg, .jpg, .png"
      />
      <InputBox
        name="image-url"
        placeholder="URL zdjęcia"
        maxLength={60}
        value={imageURL}
        onChange={setImageURL}
      />
      <InputBox
        name="image-author"
        placeholder="Autor zdjęcia"
        maxLength={60}
        value={imageAuthor}
        onChange={setImageAuthor}
      />
      <InputBox
        name="image-alt-text"
        placeholder="Tekst alternatywny do zdjęcia"
        maxLength={60}
        value={imageAltText}
        onChange={setImageAltText}
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
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (!loaded) {
      return;
    }
    // Get the currently selected event
    const event = (data?.contents || [])
      .filter((event) => event.id === currentlyActive)
      .shift();
    if (!event) {
      // No currently selected event
      for (const setVar of [
        setName,
        setDescription,
        setDate,
        setStartTime,
        setEndTime,
        setLocation,
      ]) {
        setVar("");
      }
      return;
    }
    setName(event.title);
    setDescription(event.content);
    setDate(serialiseDateArray(event.date));
    setStartTime(formatTime(event.startTime));
    setEndTime(formatTime(event.endTime));
    setLocation(event.location || ""); // location is nullable
  }, [currentlyActive]);

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
    let url = "/events/";
    let method = "POST";
    // Check if an existing post is selected
    if (currentlyActive !== "_default") {
      method = "PUT";
      url += currentlyActive;
    }
    // ?title=Tytuł wydarzenia&date=1970-01-01&startTime=00:00&endTime=23:59location=null&content=Treść wydarzenia...
    const params = {
      title: name,
      date,
      startTime,
      endTime,
      location,
      content: description,
    };
    fetchWithToken(url, method, params);
    refetchData();
  }

  function _handleDelete() {
    // TODO: Are you sure you want to delete? etc. popup modal
    fetchWithToken(`/events/${currentlyActive}`, "DELETE");
    refetchData();
  }

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
          value={startTime}
          onChange={setStartTime}
        />
        <p className="from-to-indicator">-</p>
        <InputBox
          width="47%"
          name="event-time-end"
          type="time"
          pattern="HH:mm"
          placeholder="Godzina zakończenia"
          value={endTime}
          onChange={setEndTime}
        />
      </div>
      <InputBox
        name="location"
        placeholder="Miejsce wydarzenia"
        maxLength={30}
        value={location}
        onChange={setLocation}
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
  const [type, setType] = useState("");
  const [subtype, setSubType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [colourTop, setColourTop] = useState("");
  const [colourBottom, setColourBottom] = useState("");

  useEffect(() => {
    if (!loaded) {
      return;
    }
    // Get the currently selected event
    const event = (data?.contents || [])
      .filter((event) => event.id === currentlyActive)
      .shift();
    if (!event) {
      // No currently selected event
      for (const setVar of [
        setName,
        setType,
        setSubType,
        setStartDate,
        setEndDate,
        setColourTop,
        setColourBottom,
      ]) {
        setVar("");
      }
      return;
    }
    setName(event.title);
    setType(event.isPrimary ? "PRIMARY" : "SECONDARY");
    setSubType(event.type);
    setStartDate(formatTime(event.startDate));
    setEndDate(formatTime(event.endDate));
    setColourTop(event.colourTop);
    setColourBottom(event.colourBottom);
  }, [currentlyActive]);

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

  let eventSubtypes = data?.eventSubtypes || [];
  function _handleSubmit(e) {
    e.preventDefault();
    let url = "/calendar/";
    let method = "POST";
    // Check if an existing event is selected
    if (currentlyActive !== "_default") {
      method = "PUT";
      url += currentlyActive;
    }
    // ?title=Nazwa wydarzenia kalendarzowego.&type=0&startDate=1&endDate=1&isPrimary=true&colourTop=#000000&colourBottom=#000000
    const params = {
      title: name,
      type: subtype,
      startDate,
      endDate,
      isPrimary: type === "PRIMARY",
      colourTop,
      colourBottom,
    };
    fetchWithToken(url, method, params);
    refetchData();
  }

  function _handleDelete() {
    // TODO: Are you sure you want to delete? etc. popup modal
    fetchWithToken(`/calendar/${currentlyActive}`, "DELETE");
    refetchData();
  }

  return (
    <form className="edit-segment" onSubmit={_handleSubmit}>
      <InputDropdown
        label="Typ wydarzenia"
        currentValue={subtype}
        onChangeCallback={setSubType}
        defaultLabel="inne"
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
          value={startDate}
          onChange={setStartDate}
        />
        <p className="from-to-indicator">-</p>
        <InputBox
          width="47%"
          name="event-time-end"
          type="date"
          pattern="dd/mm/yyyy"
          placeholder="Zakończenie"
          value={endDate}
          onChange={setEndDate}
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
  const [newsData, setNewsData] = useState([]);
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
