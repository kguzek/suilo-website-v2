import Countdown from "react-countdown";
import { conjugatePolish } from "../../../misc";

const BeforeTime = ({ colors, changeCard, endDate }) => {
  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      changeCard("before-voting");
      return <span>Można głosować!</span>;
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
      <div className='dummy center'>
        <p>tutaj będzie można oddać głos po rozpoczęciu głosowania</p>
      </div>
      <p className='countdown-label' style={{ color: colors.header }}>
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
