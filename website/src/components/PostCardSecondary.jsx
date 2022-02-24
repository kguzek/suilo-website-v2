import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getURLfromFileName } from "../misc";

const PostCardSecondary = ({ data }) => {
  const [photo,setphoto] = useState(data.photo);
  useEffect(() => {
    getURLfromFileName(data.photo,"600x400",setphoto)
  }, []);
  return (
    <Link
      to={data.link}
      className="secondary-post-card"
    >
      <img src={photo} className="secondary-post-image" />
      <p className="secondary-post-header" title={data.title}>
        {data.title}
      </p>
    </Link>
  );
};

export default PostCardSecondary;
