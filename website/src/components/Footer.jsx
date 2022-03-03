import React, { useState, useEffect } from "react";

const Footer = ({ isVisible }) => {
  return (
    <div
      className={`flex w-screen bg-footer text-white font-light text-[.8rem] ${isVisible ? "block" : "hidden"} mt-7 justify-center align-middle`}
    >
      <p className="my-2 mt-3">
        suilo.org {new Date().getFullYear()} © Wszystkie prawa zastrzeżone.
      </p>
    </div>
  );
};
export default Footer;
