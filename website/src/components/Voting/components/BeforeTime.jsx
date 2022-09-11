import Countdown from "react-countdown";

const BeforeTime = ({ colors, changeCard, endDate }) => {
  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      changeCard("before-voting");
      return <span>Można głosować!</span>;
    } else {
      return (
        <p>
          <span className="time-number" style={{ color: colors.primary }}>
            {days}
          </span>
          <span className="time-label" style={{ color: colors.description }}>
            dni
          </span>
          &nbsp;&nbsp;
          <span className="time-number" style={{ color: colors.primary }}>
            {hours}
          </span>
          <span className="time-label" style={{ color: colors.description }}>
            godzin
          </span>
          &nbsp;&nbsp;
          <span className="time-number" style={{ color: colors.primary }}>
            {minutes}
          </span>
          <span className="time-label" style={{ color: colors.description }}>
            minut
          </span>
          &nbsp;&nbsp;
          <span className="time-number" style={{ color: colors.primary }}>
            {seconds}
          </span>
          <span className="time-label" style={{ color: colors.description }}>
            sekund
          </span>
        </p>
      );
    }
  };

  return (
    <div
      className="center"
      style={{ width: "100%", maxWidth: "100%", marginBottom: "5px" }}
    >
      <div className="dummy center">
        <p>tutaj będzie można oddać głos po rozpoczęciu głosowania</p>
      </div>
      <p className="countdown-label" style={{ color: colors.header }}>
        Do głosowania pozostało:
      </p>
      <Countdown
        date={endDate}
        renderer={renderer}
        onComplete={() => changeCard("before-voting")}
      />
    </div>
  );
};

export default BeforeTime;
