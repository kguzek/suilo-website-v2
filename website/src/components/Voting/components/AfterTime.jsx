import { useState, useEffect } from 'react';
import { API_URL as baseApiLink } from '../../../firebase';
import { Bars } from 'react-loader-spinner';

const AfterTime = ({ colors, changeCard }) => {
  const [votes, setVotes] = useState([]);
  const [waitingForServer, setWaitingForServer] = useState(false);
  const [specialMessage, setSpecialMessage] = useState('');
  useEffect(() => {
    setWaitingForServer(true);
    fetch(baseApiLink + '/votes')
      .then((response) => response.json())
      .then((data) => {
        if (data.errorMessage === undefined) {
          setVotes(data.sort((a, b) => b.votes - a.votes));
        } else {
          setSpecialMessage(data.errorMessage);
        }
        setWaitingForServer(false);
      });
  }, []);
  const _createCandidateDisplay = (candidate) => {
    return (
      <p key={candidate.fullName}>
        {candidate.fullName} zdobył {candidate.votes} głosów
      </p>
    );
  };
  return (
    <div className="center w-full">
      <div className="dummy center w-full" style={{ height: 'auto' }}>
        <p>
          {waitingForServer ? (
            <div className="py-8">
              <Bars color={colors.primary} height={40} width={40} />
            </div>
          ) : specialMessage !== '' ? (
            specialMessage
          ) : (
            votes.map(_createCandidateDisplay)
          )}
        </p>
      </div>
      <div className="center" style={{ width: '95%', marginBottom: '20px' }}>
        <p className="support-text">{'Możesz wspomóc nasz rozwój stawiając nam kawę ;)'}</p>
        <a href="https://buycoffee.to/mikixm" target="_blank">
          <img
            src="https://buycoffee.to/btn/buycoffeeto-btn-primary.svg"
            style={{ width: '150px' }}
            alt="Postaw mi kawę na buycoffee.to"
          />
        </a>
      </div>
    </div>
  );
};

export default AfterTime;
