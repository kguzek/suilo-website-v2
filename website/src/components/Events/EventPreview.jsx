import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Bell,
  UserCheck,
  ExternalLink,
  User,
} from "react-feather";
import { fetchWithToken, auth, DEBUG_MODE } from "../../firebase";
import {
  DEFAULT_IMAGE,
  formatDate,
  formatTime,
  formatTimeDiff,
  getDataFromFilename,
  setErrorMessage,
} from "../../misc";
import DialogBox from "../DialogBox";

const PARTICIPATE_BTN_CLASS =
  "transition-all inline-flex py-[.5rem]  hover:ring-2 hover:ring-primary/30 active:drop-shadow-5xl cursor-pointer ml-2 drop-shadow-3xl rounded-xl px-[1.1rem]";

// Zmieniłem pt-[.7rem] na pt-[.65rem] żeby się alignowało @Mrózek
const NOTIFY_BTN_CLASS =
  "transition-all cursor-pointer hover:ring-2 hover:ring-primary/30  p-[.5rem] ml-2 drop-shadow-3xl rounded-xl";

// const testEvent = {
//   photo:
//     "https://images.unsplash.com/photo-1637603170052-245ccc8eede1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1172&q=80",
//   title: "Szkolny koncert z okazji dnia kobiet - edycja 2022",
//   content:
//     "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy.",
//   date: [2022, 3, 8],
//   startTime: [9, 0],
//   endTime: [11, 0],
//   location: "Sala 204",
//   participants: [],
//   link: "https://youtu.be/dQw4w9WgXcQ",
// };

const EventPreview = ({
  event,
  isNextEvent = false,
  loginAction,
  updateNextEvent = () => { },
}) => {
  const [notification, setNotification] = useState(false);
  const [participance, setParticipance] = useState(false);
  const [canParChange, setCanParChange] = useState(true);
  const [canNotChange, setCanNotChange] = useState(true);
  const [photo, setPhoto] = useState(DEFAULT_IMAGE);

  const [eventCountdown, setEventCountdown] = useState(undefined);
  // const [needsLogin, setNeedsLogin] = useState(false);

  const [clickedParticipate, setClickedParticipate] = useState(false);
  const [clickedNotify, setClickedNotify] = useState(false);
  const [popupParticipance, setPopupParticipance] = useState(false);
  const [popupNotification, setPopupNotification] = useState(false);
  const [popupError, setPopupError] = useState(false);
  const [errorCode, setErrorCode] = useState(null);

  useEffect(() => {
    getDataFromFilename(event.photo, "1920x1080", setPhoto);
  }, [event]);

  useEffect(() => {
    // Either wait 1s or update immediately
    isNextEvent && eventCountdown
      ? setTimeout(updateEventCountdown, 1000)
      : updateEventCountdown();
  }, [eventCountdown]);

  useEffect(() => {
    if (!popupNotification) {
      setCanNotChange(true);
    }
  }, [popupNotification]);

  useEffect(() => {
    if (!popupParticipance) {
      setCanParChange(true);
    }
  }, [popupParticipance]);

  useEffect(() => {
    if (!auth.currentUser || !event) {
      // Restore defaults
      setParticipance(false);
      setNotification(false);
      return;
    }
    const user = auth.currentUser.providerData?.[0];
    const participants = event.participants ?? [];
    const notificationsFor = event.notificationsFor ?? [];
    setParticipance(participants.includes(user.uid));
    setNotification(user.email in notificationsFor);
  }, [auth.currentUser, event]);

  // Display "<20" if there are fewer than 20 event participants
  const numParticipants =
    (event.participants.length < 20 ? "<20" : event.participants.length) +
    " uczestników";

  function updateEventCountdown() {
    const now = new Date();
    const eventDate = new Date(event.date);
    eventDate.setHours(...event.startTime);
    const diff = eventDate - now;
    if (diff < 1000) {
      // Less than 1 second left
      DEBUG_MODE && console.info("Next event start time reached!");
      return void updateNextEvent();
    }
    const formatted = formatTimeDiff(diff);
    formatted !== eventCountdown && setEventCountdown(formatted);
    return diff;
  }

  /** This function is called when the au clicks the event participation or notification button.
   *  Returns true if the action should be performed. Returns false if the user is signed out or if
   *  the app is not ready for another request yet.
   */
  function _handleUserClick() {
    if (!auth.currentUser) {
      loginAction();
      return false;
    }
    if (!canParChange || !canNotChange) {
      return false;
    }
    return true;
  }

  function _toggleNotification(_clickEvent) {
    if (!_handleUserClick()) return;
    setClickedNotify(true);
    fetchWithToken(`/events/${event.id}`, "PATCH", {
      toggle: "notification",
    }).then((res) => {
      if (res.ok) {
        setPopupNotification(true);
        setCanNotChange(true);
        res.json().then((data) => {
          // Update the client-side data
          setNotification(data.notified);
          setClickedNotify(false);
        });
        // Force cache update on next reload
        localStorage.removeItem("events");
        localStorage.removeItem("events_" + event.id);
      } else {
        setErrorMessage(res, setPopupError);
        setErrorCode(res.status);
        setClickedNotify(false);
      }
    });
  }

  function _toggleParticipance(_clickEvent) {
    if (!_handleUserClick()) return;
    setClickedParticipate(true);
    fetchWithToken(`/events/${event.id}`, "PATCH", {
      toggle: "participance",
    }).then((res) => {
      if (res.ok) {
        setPopupParticipance(true);
        setCanParChange(false);
        res.json().then((data) => {
          // Update the client-side data
          setParticipance(data.participating);
          event.participants = data.participants;
          setClickedParticipate(false);
        });
        // Force cache update on next reload
        localStorage.removeItem("events");
        localStorage.removeItem("events_" + event.id);
      } else {
        setErrorMessage(res, setPopupError);
        setErrorCode(res.status);
        setClickedParticipate(false);
      }
    });
  }

  const eventHeader = isNextEvent
    ? `Najbliższe wydarzenie` // (za ${eventCountdown}) - wait here till i find u comy spot in ui
    : "Wybrane wydarzenie";

  return (
    <article
      className="w-full grid mb-6 grid-cols-1 gap-3 lg:gap-8 lg:w-11/12 md:w-10/12 mx-auto lg:grid-cols-2 lg:my-12 mt-8"
      id={isNextEvent ? "nextEvent" : event.id}
    >
      <DialogBox
        header={notification ? "Zrobione!" : "Zrobione!"}
        content={`${notification ? "Włączono" : "Wyłączono"
          } powiadomienie dla wydarzenia "${event.title}".`}
        duration={2000}
        isVisible={popupNotification}
        setVisible={setPopupNotification}
      />
      {/* <DialogBox
        header="Błąd!"
        content="Aby wykonać akcję musisz być zalogowana/y."
        type="DIALOG"
        buttonOneLabel="Ok"
        isVisible={needsLogin}
        setVisible={setNeedsLogin}
      /> */}
      <DialogBox
        header={participance ? "Super!" : "Szkoda."}
        content={`${participance ? "Zadeklarowano" : "Cofnięto deklaracje o"
          } udział w wydarzeniu "${event.title}".`}
        duration={2000}
        isVisible={popupParticipance}
        setVisible={setPopupParticipance}
      />
      <DialogBox
        header={`Bład! (HTTP ${errorCode})`}
        content="Nastąpił błąd podczas wykonywania tej akcji. Spróbuj ponownie."
        extra={popupError}
        type="DIALOG"
        buttonOneLabel="Ok"
        isVisible={popupError}
        setVisible={setPopupError}
      />
      <div className="relative lg:pr-10 h-fit">
        <img
          loading="lazy"
          className="bg-gray-200/75 max-h-96 aspect-[3/2] w-full object-cover rounded-xl sm:rounded-2xl drop-shadow-4xl"
          alt={event.photoAlt}
          src={photo}
        />
        <div className="absolute top-0 sm:px-6 sm:py-[.35rem] left-0 px-5 rounded-br-4xl sm:rounded-tl-[.95rem] rounded-tl-[.7rem] py-1 bg-gradient-to-br  from-primary to-secondary">
          <p className="font-medium text-sm text-white tracking-tigh pr-1 sm:text-base">
            {eventHeader}
          </p>
        </div>
        <div className="absolute -bottom-1 -right-1 sm:-right-3 lg:right-4 lg:-bottom-4 sm:-bottom-3 h-[4.5rem] lg:h-[6rem] lg:w-[5.2rem] sm:h-[5.4rem] sm:w-[4.7rem] w-16 rounded-lg bg-white flex drop-shadow-3xl flex-col justify-start align-middle">
          <div className="bg-gradient-to-br from-primary to-secondary w-full h-4 lg:h-5 rounded-t-lg" />
          <p className="text-text-1 font-semibold text-2xl sm:text-3xl mx-auto -mb-2 mt-1 sm:mt-2 lg:text-[2rem]">
            {formatDate(event.date, { day: "numeric" })}
          </p>
          <p className="mx-auto text-text-1 font-semibold text-sm sm:text-base lg:text-lg">
            {formatDate(event.date, { month: "short" })}
          </p>
        </div>
      </div>
      <div className="w-full lg:w-11/12">
        <h1 className="text-text1 mb-1 max-w-full lg:mb-2 line-clamp-3 tracking-[.015rem] font-semibold lg:line-clamp-2 text-xl sm:text-2xl md:text-xl lg:text-[1.7rem] leading-6 md:leading-6 lg:leading-8">
          {event.title}
        </h1>
        <p className="line-clamp-4 md:line-clamp-3 xl:line-clamp-5 tracking-[0.012rem] max-w-full font-normal text-sm lg:text-[.95rem] text-text6 leading-5 lg:leading-[1.65rem]">
          {event.content}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:mt-4 mt-2 lg:gap-5">
          <div className="inline-flex flex-row align-middle">
            <Calendar
              size={26}
              className="aspect-square h-[1.3rem] sm:h-[1.45rem] lg:h-[1.7rem] my-auto stroke-2 stroke-text7"
            />
            <p className="my-auto  sm:text-[.9rem] text-sm lg:text-base lg:pl-3  font-medium pt-1 pl-1 sm:pl-2 text-text7">
              {formatDate(event.date)}
            </p>
          </div>
          <div className="inline-flex flex-row align-middle">
            <Users
              size={26}
              className="aspect-square h-[1.3rem] my-auto sm:h-[1.45rem] lg:h-[1.7rem] stroke-2 stroke-text7"
            />
            <p className="my-auto text-sm sm:text-[.9rem] lg:text-base lg:pl-3 font-medium pt-1 pl-1 sm:pl-2 text-text7">
              {numParticipants}
            </p>
          </div>
          <div className="inline-flex flex-row align-middle">
            <Clock
              size={26}
              className="aspect-square  pt-px h-[1.3rem] sm:h-[1.45rem] lg:h-[1.7rem] my-auto stroke-2 stroke-text7"
            />
            <p className="my-auto text-sm sm:text-[.9rem] lg:text-base lg:pl-3  font-medium pt-1 pl-1 sm:pl-2 text-text7">
              {/* use the EN dash (–) as it is slightly longer than the hyphen (-) */}
              {formatTime(event.startTime)} – {formatTime(event.endTime)}
            </p>
          </div>
          <div className="inline-flex flex-row align-middle">
            <MapPin
              size={26}
              className="aspect-square pt-px h-[1.3rem] sm:h-[1.45rem] lg:h-[1.7rem] my-auto stroke-2 stroke-text7"
            />
            <p className="my-auto text-sm sm:text-[.9rem] lg:text-base lg:pl-3  font-medium pt-1 pl-1 sm:pl-2 text-text7">
              {event.location}
            </p>
          </div>
        </div>
        <div className="inline-flex justify-end w-full mt-4 lg:mt-8   ">
          {event.link && (
            <a
              className="transition-all bg-white aspect-square p-[.5rem] hover:ring-2 hover:ring-primary/30 drop-shadow-3xl pt-[.55rem] pl-[.55rem] rounded-xl"
              href={event.link}
              title={`Link do wydarzenia: ${event.title}`}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink
                size={28}
                className="aspect-square pt-px h-[1.5rem] m-auto stroke-2 stroke-primary"
              />
            </a>
          )}
          {clickedNotify ? (
            <button
              onClick={_toggleNotification}
              disabled
              className={NOTIFY_BTN_CLASS + " aspect-square bg-gray-50"}
              style={{ cursor: "progress" }}
            >
              <Bell
                size={28}
                className={`aspect-square pt-px h-[1.5rem] m-auto stroke-2 stroke-primary transition-all duration-150 ${notification ? "fill-primary" : "fill-transparent"
                  }`}
              />
            </button>
          ) : (
            <button
              onClick={_toggleNotification}
              className={NOTIFY_BTN_CLASS + " aspect-square bg-white"}
              style={{ cursor: canNotChange ? "pointer" : "not-allowed" }}
            >
              <Bell
                size={28}
                className={`aspect-square pt-px h-[1.5rem] m-auto stroke-2 stroke-primary transition-all duration-150 ${notification ? "fill-primary" : "fill-transparent"
                  }`}
              />
            </button>
          )}
          {clickedParticipate ? (
            <button
              onClick={_toggleParticipance}
              className={PARTICIPATE_BTN_CLASS + " bg-primaryDark"}
              style={{ cursor: "progress" }}
              disabled
            >
              {participance ? (
                <UserCheck
                  size={28}
                  className={`aspect-square  h-[1.5rem]  my-auto stroke-2 stroke-white `}
                />
              ) : (
                <User
                  size={28}
                  className={`aspect-square  h-[1.5rem]  my-auto stroke-2 stroke-white `}
                />
              )}
              <p className="text-white pl-1 my-auto font-medium text-base -tracking-[.015rem]">
                {participance ? "Bierzesz udział" : "Wezmę udział"}
              </p>
            </button>
          ) : (
            <button
              onClick={_toggleParticipance}
              className={PARTICIPATE_BTN_CLASS + " bg-primary"}
              style={{ cursor: canParChange ? "pointer" : "not-allowed" }}
            >
              {participance ? (
                <UserCheck
                  size={28}
                  className={`aspect-square  h-[1.5rem]  my-auto stroke-2 stroke-white `}
                />
              ) : (
                <User
                  size={28}
                  className={`aspect-square  h-[1.5rem]  my-auto stroke-2 stroke-white `}
                />
              )}
              <p className="text-white pl-1 my-auto font-medium text-base -tracking-[.015rem]">
                {participance ? "Bierzesz udział" : "Wezmę udział"}
              </p>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default EventPreview;
