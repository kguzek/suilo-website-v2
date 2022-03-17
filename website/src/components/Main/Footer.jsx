import React, { useState, useEffect } from "react";
import { WEBSITE_DOMAIN } from "../../misc";
import DialogBox from "../DialogBox";

const Footer = ({ isVisible }) => {
  const [easterEgg, setEasterEgg] = useState(false);
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    if (clicks === 1) {
      setTimeout(() => {
        setClicks(0);
      }, 2000);
    }
    if (clicks >= 10) {
      setEasterEgg(true);
    }
  }, [clicks]);

  return (
    <div
      className={`flex w-screen bg-footer text-white font-light text-[.8rem] ${isVisible ? "block" : "block"
        } mt-7 justify-center align-middle`}
    >
      <DialogBox
        header="Hey, you! You're finally awake."
        content="Strona została dostarczona dla Was dzięki pracy w pocie czoła przez drużynę w składzie: Konrad Guzek, Adam Maciuga, Mikołaj Mrózek"
        buttonOneLabel="Super!"
        buttonTwoLabel="Dziękuję"
        type="DIALOG"
        isVisible={easterEgg}
        setVisible={setEasterEgg}
      />
      <p
        className="my-2 mt-3 select-none"
        onClick={() => setClicks(clicks + 1)}
      >
        {WEBSITE_DOMAIN} {new Date().getFullYear()} © Wszystkie prawa zastrzeżone.
      </p>
    </div>
  );
};
export default Footer;
