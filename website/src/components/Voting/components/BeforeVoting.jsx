import Countdown from 'react-countdown';
import '../styles/App.css';
import { conjugatePolish } from '../../../misc';
import { Timer } from './Timer';
import { useEffect } from 'react';
import { useState } from 'react';

const BeforeVoting = ({ colors, changeCard, endDate, loginAction, userInfo, totalVotes }) => {
  const [startedVoting, setStartedVoting] = useState(false);

  useEffect(() => {
    userInfo && startedVoting && changeCard('during-voting');
  }, [userInfo, startedVoting]);

  const renderer = (args) => (
    <Timer
      colors={colors}
      {...args}
      message="Zakończono głosowanie!"
      nextCardAction={() => changeCard('after-voting')}
    />
  );

  const _handleLogIn = () => {
    setStartedVoting(true);
    if (userInfo) {
      changeCard('during-voting');
    } else {
      loginAction();
    }
  };

  return (
    <div className="center" style={{ width: '100%', maxWidth: '100%', marginBottom: '5px' }}>
      <div className="voting-info center">
        <div className="voting-spec-info center">
          <h4 style={{ color: colors.primary }}>
            <span style={{ color: colors.description }}>oddano&nbsp;&nbsp;</span>
            {totalVotes || '0'}&nbsp;
            <span
              style={{
                color: colors.description,
              }}
            >
              {conjugatePolish(totalVotes, 'głos', '', 'y', 'ów', true)}
              &nbsp;łącznie
            </span>
          </h4>
        </div>
        <button
          className="vote-btn"
          onClick={() => _handleLogIn()}
          style={{ backgroundColor: colors.primary, color: 'white' }}
        >
          <p className="btn-label">Zagłosuj!</p>
        </button>
        <p className="warning" style={{ color: 'tomato' }}>
          Aby wziąć udział w głosowaniu <b>musisz</b> zalogować się poprzez <b>maila szkolnego</b>
        </p>
      </div>

      <p className="countdown-label" style={{ color: colors.header }}>
        Do zakończenia głosowania pozostało:
      </p>
      <Countdown date={endDate} renderer={renderer} onComplete={() => changeCard('after-time')} />
    </div>
  );
};

export default BeforeVoting;
