import { useState, useEffect } from "react";
import Countdown from "react-countdown";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { Bars } from "react-loader-spinner";

import { API_URL as baseApiLink } from "../../../firebase";
import { conjugatePolish } from "../../../misc";

var Filter = require("bad-words");
const filter = new Filter();

const VoteOption = ({
  colors,
  idx,
  activeIdx,
  setActiveIdx,
  id,
  name,
  classLabel,
}) => {
  const [hover, setHover] = useState(false);
  const [color, setColor] = useState("rgba(0,0,0,.05)");

  useEffect(() => {
    if (activeIdx === idx) {
      setColor("rgba(230, 113, 11, .75)");
    } else {
      setColor("rgba(0,0,0,.05)");
    }
  }, [activeIdx]);

  return (
    <div
      className='candidate-box'
      key={idx}
      // onMouseEnter={() => setHover(true)}
      // onMouseLeave={() => setHover(false)}
      onClick={() => {
        setActiveIdx(idx);
      }}
      style={{
        backgroundColor: color,
      }}
    >
      <p className='candidate-name'>{name}</p>
      <p className='candidate-class' style={{ color: colors.description }}>
        {classLabel}
      </p>
    </div>
  );
};

const DuringVoting = ({ colors, changeCard, endDate, token, setMessage }) => {
  const [activeIdx, setActiveIdx] = useState(null);
  const [customCandidateId, setCustomCandidateId] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [classNameVoter, setClassNameVoter] = useState("1a");
  const [sexVoter, setSexVoter] = useState("kobieta");
  const [classNameCandidate, setClassNameCandidate] = useState("1a");
  const [additionalCandidateName, setAdditionalCandidateName] = useState("");
  const [waitingForServer, setWaitingForServer] = useState(false);

  useEffect(() => {
    filter.addWords(
      "chuj",
      "chuja",
      "chujek",
      "chuju",
      "chujem",
      "chujnia",
      "chujowy",
      "chujowa",
      "chujowe",
      "cipa",
      "cipę",
      "cipe",
      "cipą",
      "cipie",
      "dojebać",
      "dojebac",
      "dojebie",
      "dojebał",
      "dojebal",
      "dojebała",
      "dojebala",
      "dojebałem",
      "dojebalem",
      "dojebałam",
      "dojebalam",
      "dojebię",
      "dojebie",
      "dopieprzać",
      "dopieprzac",
      "dopierdalać",
      "dopierdalac",
      "dopierdala",
      "dopierdalał",
      "dopierdalal",
      "dopierdalała",
      "dopierdalala",
      "dopierdoli",
      "dopierdolił",
      "dopierdolil",
      "dopierdolę",
      "dopierdole",
      "dopierdoli",
      "dopierdalający",
      "dopierdalajacy",
      "dopierdolić",
      "dopierdolic",
      "dupa",
      "dupie",
      "dupą",
      "dupcia",
      "dupeczka",
      "dupy",
      "dupe",
      "huj",
      "hujek",
      "hujnia",
      "huja",
      "huje",
      "hujem",
      "huju",
      "jebać",
      "jebac",
      "jebał",
      "jebal",
      "jebie",
      "jebią",
      "jebia",
      "jebak",
      "jebaka",
      "jebal",
      "jebał",
      "jebany",
      "jebane",
      "jebanka",
      "jebanko",
      "jebankiem",
      "jebanymi",
      "jebana",
      "jebanym",
      "jebanej",
      "jebaną",
      "jebana",
      "jebani",
      "jebanych",
      "jebanymi",
      "jebcie",
      "jebiący",
      "jebiacy",
      "jebiąca",
      "jebiaca",
      "jebiącego",
      "jebiacego",
      "jebiącej",
      "jebiacej",
      "jebia",
      "jebią",
      "jebie",
      "jebię",
      "jebliwy",
      "jebnąć",
      "jebnac",
      "jebnąc",
      "jebnać",
      "jebnął",
      "jebnal",
      "jebną",
      "jebna",
      "jebnęła",
      "jebnela",
      "jebnie",
      "jebnij",
      "jebut",
      "koorwa",
      "kórwa",
      "kurestwo",
      "kurew",
      "kurewski",
      "kurewska",
      "kurewskiej",
      "kurewską",
      "kurewska",
      "kurewsko",
      "kurewstwo",
      "kurwa",
      "kurwaa",
      "kurwami",
      "kurwą",
      "kurwe",
      "kurwę",
      "kurwie",
      "kurwiska",
      "kurwo",
      "kurwy",
      "kurwach",
      "kurwami",
      "kurewski",
      "kurwiarz",
      "kurwiący",
      "kurwica",
      "kurwić",
      "kurwic",
      "kurwidołek",
      "kurwik",
      "kurwiki",
      "kurwiszcze",
      "kurwiszon",
      "kurwiszona",
      "kurwiszonem",
      "kurwiszony",
      "kutas",
      "kutasa",
      "kutasie",
      "kutasem",
      "kutasy",
      "kutasów",
      "kutasow",
      "kutasach",
      "kutasami",
      "matkojebca",
      "matkojebcy",
      "matkojebcą",
      "matkojebca",
      "matkojebcami",
      "matkojebcach",
      "nabarłożyć",
      "najebać",
      "najebac",
      "najebał",
      "najebal",
      "najebała",
      "najebala",
      "najebane",
      "najebany",
      "najebaną",
      "najebana",
      "najebie",
      "najebią",
      "najebia",
      "naopierdalać",
      "naopierdalac",
      "naopierdalał",
      "naopierdalal",
      "naopierdalała",
      "naopierdalala",
      "naopierdalała",
      "napierdalać",
      "napierdalac",
      "napierdalający",
      "napierdalajacy",
      "napierdolić",
      "napierdolic",
      "nawpierdalać",
      "nawpierdalac",
      "nawpierdalał",
      "nawpierdalal",
      "nawpierdalała",
      "nawpierdalala",
      "obsrywać",
      "obsrywac",
      "obsrywający",
      "obsrywajacy",
      "odpieprzać",
      "odpieprzac",
      "odpieprzy",
      "odpieprzył",
      "odpieprzyl",
      "odpieprzyła",
      "odpieprzyla",
      "odpierdalać",
      "odpierdalac",
      "odpierdol",
      "odpierdolił",
      "odpierdolil",
      "odpierdoliła",
      "odpierdolila",
      "odpierdoli",
      "odpierdalający",
      "odpierdalajacy",
      "odpierdalająca",
      "odpierdalajaca",
      "odpierdolić",
      "odpierdolic",
      "odpierdoli",
      "odpierdolił",
      "opieprzający",
      "opierdalać",
      "opierdalac",
      "opierdala",
      "opierdalający",
      "opierdalajacy",
      "opierdol",
      "opierdolić",
      "opierdolic",
      "opierdoli",
      "opierdolą",
      "opierdola",
      "piczka",
      "pieprznięty",
      "pieprzniety",
      "pieprzony",
      "pierdel",
      "pierdlu",
      "pierdolą",
      "pierdola",
      "pierdolący",
      "pierdolacy",
      "pierdoląca",
      "pierdolaca",
      "pierdol",
      "pierdole",
      "pierdolenie",
      "pierdoleniem",
      "pierdoleniu",
      "pierdolę",
      "pierdolec",
      "pierdola",
      "pierdolą",
      "pierdolić",
      "pierdolicie",
      "pierdolic",
      "pierdolił",
      "pierdolil",
      "pierdoliła",
      "pierdolila",
      "pierdoli",
      "pierdolnięty",
      "pierdolniety",
      "pierdolisz",
      "pierdolnąć",
      "pierdolnac",
      "pierdolnął",
      "pierdolnal",
      "pierdolnęła",
      "pierdolnela",
      "pierdolnie",
      "pierdolnięty",
      "pierdolnij",
      "pierdolnik",
      "pierdolona",
      "pierdolone",
      "pierdolony",
      "pierdołki",
      "pierdzący",
      "pierdzieć",
      "pierdziec",
      "pizda",
      "pizdą",
      "pizde",
      "pizdę",
      "piździe",
      "pizdzie",
      "pizdnąć",
      "pizdnac",
      "pizdu",
      "podpierdalać",
      "podpierdalac",
      "podpierdala",
      "podpierdalający",
      "podpierdalajacy",
      "podpierdolić",
      "podpierdolic",
      "podpierdoli",
      "pojeb",
      "pojeba",
      "pojebami",
      "pojebani",
      "pojebanego",
      "pojebanemu",
      "pojebani",
      "pojebany",
      "pojebanych",
      "pojebanym",
      "pojebanymi",
      "pojebem",
      "pojebać",
      "pojebac",
      "pojebalo",
      "popierdala",
      "popierdalac",
      "popierdalać",
      "popierdolić",
      "popierdolic",
      "popierdoli",
      "popierdolonego",
      "popierdolonemu",
      "popierdolonym",
      "popierdolone",
      "popierdoleni",
      "popierdolony",
      "porozpierdalać",
      "porozpierdala",
      "porozpierdalac",
      "poruchac",
      "poruchać",
      "przejebać",
      "przejebane",
      "przejebac",
      "przyjebali",
      "przepierdalać",
      "przepierdalac",
      "przepierdala",
      "przepierdalający",
      "przepierdalajacy",
      "przepierdalająca",
      "przepierdalajaca",
      "przepierdolić",
      "przepierdolic",
      "przyjebać",
      "przyjebac",
      "przyjebie",
      "przyjebała",
      "przyjebala",
      "przyjebał",
      "przyjebal",
      "przypieprzać",
      "przypieprzac",
      "przypieprzający",
      "przypieprzajacy",
      "przypieprzająca",
      "przypieprzajaca",
      "przypierdalać",
      "przypierdalac",
      "przypierdala",
      "przypierdoli",
      "przypierdalający",
      "przypierdalajacy",
      "przypierdolić",
      "przypierdolic",
      "qrwa",
      "rozjebać",
      "rozjebac",
      "rozjebie",
      "rozjebała",
      "rozjebią",
      "rozpierdalać",
      "rozpierdalac",
      "rozpierdala",
      "rozpierdolić",
      "rozpierdolic",
      "rozpierdole",
      "rozpierdoli",
      "rozpierducha",
      "skurwić",
      "skurwiel",
      "skurwiela",
      "skurwielem",
      "skurwielu",
      "skurwysyn",
      "skurwysynów",
      "skurwysynow",
      "skurwysyna",
      "skurwysynem",
      "skurwysynu",
      "skurwysyny",
      "skurwysyński",
      "skurwysynski",
      "skurwysyństwo",
      "skurwysynstwo",
      "spieprzać",
      "spieprzac",
      "spieprza",
      "spieprzaj",
      "spieprzajcie",
      "spieprzają",
      "spieprzaja",
      "spieprzający",
      "spieprzajacy",
      "spieprzająca",
      "spieprzajaca",
      "spierdalać",
      "spierdalac",
      "spierdala",
      "spierdalał",
      "spierdalała",
      "spierdalal",
      "spierdalalcie",
      "spierdalala",
      "spierdalający",
      "spierdalajacy",
      "spierdolić",
      "spierdolic",
      "spierdoli",
      "spierdoliła",
      "spierdoliło",
      "spierdolą",
      "spierdola",
      "srać",
      "srac",
      "srający",
      "srajacy",
      "srając",
      "srajac",
      "sraj",
      "sukinsyn",
      "sukinsyny",
      "sukinsynom",
      "sukinsynowi",
      "sukinsynów",
      "sukinsynow",
      "śmierdziel",
      "udupić",
      "ujebać",
      "ujebac",
      "ujebał",
      "ujebal",
      "ujebana",
      "ujebany",
      "ujebie",
      "ujebała",
      "ujebala",
      "upierdalać",
      "upierdalac",
      "upierdala",
      "upierdoli",
      "upierdolić",
      "upierdolic",
      "upierdoli",
      "upierdolą",
      "upierdola",
      "upierdoleni",
      "wjebać",
      "wjebac",
      "wjebie",
      "wjebią",
      "wjebia",
      "wjebiemy",
      "wjebiecie",
      "wkurwiać",
      "wkurwiac",
      "wkurwi",
      "wkurwia",
      "wkurwiał",
      "wkurwial",
      "wkurwiający",
      "wkurwiajacy",
      "wkurwiająca",
      "wkurwiajaca",
      "wkurwić",
      "wkurwic",
      "wkurwi",
      "wkurwiacie",
      "wkurwiają",
      "wkurwiali",
      "wkurwią",
      "wkurwia",
      "wkurwimy",
      "wkurwicie",
      "wkurwiacie",
      "wkurwić",
      "wkurwic",
      "wkurwia",
      "wpierdalać",
      "wpierdalac",
      "wpierdalający",
      "wpierdalajacy",
      "wpierdol",
      "wpierdolić",
      "wpierdolic",
      "wpizdu",
      "wyjebać",
      "wyjebac",
      "wyjebali",
      "wyjebał",
      "wyjebac",
      "wyjebała",
      "wyjebały",
      "wyjebie",
      "wyjebią",
      "wyjebia",
      "wyjebiesz",
      "wyjebie",
      "wyjebiecie",
      "wyjebiemy",
      "wypieprzać",
      "wypieprzac",
      "wypieprza",
      "wypieprzał",
      "wypieprzal",
      "wypieprzała",
      "wypieprzala",
      "wypieprzy",
      "wypieprzyła",
      "wypieprzyla",
      "wypieprzył",
      "wypieprzyl",
      "wypierdal",
      "wypierdalać",
      "wypierdalac",
      "wypierdala",
      "wypierdalaj",
      "wypierdalał",
      "wypierdalal",
      "wypierdalała",
      "wypierdalala",
      "wypierdalać",
      "wypierdolić",
      "wypierdolic",
      "wypierdoli",
      "wypierdolimy",
      "wypierdolicie",
      "wypierdolą",
      "wypierdola",
      "wypierdolili",
      "wypierdolił",
      "wypierdolil",
      "wypierdoliła",
      "wypierdolila",
      "zajebać",
      "zajebac",
      "zajebie",
      "zajebią",
      "zajebia",
      "zajebiał",
      "zajebial",
      "zajebała",
      "zajebiala",
      "zajebali",
      "zajebana",
      "zajebani",
      "zajebane",
      "zajebany",
      "zajebanych",
      "zajebanym",
      "zajebanymi",
      "zajebiste",
      "zajebisty",
      "zajebistych",
      "zajebista",
      "zajebistym",
      "zajebistymi",
      "zajebiście",
      "zajebiscie",
      "zapieprzyć",
      "zapieprzyc",
      "zapieprzy",
      "zapieprzył",
      "zapieprzyl",
      "zapieprzyła",
      "zapieprzyla",
      "zapieprzą",
      "zapieprza",
      "zapieprzy",
      "zapieprzymy",
      "zapieprzycie",
      "zapieprzysz",
      "zapierdala",
      "zapierdalać",
      "zapierdalac",
      "zapierdalaja",
      "zapierdalał",
      "zapierdalaj",
      "zapierdalajcie",
      "zapierdalała",
      "zapierdalala",
      "zapierdalali",
      "zapierdalający",
      "zapierdalajacy",
      "zapierdolić",
      "zapierdolic",
      "zapierdoli",
      "zapierdolił",
      "zapierdolil",
      "zapierdoliła",
      "zapierdolila",
      "zapierdolą",
      "zapierdola",
      "zapierniczać",
      "zapierniczający",
      "zasrać",
      "zasranym",
      "zasrywać",
      "zasrywający",
      "zesrywać",
      "zesrywający",
      "zjebać",
      "zjebac",
      "zjebał",
      "zjebal",
      "zjebała",
      "zjebala",
      "zjebana",
      "zjebią",
      "zjebali",
      "zjeby",
      "cycuszki",
      "seks",
      "seksik",
      "ruchańsko",
      "cymbały",
      "dzban",
      "siurek"
    );
    fetch(baseApiLink + "/candidates?specialShowing=true")
      .then((response) => response.json())
      .then((data) => {
        setCandidates(data);
      });
  }, []);

  useEffect(() => {
    let cand = candidates.filter(
      (candidate) => candidate.fullName === additionalCandidateName
    );
    if (cand !== undefined) {
      if (cand[0] !== undefined) {
        setCustomCandidateId(cand[0].id);
        setClassNameCandidate(cand[0].className);
      }
    }
  }, [additionalCandidateName]);

  const _handleSubmit = (e) => {
    e.preventDefault();
    let filtered = filter.clean(
      additionalCandidateName === "" ? "its ok" : additionalCandidateName
    );
    if (!filtered.includes("*")) {
      setWaitingForServer(true);
      let path = "";
      let dataToSend = {};
      if (customCandidateId === "" && activeIdx === "CUSTOM") {
        path = "/addCandidate";
        dataToSend = {
          fullName: additionalCandidateName,
          classNameCandidate: classNameCandidate,
          classNameVoter: classNameVoter,
          sex: sexVoter,
        };
      } else {
        path = "/vote";
        dataToSend = {
          className: classNameVoter,
          sex: sexVoter,
          submitVote: activeIdx === "CUSTOM" ? customCandidateId : activeIdx,
        };
      }
      fetch(baseApiLink + path, {
        method: "post",
        headers: new Headers({
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        }),
        body: JSON.stringify(dataToSend),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.errorMessage === undefined) {
            setMessage(data.message);
          } else {
            setMessage(data.errorMessage);
          }
          setWaitingForServer(false);
          changeCard("after-voting");
        });
    } else {
      setAdditionalCandidateName("");
    }
  };

  const _renderOptions = () => {
    return candidates
      .filter((candidate) => candidate.reachedTreshold === true)
      .map((candidate) => (
        <VoteOption
          colors={colors}
          idx={candidate.id}
          activeIdx={activeIdx}
          setActiveIdx={setActiveIdx}
          name={candidate.fullName}
          classLabel={candidate.className}
        />
      ));
  };
  const _renderAdditionalOptions = () => {
    return candidates
      .filter((candidate) => candidate.reachedTreshold === false)
      .map((candidate) => (
        <option value={candidate.fullName} key={candidate.fullName} />
      ));
  };

  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      changeCard("after-voting");
      return <span>Zakończono głosowanie!</span>;
    } else {
      return (
        <p>
          {days != "0" && (
            <>
              <span className='time-number' style={{ color: colors.primary }}>
                {days}
              </span>
              <span
                className='time-label'
                style={{ color: colors.description }}
              >
                {conjugatePolish(days, "d", "zień", "ni", "ni", true)}
              </span>
            </>
          )}
          &nbsp;&nbsp;
          {hours != "0" && (
            <>
              <span className='time-number' style={{ color: colors.primary }}>
                {hours}
              </span>
              <span
                className='time-label'
                style={{ color: colors.description }}
              >
                {conjugatePolish(hours, "godzin", "a", "y", "", true)}
              </span>
            </>
          )}
          &nbsp;&nbsp;
          {minutes != "0" && (
            <>
              <span className='time-number' style={{ color: colors.primary }}>
                {minutes}
              </span>
              <span
                className='time-label'
                style={{ color: colors.description }}
              >
                {conjugatePolish(minutes, "minut", "a", "y", "", true)}
              </span>
            </>
          )}
          &nbsp;&nbsp;
          <span className='time-number' style={{ color: colors.primary }}>
            {seconds}
          </span>
          <span className='time-label' style={{ color: colors.description }}>
            {conjugatePolish(seconds, "sekund", "a", "y", "", true)}
          </span>
        </p>
      );
    }
  };

  return (
    <div
      className='center'
      style={{ width: "100%", maxWidth: "100%", marginBottom: "5px" }}
    >
      {waitingForServer ? (
        <>
          <p>Twój głos jest przesyłany na serwer</p>
          <div style={{ margin: "40px" }}>
            <Bars color={colors.primary} height={40} width={40} />
          </div>
        </>
      ) : (
        <form
          onSubmit={_handleSubmit}
          className='center'
          style={{ width: "100%" }}
        >
          {candidates[0] === undefined ? (
            <div style={{ margin: "40px" }}>
              <Bars color={colors.primary} height={40} width={40} />
            </div>
          ) : (
            <div className='options center'>
              {_renderOptions()}
              <VoteOption
                colors={colors}
                idx='CUSTOM'
                activeIdx={activeIdx}
                setActiveIdx={setActiveIdx}
                name='WŁASNY'
                classLabel='KANDYDAT'
              />
            </div>
          )}
          {activeIdx === "CUSTOM" ? (
            <div className='center' style={{ width: "100%", marginTop: "5px" }}>
              <p style={{ color: colors.header }} className='additionalinfo'>
                — Informacje o kandydacie —
              </p>
              <div className='onerow' style={{ width: "94%" }}>
                <div
                  className='input-box'
                  style={{ width: "100%", minWidth: "100px" }}
                >
                  <p style={{ color: colors.description }}>Imię i nazwisko:</p>
                  <input
                    className='def'
                    list='inni-kandydaci'
                    style={{ color: colors.header, width: "100%" }}
                    value={additionalCandidateName}
                    onChange={(e) => {
                      setAdditionalCandidateName(e.target.value);
                    }}
                    required
                  />
                  <datalist
                    id='inni-kandydaci'
                    style={{ color: colors.header }}
                  >
                    {_renderAdditionalOptions()}
                  </datalist>
                </div>

                <div className='input-box'>
                  <p style={{ color: colors.description }}>Klasa:</p>
                  <select
                    name='classLabel'
                    id='newClassLabel'
                    style={{ color: colors.header }}
                    className='def'
                    value={classNameCandidate}
                    onChange={(e) => {
                      setClassNameCandidate(e.target.value);
                    }}
                    required
                  >
                    <option className='def' value='1a'>
                      1a
                    </option>
                    <option className='def' value='1b'>
                      1b
                    </option>
                    <option className='def' value='1c'>
                      1c
                    </option>
                    <option className='def' value='1d'>
                      1d
                    </option>
                    <option className='def' value='1e'>
                      1e
                    </option>
                    <option className='def' value='2a'>
                      2a
                    </option>
                    <option className='def' value='2b'>
                      2b
                    </option>
                    <option className='def' value='2c'>
                      2c
                    </option>
                    <option className='def' value='2d'>
                      2d
                    </option>
                    <option className='def' value='2e'>
                      2e
                    </option>
                    <option className='def' value='3ap'>
                      3ap
                    </option>
                    <option className='def' value='3bp'>
                      3bp
                    </option>
                    <option className='def' value='3cp'>
                      3cp
                    </option>
                    <option className='def' value='3dp'>
                      3dp
                    </option>
                    <option className='def' value='3ep'>
                      3ep
                    </option>
                    <option className='def' value='3ag'>
                      3ag
                    </option>
                    <option className='def' value='3bg'>
                      3bg
                    </option>
                    <option className='def' value='3cg'>
                      3cg
                    </option>
                    <option className='def' value='3dg'>
                      3dg
                    </option>
                    <option className='def' value='3eg'>
                      3eg
                    </option>
                  </select>
                </div>
              </div>
            </div>
          ) : null}
          <div className='center' style={{ marginTop: "5px" }}>
            <p style={{ color: colors.header }} className='additionalinfo'>
              — Informacje o głosującym —
            </p>

            <div className='onerow'>
              <div className='input-box'>
                <p style={{ color: colors.description }}>Klasa:</p>
                <select
                  name='classLabel'
                  className='def'
                  style={{ color: colors.header }}
                  onChange={(e) => setClassNameVoter(e.target.value)}
                  id='classLabel'
                  required
                >
                  <option className='def' value='1a'>
                    1a
                  </option>
                  <option className='def' value='1b'>
                    1b
                  </option>
                  <option className='def' value='1c'>
                    1c
                  </option>
                  <option className='def' value='1d'>
                    1d
                  </option>
                  <option className='def' value='1e'>
                    1e
                  </option>
                  <option className='def' value='2a'>
                    2a
                  </option>
                  <option className='def' value='2b'>
                    2b
                  </option>
                  <option className='def' value='2c'>
                    2c
                  </option>
                  <option className='def' value='2d'>
                    2d
                  </option>
                  <option className='def' value='2e'>
                    2e
                  </option>
                  <option className='def' value='3ap'>
                    3ap
                  </option>
                  <option className='def' value='3bp'>
                    3bp
                  </option>
                  <option className='def' value='3cp'>
                    3cp
                  </option>
                  <option className='def' value='3dp'>
                    3dp
                  </option>
                  <option className='def' value='3ep'>
                    3ep
                  </option>
                  <option className='def' value='3ag'>
                    3ag
                  </option>
                  <option className='def' value='3bg'>
                    3bg
                  </option>
                  <option className='def' value='3cg'>
                    3cg
                  </option>
                  <option className='def' value='3dg'>
                    3dg
                  </option>
                  <option className='def' value='3eg'>
                    3eg
                  </option>
                </select>
              </div>
              <div className='input-box'>
                <p style={{ color: colors.description }}>Płeć:</p>
                <select
                  name='sex'
                  id='sex'
                  className='def'
                  style={{ color: colors.header }}
                  onChange={(e) => setSexVoter(e.target.value)}
                  required
                >
                  <option className='def' value='kobieta'>
                    kobieta
                  </option>
                  <option className='def' value='mezczyzna'>
                    mężczyzna
                  </option>
                  <option className='def' value='nie-podawac'>
                    nie chcę podawać
                  </option>
                  <option className='def' value='inne'>
                    inne
                  </option>
                </select>
              </div>
            </div>
          </div>
          <button
            className='vote-btn'
            type='submit'
            style={{
              backgroundColor:
                activeIdx === null ? "rgba(0,0,0,.2)" : colors.primary,
              color: "white",
            }}
            disabled={activeIdx === null ? true : false}
          >
            <p className='btn-label'>Oddaj głos!</p>
          </button>
        </form>
      )}
      <p className='countdown-label' style={{ color: colors.header }}>
        Do zakończenia głosowania pozostało:
      </p>
      <Countdown
        date={endDate}
        renderer={renderer}
        onComplete={() => changeCard("after-time")}
      />
    </div>
  );
};

export default DuringVoting;
