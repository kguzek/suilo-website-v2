import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "react-feather";
import { formatDate } from "../misc";

const PostCardMain = ({ data }) => {
  const date = formatDate(data.date);
  // const modified = formatDate(data.modified, true);
  const textShort = data.text;
  return (
    <div className="main-post-card">
      {/* {data.modified && (
        <i className="main-post-date">Ostatnia edycja — {modified}</i>
      )} */}
      <p className="main-post-date">{date}</p>
      <img src={data.photo} className="main-post-image" />
      <div className="main-post-right">
        <h2 className="main-post-header">{data.title}</h2>
        <div className="main-description-box">
          <h3 className="main-post-description">{textShort}</h3>
          <div className="main-post-btn-box">
            <Link
              to={data.link}
              className="main-post-btn"
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
