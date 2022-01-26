import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "react-feather";

const PostCardPrimary = ({ data }) => {
  const textShort = data.text;
  return (
    <div className="primary-post-card">
      <img src={data.photo} className="primary-post-image" />
      <h2 className="primary-post-header" title={data.title}>
        {data.title}
      </h2>
      <div className="primary-description-box">
        <h3 className="primary-post-description" title={textShort}>
          {textShort}
        </h3>
        <div className="primary-post-btn-box">
          <Link
            to={data.link}
            className="primary-post-btn"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <p>czytaj dalej</p>
            <ArrowRight
              size={16}
              strokeWidth={"2.5px"}
              style={{ marginBottom: "-.1em", paddingLeft: ".5em" }}
              color="#FFA900"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostCardPrimary;
