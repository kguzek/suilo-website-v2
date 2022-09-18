import { conjugatePolish } from "../../../misc";

export const Timer = ({
  days,
  hours,
  minutes,
  seconds,
  completed,
  message,
  nextCardAction,
}) => {
  if (completed) {
    nextCardAction();
    return <span>{message}</span>;
  } else {
    return (
      <p>
        {days != "0" && (
          <>
            <span className='time-number' style={{ color: colors.primary }}>
              {days}
            </span>
            <span className='time-label' style={{ color: colors.description }}>
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
            <span className='time-label' style={{ color: colors.description }}>
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
            <span className='time-label' style={{ color: colors.description }}>
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
