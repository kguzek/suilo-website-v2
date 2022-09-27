import { useEffect } from 'react';
import { useState } from 'react';
import { Edit3, Plus, Trash } from 'react-feather';
import { fetchWithToken } from '../../firebase';
import DialogBox from '../DialogBox';
import LoadingScreen from '../LoadingScreen';
import InputBox from './InputComponents/InputBox';
import InputDropdown from './InputComponents/InputDropdown';

const LOCAL_TIME_OFFSET = 2 * 60 * 60 * 1000;
const getDateString = (baseStr) => {
  const newDate = new Date();
  newDate.setTime(new Date(baseStr).getTime() + LOCAL_TIME_OFFSET);
  return newDate.toJSON()?.split('.')[0];
};
export const VotingEdit = ({ data, loaded, refetchData }) => {
  const [startDate, setStartDate] = useState(getDateString(data.startDate) || '');
  const [endDate, setEndDate] = useState(getDateString(data.endDate) || '');
  const [resultsDate, setResultsDate] = useState(getDateString(data.resultsDate) || '');
  const [voteTreshold, setVoteTreshold] = useState(data.voteTreshold || 0);
  const [classList, setClassList] = useState(data.classList || []);
  const [newClass, setNewClass] = useState('');
  const [currentClass, setCurrentClass] = useState(0);
  const [candidates, setCandidates] = useState([]);
  const [apiCandidates, setApiCandidates] = useState(data.candidates);
  const [candidateName, setCandidateName] = useState('');
  const [currentCandidate, setCurrentCandidate] = useState(0);
  const [candidateClass, setCandidateClass] = useState(0);
  const [candidateNames, setCandidateNames] = useState(
    data?.candidates?.map((c) => c.fullName) || []
  );
  const [candidateClasses, setCandidateClasses] = useState(
    data?.candidates?.map((c) => c.className) || []
  );
  const [deletedCandidates, setDeletedCandidates] = useState([]);
  const [newCandidates, setNewCandidates] = useState([]);

  const [popupConfirm, setPopupConfirm] = useState(false);
  const [popupSuccess, setPopupSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(data.errorDescription ? false : true);

  const [error, setError] = useState({ code: '', message: '' });
  const [popupError, setPopupError] = useState(false);

  const _handleSubmit = () => {
    const body = {
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      resultsDate: new Date(resultsDate).toISOString(),
      voteTreshold: +voteTreshold,
      classList,
    };
    setIsSubmitting(true);
    fetchWithToken('vote/setup/election', isEditing ? 'PUT' : 'POST', undefined, body).then(
      () => {}
    );

    for (const idToDelete of deletedCandidates) {
      fetchWithToken(`vote/setup/candidate/${idToDelete}`, 'DELETE').then(() => {});
    }
    for (const candidate of newCandidates) {
      fetchWithToken('vote/setup/candidate', 'POST', undefined, candidate).then((res) => {
        res.json().then((data) => {
          setApiCandidates((prev) => {
            prev?.map((cand) => {
              if (cand.fullName === data.fullName) {
                cand.id = data.id;
              }
              return cand;
            });
          });
        });
      });
    }
    setNewCandidates([]);
    console.log(deletedCandidates);
  };

  const addClass = () => {
    setNewClass('');
    if (!classList.includes(newClass)) {
      setClassList([...classList, newClass].sort());
    }
  };

  const deleteClass = () => {
    setClassList([...classList.filter((c) => c !== classList[currentClass])]);
  };

  const addCandidate = () => {
    if (!candidateName) return;
    setApiCandidates((prev) => [
      ...prev,
      { fullName: candidateName, className: classList[candidateClass] },
    ]);

    setNewCandidates((prev) =>
      prev
        ? [...prev, { fullName: candidateName, className: classList[candidateClass] }]
        : { fullName: candidateName, className: classList[candidateClass] }
    );
    setCandidateNames([...candidateNames, candidateName]);
    setCandidateClasses([...candidateClasses, classList[candidateClass]]);
    setCandidates((prev) => [...prev, `${candidateName} ${classList[candidateClass]}`]);
    setCandidateName('');
  };

  const deleteCandidate = () => {
    if (apiCandidates[currentCandidate]?.id) {
      setDeletedCandidates((prev) => [...prev, apiCandidates[currentCandidate].id]);
    }
    setApiCandidates((prev) => [
      ...prev.filter((ac) => ac.fullName !== candidateNames[currentCandidate]),
    ]);
    setNewCandidates((prev) => [
      ...prev.filter((ac) => ac.fullName !== candidateNames[currentCandidate]),
    ]);
    setCandidates((prev) => [...prev.filter((c) => c !== prev[currentCandidate])]);
    setCandidateClasses((prev) => [...prev.filter((cc) => cc !== prev[currentCandidate])]);
    setCandidateNames((prev) => [...prev.filter((cn) => cn !== prev[currentCandidate])]);
  };

  useEffect(() => {
    setCandidates([...candidateNames.map((cn, i) => `${cn} ${candidateClasses[i]}`)]);
    setApiCandidates(data?.candidates || []);
  }, []);

  if (!loaded) {
    return <LoadingScreen />;
  }

  return (
    <form
      className="w-full mt-6"
      onSubmit={(e) => {
        e.preventDefault();
        setPopupConfirm(true);
      }}
    >
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
        <div className="flex flex-row h-min w-47%">
          <InputBox
            width="50%"
            name="event-name"
            required={false}
            placeholder="Klasa"
            value={newClass}
            onChange={setNewClass}
            maxLength={3}
          />
          <button
            onClick={() => addClass()}
            className={`add-btn select-none cursor-pointer pointer-events-auto`}
            type="button"
          >
            <Plus color="#FFFFFF" size={24} />
            <p>Dodaj</p>
          </button>
        </div>
        <div className="flex flex-row h-min">
          <div className="pt-[6px] pl-2 ">
            <InputDropdown
              label="Lista klas"
              currentValue={currentClass}
              onChangeCallback={setCurrentClass}
              valueDisplayObject={classList}
              isFirst={false}
            />
          </div>
          <button
            onClick={() => deleteClass()}
            className={`add-btn select-none cursor-pointer pointer-events-auto`}
            type="button"
          >
            <Trash color="#FFFFFF" size={24} />
            <p>Usuń</p>
          </button>
        </div>
      </div>
      <div className="h-8" />
      <div
        className="fr"
        style={{
          width: '100%',
          margin: '-1em 0',
          justifyContent: 'space-between',
        }}
      >
        <div className="flex flex-row h-min w-[57%]">
          <InputBox
            width="75%"
            name="event-name"
            required={false}
            placeholder="Dane kandydata"
            value={candidateName}
            onChange={setCandidateName}
          />
          <div className="pt-[6px] pl-2 ">
            <InputDropdown
              label="Klasa"
              currentValue={candidateClass}
              onChangeCallback={setCandidateClass}
              valueDisplayObject={classList}
              isFirst={false}
            />
          </div>
          <button
            onClick={() => addCandidate()}
            className={`add-btn select-none cursor-pointer pointer-events-auto`}
            type="button"
          >
            <Plus color="#FFFFFF" size={24} />
            <p>Dodaj</p>
          </button>
        </div>
        <div className="flex flex-row h-min w-[31%]">
          <div className="pt-[6px]">
            <InputDropdown
              label="Lista kandydatów"
              currentValue={currentCandidate}
              onChangeCallback={setCurrentCandidate}
              valueDisplayObject={candidates}
              isFirst={false}
            />
          </div>
          <button
            onClick={() => deleteCandidate()}
            className={`add-btn select-none cursor-pointer pointer-events-auto`}
            type="button"
          >
            <Trash color="#FFFFFF" size={24} />
            <p>Usuń</p>
          </button>
        </div>
      </div>
      <div className="h-8" />

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
      <div className="w-8" />
      <div
        className="fr"
        style={{
          width: '100%',
          margin: '-1em 0',
          justifyContent: 'space-between',
        }}
      >
        <InputBox
          width="67%"
          name="event-time-start"
          type="datetime-local"
          min={endDate}
          pattern="dd/mm/yyyy HH:mm"
          placeholder="Ukazanie wyników"
          value={resultsDate}
          onChange={setResultsDate}
        />
        <InputBox
          width="30%"
          name="event-name"
          type="number"
          placeholder="Treshold"
          value={voteTreshold}
          onChange={setVoteTreshold}
        />
      </div>
      <div className="w-8" />

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
          <p>{isEditing ? 'zmień głosowanie' : 'ustaw głosowanie'}</p>
        </button>
      </div>
    </form>
  );
};
