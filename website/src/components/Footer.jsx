import React, { useState, useEffect } from "react";

const Footer = ({ isVisible }) => {
  return (
    <div
      style={{
        width: "100vw",
        backgroundColor: "#434343",
        color: "white",
        fontWeight: "300",
        fontSize: "12px",
        textAlign: "center",
        justifyContent: "center",
        marginTop: "5em",
        opacity: isVisible ? 1 : 0
      }}
    >
      <p style={{ padding: "0", margin: "9px" }}>
        suilo.org {new Date().getFullYear()} © Wszystkie prawa zastrzeżone.
      </p>
    </div>
  );
};
export default Footer;
