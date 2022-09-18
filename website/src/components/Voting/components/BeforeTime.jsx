import Countdown from 'react-countdown';
import { Timer } from './Timer';

const BeforeTime = ({ colors, changeCard, endDate }) => {
  const renderer = (args) => (
    <Timer
      {...args}
      {...colors}
      message="Można głosować!"
      nextCardAction={() => changeCard('before-voting')}
    />
  );

  return (
    <div className="center" style={{ width: '100%', maxWidth: '100%', marginBottom: '5px' }}>
      <div className="dummy center">
        <p>tutaj będzie można oddać głos po rozpoczęciu głosowania</p>
      </div>
      <p className="countdown-label" style={{ color: colors.header }}>
        Do głosowania pozostało:
      </p>
      <Countdown
        date={endDate}
        renderer={renderer}
        onComplete={() => changeCard('before-voting')}
      />
    </div>
  );
};

export default BeforeTime;
