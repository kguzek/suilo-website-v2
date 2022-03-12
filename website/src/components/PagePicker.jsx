import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PageBox = ({ page, activePage, changePage }) => {
  return (
    <div
      className={`${
        page === activePage
          ? "bg-primary drop-shadow-2xl  scale-110 z-10 cursor-default pointer-events-none"
          : "bg-white drop-shadow-3xl hover:bg-aspect"
      } transition-all duration-150 mx-[.175rem] select-none cursor-pointer aspect-square w-[2.1rem] inline-flex rounded-lg `}
      onClick={() => changePage(page)}
    >
      <p
        className={`${
          page !== activePage
            ? "text-primary font-normal hover:text-primaryDark"
            : "text-white font-normal"
        } m-auto text-base `}
      >
        {page}
      </p>
    </div>
  );
};

const PagePicker = ({ noPages, onChange, initialPage = 1 }) => {
  const [page, setPage] = useState(Number(initialPage));
  const navigate = useNavigate();

  useEffect(() => {
    onChange(page);
  }, [page]);

  const _changePage = (noPage) => {
    setPage(noPage);
    if (noPage > 1) {
      navigate(`/aktualnosci?page=${noPage}`);
    } else if (noPage === 1) {
      navigate(`/aktualnosci`);
    }
  };

  return (
    <div className={`inline-flex flex-row w-fit`}>
      {page > 2 && (
        <PageBox changePage={_changePage} page={1} activePage={page} />
      )}
      {page > 1 && page - 1 < noPages && (
        <PageBox changePage={_changePage} page={page - 1} activePage={page} />
      )}
      <PageBox changePage={_changePage} page={page} activePage={page} />
      {page < noPages && (
        <PageBox changePage={_changePage} page={page + 1} activePage={page} />
      )}
      {page === 1 && (
        <PageBox changePage={_changePage} page={page + 2} activePage={page} />
      )}
      {page < noPages - 1 && (
        <PageBox changePage={_changePage} page={noPages} activePage={page} />
      )}
    </div>
  );
};

export default PagePicker;
