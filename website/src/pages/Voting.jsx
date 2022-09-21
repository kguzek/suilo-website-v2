import { useState, useEffect } from 'react';
import '../components/Voting/styles/App.css';
import BeforeTime from '../components/Voting/components/BeforeTime';
import BeforeVoting from '../components/Voting/components/BeforeVoting';
import DuringVoting from '../components/Voting/components/DuringVoting';
import AfterVoting from '../components/Voting/components/AfterVoting';
import AfterTime from '../components/Voting/components/AfterTime';
import { API_URL as baseApiLink } from '../firebase';
import { Bars } from 'react-loader-spinner';
import { Link } from 'react-router-dom';
import LogoSU from '../media/LogoSU';

const colorScheme = {
  primary: '#e6710b',
  secondary: '',
  bgPage: '#f5a21c',
  bgCard: '#FAFAFA',
  header: '#111111',
  description: '#666666',
};

const Voting = ({ userInfo, setPage, userEmail, loginAction }) => {
  const [colors, setColors] = useState(colorScheme);
  const [currentCard, setCurrentCard] = useState('before-time');
  const [dates, setDates] = useState({});
  const [classList, setClassList] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState('');
  const [showed, setShowed] = useState(false);
  const [isVoting, setIsVoting] = useState(undefined);

  useEffect(() => {
    setPage('voting');
    setShowed(true);

    fetch(baseApiLink + '/vote/info')
      .then((response) => response.json())
      .then(({ startDate, endDate, resultsDate, classList, candidates, totalVotes }) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();

        setDates({
          startDate: start.getTime(),
          endDate: end.getTime(),
          resultsDate: new Date(resultsDate).getUTCDate(),
        });

        if (now > start && now < end) {
          console.log('before');
          setCurrentCard('before-voting');
        } else if (now > end) {
          console.log('after');

          setCurrentCard('after-time');
        }
        setClassList(classList);
        setCandidates(candidates);
        setTotalVotes(totalVotes);
        setLoaded(true);
        setIsVoting(true);
      })
      .catch(() => {
        setIsVoting(false);
        setLoaded(true);
      });
  }, []);

  return (
    <div
      style={{ backgroundColor: showed ? colors.bgPage : '#F8F8F8' }}
      className="background transition-all duration-500 delay-200 ease-in relative"
    >
      <Link
        className={`absolute top-2 left-2  ${
          showed ? 'opacity-100' : 'opacity-0  -translate-y-[40%]'
        } transition-all duration-[750ms] ease-in-out delay-[600ms]`}
        to="/"
      >
        <LogoSU width="2em" height="2em" />
      </Link>
      <main
        style={{ backgroundColor: colors.bgCard }}
        className={`mainer transition-all duration-[750ms] ease-in-out delay-[600ms] ${
          showed ? 'opacity-100' : 'opacity-0  translate-y-1/4'
        } `}
      >
        <div className="upper-row" style={{ backgroundColor: colors.bgPage }} />
        <div className="center" style={{ padding: '20px 20px 15px 20px', position: 'relative' }}>
          <h1 className="h1" style={{ color: colors.header }}>
            Głosowanie na Marszałka
          </h1>
          <h2 className="h2" style={{ color: colors.description }}>
            I Liceum Ogółnokształcące w Gliwicach
          </h2>
          {loaded ? (
            currentCard === 'before-time' ? (
              <BeforeTime colors={colors} changeCard={setCurrentCard} endDate={dates.startDate} />
            ) : currentCard === 'before-voting' ? (
              <BeforeVoting
                loginAction={loginAction}
                colors={colors}
                userInfo={userInfo}
                changeCard={setCurrentCard}
                endDate={dates.endDate}
                totalVotes={totalVotes}
              />
            ) : currentCard === 'during-voting' ? (
              <DuringVoting
                colors={colors}
                changeCard={setCurrentCard}
                endDate={dates.endDate}
                setMessage={setMessage}
                candidates={candidates}
                classList={classList}
              />
            ) : currentCard === 'after-voting' ? (
              <AfterVoting
                colors={colors}
                changeCard={setCurrentCard}
                endDate={dates.endDate}
                message={message}
              />
            ) : currentCard === 'after-time' ? (
              <AfterTime colors={colors} />
            ) : (
              <p>Tell me how</p>
            )
          ) : (
            <div style={{ margin: '40px' }}>
              <Bars color={colors.primary} height={40} width={40} />
            </div>
          )}
          <p className="signed" style={{ color: colors.description, paddingBottom: '4px' }}>
            {'By: Maciuga Adam & Mrózek Mikołaj - 2022'}
          </p>
        </div>
      </main>
    </div>
  );
};

export default Voting;
