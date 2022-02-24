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
    <div className="page-main">
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
      <div className="contact-info">
        <div className="contact-left">
          <MailBox />
        </div>
        <div className="contact-right">
          <h3 className="contact-header">Skontaktuj się z nami poprzez:</h3>
          <div className="contact-media-container">
            <a
              className="contact-media-btn"
              href="mailto:su.lo1.gliwice@gmail.com"
            >
              <img
                src={GmailSVG}
                className="social-image"
                alt="Gmail logo"
                style={{ height: "2em" }}
              />
              <p className="contact-media-name" style={{ color: "#ff4c2b" }}>
                Email
              </p>
            </a>
            <a
              className="contact-media-btn"
              href="https://www.facebook.com/SUILOGliwice"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src={FacebookSVG}
                className="social-image"
                alt="Facebook logo"
                style={{ height: "2.3em" }}
              />
              <p className="contact-media-name" style={{ color: "#1977F3" }}>
                Facebook
              </p>
            </a>
            <a
              className="contact-media-btn"
              href="https://discord.gg/upPdWMc8GJ"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src={DiscordSVG}
                className="social-image"
                alt="Discord logo"
                style={{ height: "2.7em" }}
              />
            </a>
          </div>
          <h4 className="contact-subheader">Lub stacjonarnie w szkole:</h4>
          <address className="contact-localization">
            ul. Zimnej Wody 8, 44-100 Gliwice
          </address>
          <p className="contact-localization">Biblioteka - 3. piętro</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
