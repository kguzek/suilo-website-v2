import React, { useEffect } from "react";
import NotFoundGraphic from '../media/notfound.jsx'
import { useLocation } from "react-router-dom";

const NotFound = ({ setPage }) => {
  const path = useLocation().pathname

  useEffect(() => {
    setPage("not_found");
  });

  return (
    <div className="min-h-[87vh] w-11/12 flex flex-col justify-center">
      <div className="w-full sm:w-10/12 md:w-7/12 lg:w-1/3 mx-auto -mt-10">
        <NotFoundGraphic />
      </div>
      <p className="mx-auto text-2xl font-semibold text-text6 text-center mt-4 lg:mt-8">Nie znaleziono zasobu, którego szukasz.</p>
      <p className="mx-auto text-[.9rem] text-center font-normal mt-3 md:mt-1 md:text-base text-text7">Podstrona <code className="bg-text7/25 py-[.2rem] px-[.4rem] rounded-md text-text6">{path}</code> nie istnieje :v</p>
    </div>
  );
};

export default NotFound;
