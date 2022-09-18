import Countdown from 'react-countdown';
import { Bars } from 'react-loader-spinner';
import { Timer } from './Timer';

const AfterVoting = ({ colors, changeCard, endDate, message, waitingForServer }) => {
  const renderer = (args) => (
    <Timer
      {...args}
      {...colors}
      message="Zakończono głosowanie!"
      nextCardAction={() => changeCard('after-time')}
    />
  );

  return (
    <div className="center w-full" style={{ width: '100%', maxWidth: '100%', marginBottom: '5px' }}>
      <div className="dummy center w-full" style={{ height: '100px', width: '100%' }}>
        <div className="center">
          {waitingForServer ? (
            <div className="py-8">
              <Bars color={colors.primary} height={40} width={40} />
            </div>
          ) : (
            <p style={{ textAlign: 'center', width: '100%' }}>{message}</p>
          )}
        </div>
      </div>
      <div className="center" style={{ width: '95%' }}>
        <p className="support-text">{'Możesz wspomóc nasz rozwój stawiając nam kawę ;)'}</p>
        <a href="https://buycoffee.to/mikixm" target="_blank">
          <img
            src="https://buycoffee.to/btn/buycoffeeto-btn-primary.svg"
            style={{ width: '150px' }}
            alt="Postaw mi kawę na buycoffee.to"
          />
        </a>
      </div>

      <p className="countdown-label" style={{ color: colors.header }}>
        Do zakończenia głosowania pozostało:
      </p>
      <Countdown date={endDate} renderer={renderer} onComplete={() => changeCard('after-time')} />
    </div>
  );
};

export default AfterVoting;
