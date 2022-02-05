import React, { useState, useEffect } from "react";
import MetaTags from "react-meta-tags";
import MailBox from "../media/MailBox";
import FacebookSVG from '../media/facebook.svg'
import DiscordSVG from '../media/discord.svg'
import GmailSVG from '../media/gmail.svg'

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
        <div className="constact-right">
          <h3 className="contact-header">
            Skontaktuj się z nami poprzez:
          </h3>
          <div className="contact-media-container">
            <div className="contact-media-btn">
              <img src={GmailSVG} className="social-image" alt="gamil logo" />
              <p className="contact-media-name">Email</p>
            </div>
            <div className="contact-media-btn">
              <img src={FacebookSVG} className="social-image" alt="facebook logo" />
              <p className="contact-media-name">Facebook</p>
            </div>
            <div className="contact-media-btn" >
              <img src={DiscordSVG} className="social-image" alt="discord logo" />
            </div>
          </div>
          <h4 className="contact-subheader">
            Lub stacjonarnie w szkole:
          </h4>
          <address className="contact-localization">
            ul. Zimnej Wody 8, 44-100 Gliwice
          </address>
          <p className="contact-localization">
            Biblioteka - 3. piętro
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
