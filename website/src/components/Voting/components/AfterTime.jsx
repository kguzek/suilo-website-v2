import { useState, useEffect } from 'react';
import { fetchWithToken } from '../../../firebase';
import { Bars } from 'react-loader-spinner';

const AfterTime = ({ colors, changeCard }) => {
  const [votes, setVotes] = useState([]);
  const [waitingForServer, setWaitingForServer] = useState(true);
  const [specialMessage, setSpecialMessage] = useState('');

  useEffect(() => {
    fetchWithToken('/vote/results').then(
      (res) =>
        res.json().then((data) => {
          if (res.ok) {
            setVotes(data.byCandidates.sort((a, b) => b.votes - a.votes));
          } else {
            setSpecialMessage(data.errorMessage);
          }
          setWaitingForServer(false);
        }),
      (err) => {
        console.error(err);
        setWaitingForServer(false);
      }
    );
  }, []);
  const _createCandidateDisplay = (candidate) => {
    return (
      <p key={candidate.fullName}>
        {candidate.fullName} zdobył {candidate.totalVotes} głosów
      </p>
    );
  };
  return (
    <div className="center w-full">
      <div className="dummy center w-full" style={{ height: 'auto' }}>
        {waitingForServer ? (
          <div className="py-8">
            <Bars color={colors.primary} height={40} width={40} />
          </div>
        ) : (
          <p>{specialMessage !== '' ? specialMessage : votes.map(_createCandidateDisplay)}</p>
        )}
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
