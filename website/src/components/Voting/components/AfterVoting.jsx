import Countdown from "react-countdown";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { Bars } from "react-loader-spinner";
import { conjugatePolish } from "../../../misc";

const AfterVoting = ({
  colors,
  changeCard,
  endDate,
  message,
  waitingForServer,
}) => {
  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      changeCard("after-time");
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
      className='center w-full'
      style={{ width: "100%", maxWidth: "100%", marginBottom: "5px" }}
    >
      <div
        className='dummy center w-full'
        style={{ height: "100px", width: "100%" }}
      >
        <div className='center'>
          {waitingForServer ? (
            <div className='py-8'>
              <Bars color={colors.primary} height={40} width={40} />
            </div>
          ) : (
            <p style={{ textAlign: "center", width: "100%" }}>{message}</p>
          )}
        </div>
      </div>
      <div className='center' style={{ width: "95%" }}>
        <p className='support-text'>
          {"Możesz wspomóc nasz rozwój stawiając nam kawę ;)"}
        </p>
        <a href='https://buycoffee.to/mikixm' target='_blank'>
          <img
            src='https://buycoffee.to/btn/buycoffeeto-btn-primary.svg'
            style={{ width: "150px" }}
            alt='Postaw mi kawę na buycoffee.to'
          />
        </a>
      </div>

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

export default AfterVoting;
