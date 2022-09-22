import { useState } from 'react';
import { fetchWithToken } from '../../firebase';
import LoadingScreen from '../LoadingScreen';

export const VotingEdit = ({ data, loaded, refetchData }) => {
  const [startDate, setStartDate] = useState();
  const [endate, setEndDate] = useState();
  const [resultDate, setResulttDate] = useState();
  const [voteTreshold, setVoteTreshold] = useState(0);
  const [classList, setClassList] = useState([]);
  const _handleSubmit = () => {
    const body = { startDate, endate, resultDate, voteTreshold, classList };
    fetchWithToken('vote/setup/election', 'POST', undefined, body).then((res) => {
      if (res.ok) {
        //dobrze I guess nie wiem
      } else {
        //źle
      }
    });
  };
  if (!loaded) {
    return <LoadingScreen />;
  }
  return <p>Daj tu forma</p>;
};
