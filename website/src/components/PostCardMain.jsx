import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "react-feather";

const PostCardMain = ({ data }) => {
  const date = new Date(data.date).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const textShort = data.text;
  return (
    <div className="main-post-card">
      <p className="main-post-date">{date}</p>
      <img src={data.photo} className="main-post-image" />
      <div className="main-post-right">
        <h2 className="main-post-header">{data.title}</h2>
        <div className="main-description-box">
          <h3 className="main-post-description">{textShort}</h3>
          <div className="main-post-btn-box">
            <Link
              to={`post/${data.id}`}
              className="main-post-btn"
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
    </div>
  );
};

export default PostCardMain;
