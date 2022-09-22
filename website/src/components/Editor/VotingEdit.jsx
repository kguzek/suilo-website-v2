import { useState } from 'react';
import { Edit3, Plus } from 'react-feather';
import { fetchWithToken } from '../../firebase';
import DialogBox from '../DialogBox';
import LoadingScreen from '../LoadingScreen';
import InputBox from './InputComponents/InputBox';

export const VotingEdit = ({ data, loaded, refetchData }) => {
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [resultDate, setResulttDate] = useState();
  const [voteTreshold, setVoteTreshold] = useState(0);
  const [classList, setClassList] = useState([]);

  const [popupConfirm, setPopupConfirm] = useState(false);
  const [popupSuccess, setPopupSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [error, setError] = useState({ code: '', message: '' });
  const [popupError, setPopupError] = useState(false);

  const _handleSubmit = () => {
    const body = { startDate, endDate, resultDate, voteTreshold, classList };
    setIsSubmitting(true);
    fetchWithToken('vote/setup/election', 'POST', undefined, body).then((res) => {
      if (res.ok) {
        //dobrze I guess nie wiem
        setIsSubmitting(false);
      } else {
        //źle
        setIsSubmitting(false);
      }
    });
  };

  if (!loaded) {
    return <LoadingScreen />;
  }

  return (
    <form className="w-full mt-6" onSubmit={() => setPopupConfirm(true)}>
      <DialogBox
        header="Uwaga!"
        content="Czy na pewno chcesz zapisać ustawienia głosowania? Po jego rozpoczęciu nie będzie możliwości ich zmiany."
        isVisible={popupConfirm}
        setVisible={setPopupConfirm}
        type="DIALOG"
        buttonOneLabel="Anuluj"
        buttonTwoLabel="Zapisz ustawienia"
        buttonOneCallback={() => null}
        buttonTwoCallback={() => _handleSubmit()}
      />
      <DialogBox
        header="Sukces!"
        content="Pomyślnie dokonano wszelkich zmian"
        duration={2000}
        isVisible={popupSuccess}
        setVisible={setPopupSuccess}
      />
      <DialogBox
        header={`Bład! (HTTP ${error.code})`}
        content={error.message}
        extra={popupError}
        type="DIALOG"
        buttonOneLabel="Ok"
        isVisible={popupError}
        setVisible={setPopupError}
      />
      <div
        className="fr"
        style={{
          width: '100%',
          margin: '-1em 0',
          justifyContent: 'space-between',
        }}
      >
        <InputBox
          width="47%"
          name="event-time-start"
          type="datetime-local"
          pattern="dd/mm/yyyy HH:mm"
          max={endDate}
          placeholder="Rozpoczęcie"
          value={startDate}
          onChange={setStartDate}
        />
        <p className="from-to-indicator">-</p>
        <InputBox
          width="47%"
          name="event-time-end"
          type="datetime-local"
          min={startDate}
          pattern="dd/mm/yyyy HH:mm"
          placeholder="Zakończenie"
          value={endDate}
          onChange={setEndDate}
        />
      </div>

      <div className="fr" style={{ width: '100%', justifyContent: 'right' }}>
        <button
          type="submit"
          className={`add-btn select-none ${isSubmitting ? 'cursor-wait' : 'cursor-pointer'}`}
          disabled={isSubmitting}
          style={{ pointerEvents: isSubmitting ? 'none' : 'all' }}
        >
          {isEditing !== '_default' ? (
            <Edit3 color="#FFFFFF" size={24} />
          ) : (
            <Plus color="#FFFFFF" size={24} />
          )}
          <p>ustaw głosowanie</p>
        </button>
      </div>
    </form>
  );
};
