import { useState, useEffect } from 'react';
import Countdown from 'react-countdown';
import '../styles/App.css';
import { API_URL as baseApiLink } from '../../../firebase';
import { Bars } from 'react-loader-spinner';
import { conjugatePolish } from '../../../misc';
import { Timer } from './Timer';

const BeforeVoting = ({ colors, changeCard, endDate, loginAction, userInfo }) => {
  const [voteCount, setVoteCount] = useState(0);
  const [mostVotesClass, setMostVotesClass] = useState('');
  const [waitingForServer, setWaitingForServer] = useState(false);
  useEffect(() => {
    fetch(baseApiLink + '/votes/count')
      .then((response) => response.json())
      .then((data) => {
        setVoteCount(data.total);
        setMostVotesClass(data.classes.sort((a, b) => b.numberOfVotes - a.numberOfVotes)[0]?.class);
      });
  }, []);
  const renderer = (args) => (
    <Timer
      {...colors}
      {...args}
      message="Zakończono głosowanie!"
      nextCardAction={() => changeCard('after-voting')}
    />
  );

  //TODO: wróć tu i ogarnij logowanie normalnie
  const _handleLogIn = () => {
    if (userInfo) {
      changeCard('during-voting');
    } else {
      loginAction();
    }
  };

  return (
    <div className="center" style={{ width: '100%', maxWidth: '100%', marginBottom: '5px' }}>
      {waitingForServer ? (
        <Bars color={colors.primary} height={40} width={40} />
      ) : (
        <div className="voting-info center">
          <div className="voting-spec-info center">
            <h4 style={{ color: colors.primary }}>
              <span style={{ color: colors.description }}>oddano&nbsp;&nbsp;</span>
              {voteCount || '0'}&nbsp;
              <span
                style={{
                  color: colors.description,
                }}
              >
                {conjugatePolish(voteCount, 'głos', '', 'y', 'ów', true)}
                &nbsp;łącznie
                {mostVotesClass && ','}
              </span>
            </h4>
            {mostVotesClass && (
              <h4 style={{ color: colors.primary }}>
                <span style={{ color: colors.description }}>a </span>
                {mostVotesClass}&nbsp;
                <span style={{ color: colors.description }}>to klasa z najwyższą frekwencją</span>
              </h4>
            )}
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
      )}

      <p className="countdown-label" style={{ color: colors.header }}>
        Do zakończenia głosowania pozostało:
      </p>
      <Countdown date={endDate} renderer={renderer} onComplete={() => changeCard('after-time')} />
    </div>
  );
};

export default BeforeVoting;
