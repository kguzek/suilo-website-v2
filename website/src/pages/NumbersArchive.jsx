import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import PageSelector from "../components/PageSelector";
import { formatDate, fetchCachedData, removeSearchParam } from "../misc";

const NumbersArchive = ({ setPage, reload, setReload, collectionInfo }) => {
  const [archive, setArchive] = useState();
  const [loadedArchive, setLoadedArchive] = useState(null);
  const [archivePage, setArchivePage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();

  /** Fetch the data from cache or the API. */
  function fetchArchive(forceUpdate = false, pageNo) {
    setLoadedArchive(false);
    const page = pageNo ?? archivePage;
    const cacheName = `luckyNumbers_archive_page_${page}`;
    const fetchArgs = {
      setData: setArchive,
      setLoaded: setLoadedArchive,
      updateCache: forceUpdate,
      params: { page, sort: "descending" },
    };
    fetchCachedData(cacheName, "/luckyNumbers/archive", fetchArgs);
  }

  useEffect(() => {
    const pageNo = searchParams.get("page") || 1;
    setArchivePage(pageNo);
    setPage("archive");
    setLoadedArchive(false);
    const updateCache = !!removeSearchParam(
      searchParams,
      setSearchParams,
      "refresh"
    );
    fetchArchive(updateCache, pageNo);
  }, [searchParams]);

  useEffect(() => {
    if (!reload) return;
    setReload(false);
    fetchArchive();
  }, [reload]);

  function _generateArchiveRow() {
    return archive?.contents?.map((entry) => (
      <tr
        className="even:bg-primary/5 odd:bg-primaryDark/[.15]"
        key={entry.date}
      >
        <td className="py-1 pl-4">{formatDate(entry.date)}</td>
        <td className="py-1">{entry.luckyNumbers.join(", ")}</td>
      </tr>
    ));
  }

  if (!loadedArchive) return <LoadingScreen />;

  return (
    <div className="flex flex-col justify-center align-top">
      <div className="w-11/12 min-h-[82vh] mt-6 justify-center">
        <table className="border-collapse table-auto w-64 md:w-[32rem] mx-auto ">
          <thead>
            <tr>
              <th className="text-left pl-4">Data</th>
              <th className="text-left">Numerki</th>
            </tr>
          </thead>
          <tbody>{_generateArchiveRow()}</tbody>
        </table>
      </div>
      <div className="m-auto my-2">
        <PageSelector
          page={archivePage}
          noPages={Math.ceil(collectionInfo.numDocs / 25)}
          onChange={setArchivePage}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
        />
      </div>
    </div>
  );
};
export default NumbersArchive;
