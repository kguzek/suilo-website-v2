import { useState, useEffect } from "react";
import "../components/Voting/styles/App.css";
import BeforeTime from "../components/Voting/components/BeforeTime";
import BeforeVoting from "../components/Voting/components/BeforeVoting";
import DuringVoting from "../components/Voting/components/DuringVoting";
import AfterVoting from "../components/Voting/components/AfterVoting";
import AfterTime from "../components/Voting/components/AfterTime";
import { API_URL as baseApiLink } from "../firebase";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { Bars } from "react-loader-spinner";

const colorScheme = {
  primary: "#e6710b",
  secondary: "",
  bgPage: "#f5a21c",
  bgCard: "#FAFAFA",
  header: "#111111",
  description: "#666666",
};

const Voting = ({ userInfo, setPage, userEmail, loginAction }) => {
  const [colors, setColors] = useState(colorScheme);
  const [currentCard, setCurrentCard] = useState("before-time");
  const [token, setToken] = useState();
  const [settings, setSettings] = useState({
    startTime: { _seconds: 16325877560 },
    endTime: { _seconds: 163258775600 },
  });
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [waitingForServer, setWaitingForServer] = useState(false);

  useEffect(() => {
    setPage("voting");
    console.log("DOWNLOADING");
    fetch(baseApiLink + "/settings")
      .then((response) => response.json())
      .then((data) => {
        if (data.startTime !== undefined && data.endTime !== undefined) {
          setSettings(data);
          setLoaded(true);
        }
      });

    setWaitingForServer(true);
  }, []);

  return (
    <div style={{ backgroundColor: colors.bgPage }} className="background">
      <main className="mainer" style={{ backgroundColor: colors.bgCard }}>
        <div className="upper-row" style={{ backgroundColor: colors.bgPage }} />
        <div
          className="center"
          style={{ padding: "20px 20px 15px 20px", position: "relative" }}
        >
          <h1 className="h1" style={{ color: colors.header }}>
            Głosowanie na Marszałka
          </h1>
          <h2 className="h2" style={{ color: colors.description }}>
            I Liceum Ogółnokształcące w Gliwicach
          </h2>
          {loaded && !waitingForServer ? (
            currentCard === "before-time" ? (
              <BeforeTime
                colors={colors}
                changeCard={setCurrentCard}
                endDate={settings.startTime._seconds * 1000}
              />
            ) : currentCard === "before-voting" ? (
              <BeforeVoting
                loginAction={loginAction}
                colors={colors}
                changeCard={setCurrentCard}
                endDate={settings.endTime._seconds * 1000}
              />
            ) : currentCard === "during-voting" ? (
              <DuringVoting
                colors={colors}
                changeCard={setCurrentCard}
                endDate={settings.endTime._seconds * 1000}
                token={token}
                setMessage={setMessage}
              />
            ) : currentCard === "after-voting" ? (
              <AfterVoting
                colors={colors}
                changeCard={setCurrentCard}
                endDate={settings.endTime._seconds * 1000}
                message={message}
              />
            ) : currentCard === "after-time" ? (
              <AfterTime colors={colors} />
            ) : (
              <p>Tell me how</p>
            )
          ) : (
            <div style={{ margin: "40px" }}>
              <Bars color={colors.primary} height={40} width={40} />
            </div>
          )}
          <p
            className="signed"
            style={{ color: colors.description, paddingBottom: "4px" }}
          >
            {"By: Maciuga Adam & Mrózek Mikołaj - 2022"}
          </p>
        </div>
      </main>
    </div>
  );
};

export default Voting;
