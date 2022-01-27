import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const PostCardSecondary = ({ data }) => {
  return (
    <Link
      to={data.link}
      className="secondary-post-card"
    >
      <img src={data.photo} className="secondary-post-image" />
      <p className="secondary-post-header" title={data.title}>
        {data.title}
      </p>
    </Link>
  );
};

export default PostCardSecondary;
