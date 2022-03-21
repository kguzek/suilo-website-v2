import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "react-feather";
import { DEFAULT_IMAGE, formatDate, getDataFromFilename } from "../../misc";

const PostCardMain = ({ data }) => {
  const [photo, setPhoto] = useState(DEFAULT_IMAGE);
  const date = formatDate(data.date);
  // const modified = formatDate(data.modified);

  useEffect(() => {
    getDataFromFilename(data.photo, "400x300", setPhoto);
  }, []);

  //group-hover:ring-[.2rem] ring-primaryDark/30 transition-all duration-300
  return (
    <article
      className="group w-full inline-flex flex-row align-top relative justify-start"
    >
      {/* {data.modified && (
        <i className="main-post-date">Ostatnia edycja — {modified}</i>
      )} */}
      <p className="absolute -top-[1.15rem] lg:-top-[1.4rem]  left-0 font-normal text-text7 text-xs md:text-sm">
        {date}
      </p>
      <img
        src={photo}
        loading="lazy"
        className="bg-gray-200/75 w-1/5 object-cover aspect-square rounded-lg lg:rounded-xl"
      />
      <div className="w-full pl-4 flex flex-col justify-start relative">
        <Link to={data.internalLink}>
          <h2 className="text-text1 tracking-[.015rem] max-w-full font-semibold text-lg lg:text-xl lg:leading-6 line-clamp-2 leading-5">
            {data.title}
          </h2>
        </Link>
        <div className="relative -mt-1">
          <h3 className="hidden line-clamp-1 sm:line-clamp-2 md:line-clamp-1 lg:line-clap-3 main-post-description sm:block md:hidden lg:block">
            {data.rawContent}
          </h3>
          <div
            className="absolute -bottom-[.1rem] lg:bottom-[.025rem] right-0 py-[.1rem] px-1 pl-8"
            style={{
              background: "linear-gradient(90deg, rgba(248,248,248,0) 0%, rgba(248,248,248,1) 15%)",
              // backgroundColor: "#F8F8F8",
            }}
          >
            <Link
              to={data.internalLink}
              className="inline-flex group flex-row justify-between align-middle transition-all duration-150 group"
            >
              <p className="group-hover:text-primaryDark pr-1 text-primary font-medium text-sm lg:text-[.925rem]">
                czytaj dalej
              </p>
              <ArrowRight
                size={16}
                className="group-hover:stroke-primaryDark stroke-primary stroke-[2.5] mt-[.1rem] lg:mt-[.13rem]"
              />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCardMain;
