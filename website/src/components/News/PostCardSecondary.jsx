import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DEFAULT_IMAGE, getDataFromFilename } from "../../misc";

const PostCardSecondary = ({ data }) => {
  const [photo, setPhoto] = useState(DEFAULT_IMAGE);

  useEffect(() => {
    getDataFromFilename(data.photo, "600x400", setPhoto);
  }, []);

  return (
    <Link to={data.internalLink} className="flex w-full relative flex-col group">
      <img
        src={photo}
        className="bg-gray-200/75 object-cover w-full aspect-[16/10] rounded-xl group-hover:ring-[.2rem] ring-primaryDark/40 transition-all duration-300"
        loading="lazy"
      />
      <p
        className="line-clamp-2 text-text1 font-semibold max-w-full text-[1.05rem] pt-1 leading-5 sm:text-lg -tracking-[.01rem] sm:leading-6 md:text-[1.05rem] md:leading-5 lg:text-lg lg:leading-6"
        title={data.title}
      >
        {data.title}
      </p>
    </Link>
  );
};

export default PostCardSecondary;
