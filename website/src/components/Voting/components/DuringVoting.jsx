import { useState, useEffect } from 'react';
import Countdown from 'react-countdown';
import { Bars } from 'react-loader-spinner';

import { fetchWithToken } from '../../../firebase';
import { badWords } from './badWords.constants';
import { Timer } from './Timer';

var Filter = require('bad-words');
const filter = new Filter();

const VoteOption = ({ colors, idx, activeIdx, setActiveIdx, id, name, classLabel }) => {
  const [hover, setHover] = useState(false);
  const [color, setColor] = useState('rgba(0,0,0,.05)');

  useEffect(() => {
    if (activeIdx === idx) {
      setColor('rgba(230, 113, 11, .75)');
    } else {
      setColor('rgba(0,0,0,.05)');
    }
  }, [activeIdx]);

  return (
    <div
      className="candidate-box"
      key={idx}
      // onMouseEnter={() => setHover(true)}
      // onMouseLeave={() => setHover(false)}
      onClick={() => {
        setActiveIdx(idx);
      }}
      style={{
        backgroundColor: color,
      }}
    >
      <p className="candidate-name">{name}</p>
      <p className="candidate-class" style={{ color: colors.description }}>
        {classLabel}
      </p>
    </div>
  );
};

const DuringVoting = ({ colors, changeCard, endDate, setMessage, candidates, classList }) => {
  const [activeIdx, setActiveIdx] = useState(null);
  const [customCandidateId, setCustomCandidateId] = useState('');
  const [classNameVoter, setClassNameVoter] = useState(classList[0]);
  const [sexVoter, setSexVoter] = useState('female');
  const [classNameCandidate, setClassNameCandidate] = useState(classList[0]);
  const [additionalCandidateName, setAdditionalCandidateName] = useState('');
  const [waitingForServer, setWaitingForServer] = useState(false);

  useEffect(() => {
    filter.addWords(...badWords);
  }, []);

  useEffect(() => {
    let cand = candidates.filter((candidate) => candidate.fullName === additionalCandidateName);
    if (cand !== undefined) {
      if (cand[0] !== undefined) {
        setCustomCandidateId(cand[0].id);
        setClassNameCandidate(cand[0].className);
      }
    }
  }, [additionalCandidateName]);

  const _handleSubmit = (e) => {
    e.preventDefault();
    let filtered = filter.clean(
      additionalCandidateName === '' ? 'its ok' : additionalCandidateName
    );
    if (!filtered.includes('*')) {
      setWaitingForServer(true);
      let path = '/vote/';
      let dataToSend = {};
      if (customCandidateId === '' && activeIdx === 'CUSTOM') {
        dataToSend = {
          candidate: {
            fullName: additionalCandidateName,
            className: classNameCandidate,
          },
          className: classNameVoter,
          gender: sexVoter,
        };
      } else {
        path += activeIdx === 'CUSTOM' ? customCandidateId : activeIdx;
        dataToSend = {
          className: classNameVoter,
          gender: sexVoter,
        };
      }

      fetchWithToken(path, 'POST', undefined, dataToSend).then(
        (res) =>
          res.json().then((data) => {
            if (res.ok) {
              setMessage(data.message);
            } else {
              setMessage(data.errorDescription);
            }
            setWaitingForServer(false);
            changeCard('after-voting');
          }),
        (err) => {
          console.error(err);
          setWaitingForServer(false);
        }
      );
    } else {
      setAdditionalCandidateName('');
    }
  };

  const _renderOptions = () => {
    return candidates
      .filter((candidate) => candidate.reachedTreshold || candidate.official)
      .map((candidate) => (
        <VoteOption
          colors={colors}
          idx={candidate.id}
          activeIdx={activeIdx}
          setActiveIdx={setActiveIdx}
          name={candidate.fullName}
          classLabel={candidate.className}
          key={candidate.fullName + candidate.id}
        />
      ));
  };
  const _renderAdditionalOptions = () => {
    return candidates
      .filter((candidate) => !(candidate.reachedTreshold || candidate.official))
      .map((candidate) => <option value={candidate.fullName} key={candidate.fullName} />);
  };

  const renderer = (args) => (
    <Timer
      colors={colors}
      {...args}
      message="Zakończono głosowanie!"
      nextCardAction={() => changeCard('after-voting')}
    />
  );

  return (
    <div className="center" style={{ width: '100%', maxWidth: '100%', marginBottom: '5px' }}>
      {waitingForServer ? (
        <>
          <p>Twój głos jest przesyłany na serwer</p>
          <div style={{ margin: '40px' }}>
            <Bars color={colors.primary} height={40} width={40} />
          </div>
        </>
      ) : (
        <form onSubmit={_handleSubmit} className="center" style={{ width: '100%' }}>
          {candidates[0] === undefined ? (
            <div style={{ margin: '40px' }}>
              <Bars color={colors.primary} height={40} width={40} />
            </div>
          ) : (
            <div className="options center">
              {_renderOptions()}
              <VoteOption
                colors={colors}
                idx="CUSTOM"
                activeIdx={activeIdx}
                setActiveIdx={setActiveIdx}
                name="WŁASNY"
                classLabel="KANDYDAT"
              />
            </div>
          )}
          {activeIdx === 'CUSTOM' ? (
            <div className="center" style={{ width: '100%', marginTop: '5px' }}>
              <p style={{ color: colors.header }} className="additionalinfo">
                — Informacje o kandydacie —
              </p>
              <div className="onerow" style={{ width: '94%' }}>
                <div className="input-box" style={{ width: '100%', minWidth: '100px' }}>
                  <p style={{ color: colors.description }}>Imię i nazwisko:</p>
                  <input
                    className="def"
                    list="inni-kandydaci"
                    style={{ color: colors.header, width: '100%' }}
                    value={additionalCandidateName}
                    onChange={(e) => {
                      setAdditionalCandidateName(e.target.value);
                    }}
                    required
                  />
                  <datalist id="inni-kandydaci" style={{ color: colors.header }}>
                    {_renderAdditionalOptions()}
                  </datalist>
                </div>

                <div className="input-box">
                  <p style={{ color: colors.description }}>Klasa:</p>
                  <select
                    name="classLabel"
                    id="newClassLabel"
                    style={{ color: colors.header }}
                    className="def"
                    value={classNameCandidate}
                    onChange={(e) => {
                      setClassNameCandidate(e.target.value);
                    }}
                    required
                  >
                    {classList.map((c, idx) => (
                      <option className="def" value={c} key={c + idx + 'a'}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : null}
          <div className="center" style={{ marginTop: '5px' }}>
            <p style={{ color: colors.header }} className="additionalinfo">
              — Informacje o głosującym —
            </p>

            <div className="onerow">
              <div className="input-box">
                <p style={{ color: colors.description }}>Klasa:</p>
                <select
                  name="classLabel"
                  className="def"
                  style={{ color: colors.header }}
                  onChange={(e) => setClassNameVoter(e.target.value)}
                  id="classLabel"
                  required
                >
                  {classList.map((c, idx) => (
                    <option className="def" value={c} key={c + idx + 'b'}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-box">
                <p style={{ color: colors.description }}>Płeć:</p>
                <select
                  name="sex"
                  id="sex"
                  className="def"
                  style={{ color: colors.header }}
                  onChange={(e) => setSexVoter(e.target.value)}
                  required
                >
                  <option className="def" value="female">
                    kobieta
                  </option>
                  <option className="def" value="male">
                    mężczyzna
                  </option>
                  <option className="def" value="notSpecified">
                    nie chcę podawać
                  </option>
                  <option className="def" value="other">
                    inne
                  </option>
                </select>
              </div>
            </div>
          </div>
          <button
            className="vote-btn"
            type="submit"
            style={{
              backgroundColor: activeIdx === null ? 'rgba(0,0,0,.2)' : colors.primary,
              color: 'white',
            }}
            disabled={activeIdx === null ? true : false}
          >
            <p className="btn-label">Oddaj głos!</p>
          </button>
        </form>
      )}
      <p className="countdown-label" style={{ color: colors.header }}>
        Do zakończenia głosowania pozostało:
      </p>
      <Countdown date={endDate} renderer={renderer} onComplete={() => changeCard('after-time')} />
    </div>
  );
};

export default DuringVoting;
