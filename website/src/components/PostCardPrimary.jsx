import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "react-feather";
import { getURLfromFileName } from "../misc";

const PostCardPrimary = ({ data }) => {
  const textShort = data.text;
  const [photo, setphoto] = useState(data.photo);

  useEffect(() => {
    getURLfromFileName(data.photo, "800x600", setphoto)
  }, []);
  //group-hover:ring-[.2rem] ring-primaryDark/30 transition-all duration-300
  return (
    <article className="w-full group ">
      <img src={photo} className="w-full object-cover rounded-xl sm:rounded-2xl md:rounded-xl lg:rounded-2xl aspect-[16/10] drop-shadow-6xl" />
      <h2 className="text-text1 my-2 mt-3 md:mt-2 max-w-full line-clamp-2 tracking-wide font-semibold text-xl sm:text-2xl md:text-xl lg:text-[1.6rem] leading-6 md:leading-6 lg:leading-8" title={data.title}>
        {data.title}
      </h2>
      <div className="relative">
        <h3 className="line-clamp-3 tracking-[0.012rem] max-w-full font-normal text-sm lg:text-[.95rem] text-text6 leading-5 lg:leading-[1.65rem]" title={textShort}>
          {textShort}
        </h3>
        <div className="absolute -bottom-[.175rem] lg:bottom-[.05rem] right-0 py-[.1rem] px-1 pl-8"
          style={{ background: "linear-gradient(90deg,transparent 0%,#F8F8F8 15%)" }}
        >
          <Link
            to={data.link}
            className="inline-flex flex-row justify-between align-middle transition-all duration-150 group"
          >
            <p className="group-hover:text-primaryDark pr-1 text-primary font-medium text-[.95rem]">czytaj dalej</p>
            <ArrowRight
              size={16}
              className="group-hover:stroke-primaryDark stroke-primary stroke-[2.5] mt-[.15rem]"
            />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PostCardPrimary;
