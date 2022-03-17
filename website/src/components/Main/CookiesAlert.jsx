import React, { useState } from "react";

const CookiesAlert = () => {
  const cookiesNotAccepted = localStorage.getItem("cookiesEnabled") !== "true";
  const [isOpen, setIsOpen] = useState(cookiesNotAccepted);

  // user agreed to cookies policy
  const _cookieAgree = () => {
    // action
    localStorage.setItem("cookiesEnabled", "true");
    setIsOpen(false);
  };

  // user disagreed with cookies policy
  const _cookieDisagree = () => {
    localStorage.setItem("cookiesEnabled", "false");
    setIsOpen(false);
  };

  return (
    <div
      className={`flex flex-col fixed bottom-0 align-middle justify-between p-5 pt-6 md:pt-5 bg-white w-screen rounded-t-3xl drop-shadow-2xl z-50 sm:w-11/12 md:flex-row md:w-fit md:p-6 lg:p-7 animate-all duration-300 ${isOpen ? "translate-y-0" : "translate-y-full"
        }`}
    >
      <div className="flex flex-col justify-center md:mr-6 align-top">
        <p className="text-text2 font-medium pb-1 text-md text-center md:text-left">
          Strona używa plików cookies i wymaga zgody na poprawne jej
          funkcjonowanie.
        </p>
        <p className="text-text3 font-normal text-sm pt-1 text-center pb-4 md:text-left md:pb-0">
          {"psst... nie przechowujemy żadnych wrażliwych danych :)"}
        </p>
      </div>
      <div className="flex flex-row-reverse md:flex-col justify-center align-middle">
        <button
          className="px-5 py-2 bg-gradient-to-br from-primary to-secondary text-white rounded-2lg drop-shadow-6xl hover:ring-[2px] hover:ring-primary/30 transition-all duration-150 "
          onClick={_cookieAgree}
        >
          <p className="my-px whitespace-nowrap font-regular">Wyrażam zgodę</p>
        </button>
        <button
          className="mt-3 mr-4 md:mr-0 lg:mt-4 lg:-mb-3 group"
          onClick={_cookieDisagree}
        >
          <p className="my-px text-sm text-center text-primary whitespace-nowrap transition group-hover:text-amber-600">
            Nie wyrażam zgody
          </p>
        </button>
      </div>
    </div>
  );
};

export default CookiesAlert;
