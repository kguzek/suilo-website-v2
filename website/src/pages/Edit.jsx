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
  getFileNameFromFirebaseUrl,
  removeSearchParam,
} from "../misc";
import { serialiseDateArray } from "../common";
import { auth, fetchWithToken, storage } from "../firebase";
import {
  getDownloadURL,
  uploadBytesResumable,
  ref,
  updateMetadata,
} from "firebase/storage";

const PAGES = {
  news: "Aktualności",
  events: "Wydarzenia",
  calendar: "Kalendarz",
};

function PostEdit({ data, loaded, refetchData }) {
  const [currentlyActive, setCurrentlyActive] = useState("_default");
  const [author, setAuthor] = useState(auth.currentUser?.displayName);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [imageAuthor, setImageAuthor] = useState("");
  const [imageAltText, setImageAltText] = useState("");
  const [imgRef, setImgRef] = useState();
  const [clickedSubmit, setClickedSubmit] = useState(false);
  const [clickedDelete, setClickedDelete] = useState(false);

  useEffect(() => {
    if (!loaded) {
      return;
    }
    // Get the currently selected post
    const post = (data ?? [])
      .filter((post) => post.id === currentlyActive)
      .shift();
    if (!post) {
      // No currently selected post
      return void _resetAllInputs();
    }
    setAuthor(post.author);
    setTitle(post.title);
    setDescription(post.content);
    // photo properties are all nullable
    setImageURL(post.photo ?? "");
    setImageAuthor(post.photoAuthor ?? "");
    setImageAltText(post.alt ?? "");
  }, [currentlyActive]);

  // Display loading screen if news data hasn't been retrieved yet
  if (!loaded) {
    return <LoadingScreen />;
  }

  const posts = {};
  for (const post of data ?? []) {
    posts[post.id] = post.title;
  }

  // Bitwise AND to ensure both functions are called
  const refresh = () => refetchData() & _resetAllInputs();

  function _resetAllInputs() {
    for (const setVar of [
      setTitle,
      setDescription,
      setImageURL,
      setImageAuthor,
      setImageAltText,
    ]) {
      setVar("");
    }
    setCurrentlyActive("_default");

    setAuthor(auth.currentUser?.displayName);
  }

  function _handleSubmit(e) {
    e.preventDefault();
    setClickedSubmit(true);
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
      date: new Date().toISOString(),
      author,
      title,
      text: shortDescription,
      content: description,
      photo: imagePath,
      //those two should be stored with the photo imo
      photoAuthor: imageAuthor,
      alt: imageAltText,
    };
    /*
    if(imgRef){
      const metadata = {
        customMetadata:{
          photoAuthor: imageAuthor,
          alt: imageAltText,
        }
      }
      updateMetadata(imgRef, metadata)
      .then((meta) => {
        console.log(meta);
      }).catch((error) => {
        console.log(error);
      })
    }
   */
    fetchWithToken(url, method, params).then((res) => {
      // Update the data once request is processed
      refresh();
      setClickedSubmit(false);
    });
  }

  function _handleDelete() {
    setClickedDelete(true);
    // TODO: Are you sure you want to delete? etc. popup modal
    fetchWithToken(`/news/${currentlyActive}`, "DELETE").then((res) => {
      // Update the data once request is processed
      refresh();
      setClickedDelete(false);
    });
  }
  function _handlePhotoUpdate(file) {
    if (!file) return;
    const storageRef = ref(storage, `/photos/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    setImagePath(file.name.split(".")[0]);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = Math.round(
          (100 * snapshot.bytesTransferred) / snapshot.totalBytes
        );
        setImageURL(`Postęp: ${prog}%`);
      },
      (error) => console.log(error),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(() => {
          /*
        console.log(url);
        let basefileName = getFileNameFromFirebaseUrl(url);
        console.log(basefileName);
      
        let fullHDfileName = basefileName.split(".")[0] + "_1920x1080.jpeg";
        console.log(fullHDfileName);
        setImagePath(fullHDfileName);
        */
        });
      }
    );
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
        onChange={
          (e) => {
            _handlePhotoUpdate(e.target.files[0]);
          } /* TODO: integrate backend image hosting */
        }
        acceptedExtensions=".jpeg, .jpg, .png"
      />
      <InputBox
        name="image-url"
        placeholder="URL zdjęcia"
        maxLength={256}
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
        {currentlyActive !== "_default" &&
          (clickedDelete ? (
            <LoadingButton />
          ) : (
            <button
              type="button"
              className="delete-btn"
              onClick={() => _handleDelete()}
            >
              <Trash color="rgb(252, 63, 30)" size={20} />
              <p>usuń post</p>
            </button>
          ))}
        {clickedSubmit ? (
          <LoadingButton style="opaque" />
        ) : (
          <button type="submit" className="add-btn">
            {currentlyActive !== "_default" ? (
              <Edit3 color="#FFFFFF" size={24} />
            ) : (
              <Plus color="#FFFFFF" size={24} />
            )}
            <p>
              {currentlyActive !== "_default" ? "edytuj post" : "dodaj post"}
            </p>
          </button>
        )}
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
  const [imageURL, setImageURL] = useState("");
  const [imagePath, setImagePath] = useState();
  const [imgRef, setImgRef] = useState();
  const [imageAuthor, setImageAuthor] = useState("");
  const [imageAltText, setImageAltText] = useState("");
  const [clickedSubmit, setClickedSubmit] = useState(false);
  const [clickedDelete, setClickedDelete] = useState(false);

  useEffect(() => {
    if (!loaded) {
      return;
    }
    // Get the currently selected event
    const event = (data?.contents ?? [])
      .filter((event) => event.id === currentlyActive)
      .shift();
    if (!event) {
      // No currently selected event
      return void _resetAllInputs();
    }
    setName(event.title);
    setDescription(event.content);
    setDate(serialiseDateArray(event.date));
    setStartTime(formatTime(event.startTime));
    setEndTime(formatTime(event.endTime));
    setLocation(event.location ?? ""); // location is nullable
  }, [currentlyActive]);

  // Display loading screen if events data hasn't been retrieved yet
  if (!loaded) {
    return <LoadingScreen />;
  }

  const events = {};
  for (const event of data?.contents ?? []) {
    const date = formatDate(event.date);
    events[event.id] = `${event.title} (${date})`;
  }

  // Bitwise AND to ensure both functions are called
  const refresh = () => refetchData() & _resetAllInputs();

  function _resetAllInputs() {
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
    setCurrentlyActive("_default");
  }

  function _handleSubmit(e) {
    e.preventDefault();
    setClickedSubmit(true);
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
    /*
    if(imgRef){
      const metadata = {
        customMetadata:{
          photoAuthor: imageAuthor,
          alt: imageAltText,
        }
      }
      updateMetadata(imgRef, metadata)
      .then((meta) => {
        console.log(meta);
      }).catch((error) => {
        console.log(error);
      })
    }
   */
    fetchWithToken(url, method, params).then((res) => {
      // Update the data once request is processed
      refresh();
      setClickedSubmit(false);
    });
  }

  function _handleDelete() {
    setClickedDelete(true);
    // TODO: Are you sure you want to delete? etc. popup modal
    fetchWithToken(`/events/${currentlyActive}`, "DELETE").then((res) => {
      // Update the data once request is processed
      refresh();
      setClickedDelete(false);
    });
  }

  function _handlePhotoUpdate(file) {
    if (!file) return;
    const storageRef = ref(storage, `/photos/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    setImagePath(file.name.split(".")[0]);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = Math.round(
          (100 * snapshot.bytesTransferred) / snapshot.totalBytes
        );
        setImageURL(`Postęp: ${prog}%`);
      },
      (error) => console.log(error),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(() => {
          /*
        console.log(url);
        let basefileName = getFileNameFromFirebaseUrl(url);
        console.log(basefileName);
      
        let fullHDfileName = basefileName.split(".")[0] + "_1920x1080.jpeg";
        console.log(fullHDfileName);
        setImagePath(fullHDfileName);
        */
        });
      }
    );
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
        placeholder="Tytuł"
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
        maxLength={60}
        value={location}
        onChange={setLocation}
      />
      {/* PLACE FOR TEXT EDITOR */}
      <InputFile
        placeholder={"Miniatura"}
        onChange={(e) => {
          _handlePhotoUpdate(e.target.files[0]);
        }}
        acceptedExtensions=".jpeg, .jpg, .png"
      />
      <InputBox
        name="image-url"
        placeholder="URL zdjęcia"
        maxLength={256}
        value={imageURL}
        onChange={setImageURL}
      />
      <div className="fr" style={{ width: "100%", justifyContent: "right" }}>
        {currentlyActive !== "_default" &&
          (clickedDelete ? (
            <LoadingButton />
          ) : (
            <button
              type="button"
              className="delete-btn"
              onClick={() => _handleDelete()}
            >
              <Trash color="rgb(252, 63, 30)" size={20} />
              <p>usuń post</p>
            </button>
          ))}
        {clickedSubmit ? (
          <LoadingButton style="opaque" />
        ) : (
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
        )}
      </div>
    </form>
  );
}

function CalendarEdit({ data, loaded, refetchData, setYear, setMonth }) {
  const [currentlyActive, setCurrentlyActive] = useState("_default");
  const [name, setName] = useState("");
  const [eventType, setEventType] = useState("");
  const [subtype, setSubtype] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [colour, setColour] = useState("");

  const [clickedSubmit, setClickedSubmit] = useState(false);
  const [clickedDelete, setClickedDelete] = useState(false);

  useEffect(() => {
    if (!loaded) {
      return;
    }
    // Get the currently selected event
    const event = (data?.events ?? [])
      .filter((event) => event.id === currentlyActive)
      .shift();
    if (!event) {
      // No currently selected event
      return void _resetAllInputs();
    }
    setName(event.title);
    setSubtype(event.type);
    // setStartDate(serialiseDateArray(event.startDate));
    // setEndDate(serialiseDateArray(event.endDate));
    setStartDate(event.date.start);
    setEndDate(event.date.end);
    setColour(event.colour);
    setEventType(event.renderType);
  }, [currentlyActive]);

  // Display loading screen if calendar data hasn't been retrieved yet
  if (!loaded) {
    return <LoadingScreen />;
  }

  const eventSubtypes = data?.eventSubtypes ?? [];
  const calendarEvents = {};
  for (const event of data?.events ?? []) {
    calendarEvents[event.id] = event.title;
  }

  // Bitwise AND to ensure both functions are called
  const refresh = () => refetchData() & _resetAllInputs();

  function _resetAllInputs() {
    for (const setVar of [
      setName,
      setEventType,
      setSubtype,
      setStartDate,
      setEndDate,
      setColour,
    ]) {
      setVar("");
    }
    setCurrentlyActive("_default");
  }

  function _handleSubmit(e) {
    e.preventDefault();
    setClickedSubmit(true);
    let url = "/calendar/";
    let method = "POST";
    // Check if an existing event is selected
    if (currentlyActive !== "_default") {
      method = "PUT";
      url += currentlyActive;
    }
    // ?title=Nazwa wydarzenia kalendarzowego.&type=0&startDate=1&endDate=1&isPrimary=true&colour=#000000
    const params = {
      title: name,
      type: subtype,
      startDate,
      endDate,
      isPrimary: eventType.toUpperCase().trim() === "PRIMARY",
      colour,
    };
    fetchWithToken(url, method, params).then((res) => {
      // Update the data once request is sent
      refresh();
      setClickedSubmit(false);
    });
  }

  function _handleDelete() {
    setClickedDelete(true);
    // TODO: Are you sure you want to delete? etc. popup modal
    fetchWithToken(`/calendar/${currentlyActive}`, "DELETE").then((res) => {
      // Update the data once request is sent
      refresh();
      setClickedDelete(false);
    });
  }

  return (
    <form className="edit-segment" onSubmit={_handleSubmit}>
      <InputDropdown
        label="Wydarzenie do edycji"
        currentValue={currentlyActive}
        onChangeCallback={setCurrentlyActive}
        defaultLabel="Nowe wydarzenie"
        valueDisplayObject={calendarEvents}
      />
      {/* TODO: Change this InputBox to an input checkbox/radiobox/dropdown */}
      <InputBox
        maxLength={9}
        name="event-type"
        placeholder="Typ wydarzenia (PRIMARY | SECONDARY)"
        value={eventType}
        onChange={setEventType}
      />
      <InputDropdown
        label="Subtyp wydarzenia"
        currentValue={subtype}
        onChangeCallback={setSubtype}
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

      <div className="fr" style={{ width: "100%", justifyContent: "right" }}>
        {currentlyActive !== "_default" &&
          (clickedDelete ? (
            <LoadingButton />
          ) : (
            <button
              type="button"
              className="delete-btn"
              onClick={() => _handleDelete()}
            >
              <Trash color="rgb(252, 63, 30)" size={20} />
              <p>usuń post</p>
            </button>
          ))}
        {clickedSubmit ? (
          <LoadingButton style="opaque" />
        ) : (
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
        )}
      </div>
    </form>
  );
}

export default function Edit({ setPage, user, userPerms = {}, loginAction }) {
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

/** An unclickable button to be rendered when an API request has been sent and is awaiting a response. */
function LoadingButton({ style = "transparent" }) {
  let className = "delete-btn";
  let colour = "#FFA900";
  if (style === "opaque") {
    className = "add-btn";
    colour = "#FFFFFF";
  }
  return (
    <button
      type="button"
      className={className}
      style={{ cursor: "not-allowed" }}
    >
      <div style={{ backgroundColor: "transparent" }}>
        <Bars color={colour} height={25} width={90} />
      </div>
    </button>
  );
}

/** Renders a loading screen when the data hasn't loaded yet. */
function LoadingScreen() {
  return (
    <div style={{ backgroundColor: "transparent", marginBottom: "100%" }}>
      <Bars color="#FFA900" height={50} width={50} />
    </div>
  );
}
