import React, { useEffect } from "react";
import MetaTags from "react-meta-tags";
import MailBox from "../media/MailBox";
import FacebookSVG from "../media/facebook.svg";
import DiscordSVG from "../media/discord.svg";
import GmailSVG from "../media/gmail.svg";

const Contact = ({ setPage }) => {
  useEffect(() => {
    setPage("contact");
  });

  return (
    <div className="flex w-11/12 xl:w-10/12 flex-col justify-start min-h-[77.5vh] mt-20 align-top pb-10 m-auto">
      <MetaTags>
        <title>
          Kontakt | Samorząd Uczniowski 1 Liceum Ogólnokształcącego w Gliwicach
        </title>
        <meta
          name="description"
          content="Można się z nami skontaktować online poprzez Facebooka, Instagrama, Discorda, oraz E-mail, jak i również fizycznie w szkole. Więcej informacji na stronie. "
        />
        <meta property="og:title" content="Kontakt | SUILO Gliwice" />
        <meta property="og:image" content="" /> {/* IMAGE TO BE ADDED */}
      </MetaTags>
      <div className="grid grid-cols-1 gap-7 md:gap-9 w-full lg:m-auto items-stretch lg:grid-cols-2  ">
        <div className="w-10/12 m-auto max-w-sm lg:max-w-md">
          <MailBox />
        </div>
        <div className="grid grid-cols-1 w-full sm:w-fit sm:m-auto sm:text-center lg:text-left lg:pt-10">
          <h3 className="text-text1 font-bold text-2xl md:text-3xl lg:text-[2rem]">Skontaktuj się z nami poprzez:</h3>
          <div className="flex flex-wrap max-w-full py-3 ">
            <a
              className="bg-white rounded-lg inline-flex mr-4 md:mr-6  flex-row justify-start align-middle h-[3.2rem] md:h-16 transition-all py-1 md:py-3 pt-[.85rem] md:pt-[1rem]  px-6 md:px-7 drop-shadow-6xl hover:ring-[2.5px] hover:ring-[#de5246]/70 my-2 md:my-3"
              href="mailto:su.lo1.gliwice@gmail.com"
            >
              <img
                src={GmailSVG}
                className="h-[1.5rem] md:h-[1.85rem]"
                alt="Gmail logo"
              />
              <p className="text-[1.1rem] md:text-[1.25rem] font-medium pl-4 md:pt-px" style={{ color: "#ff4c2b" }}>
                Email
              </p>
            </a>
            <a
              className="bg-white rounded-lg mr-4 md:mr-6 inline-flex flex-row justify-start align-middle h-[3.2rem] md:h-16 transition-all py-1 md:py-3 pt-[.85rem] md:pt-[1rem] px-6 md:px-7 drop-shadow-6xl hover:ring-[2.5px] hover:ring-[#196dff]/70 my-2 md:my-3"
              href="https://www.facebook.com/SUILOGliwice"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src={FacebookSVG}
                className="h-[1.9rem] -mt-[.185rem] md:-mt-px md:h-9"
                alt="Facebook logo"
              />
              <p className="text-[1.1rem] md:text-[1.25rem]  font-medium pl-4 md:pt-px" style={{ color: "#1977F3" }}>
                Facebook
              </p>
            </a>
            <a
              className="bg-white rounded-lg inline-flex mr-4 md:mr-6 flex-row justify-start align-middle h-[3.2rem] md:h-16 transition-all py-1 md:py-3 pt-[.85rem] md:pt-[1rem] px-6 md:px-7 drop-shadow-6xl hover:ring-[2.5px] hover:ring-[#5865F2]/70 my-2 md:my-3"
              href="https://discord.gg/upPdWMc8GJ"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src={DiscordSVG}
                className="h-[2.2rem] -mt-[.325rem] md:h-10 md:-mt-[.2rem]"
                alt="Discord logo"
              />
            </a>
          </div>
          <h4 className="font-medium text-[#1b1b1b] text-xl md:text-2xl mt-1 lg:mt-3">Lub stacjonarnie w szkole:</h4>
          <address className="font-normal text-text1 mt-[.6rem] text-base not-italic md:text-[1.075rem] select-all">
            ul. Zimnej Wody 8, 44-100 Gliwice
          </address>
          <p className="font-normal text-text1 mt-[.6rem] text-base not-italic md:text-[1.075rem]">Biblioteka - 3. piętro</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
