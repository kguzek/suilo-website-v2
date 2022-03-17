import React, { useState, useEffect } from 'react'
import { formatDate, fetchCachedData } from '../misc'

const TEST_DATA = [
    { date: "2022-03-12", numbers: ["32", "2"] },
    { date: "2022-03-11", numbers: ["12", "31"] },
    { date: "2022-03-10", numbers: ["13", "14"] },
    { date: "2022-03-09", numbers: ["36", "25"] },
    { date: "2022-03-08", numbers: ["27", "13"] },
]

const ArchiveLN = ({ setPage }) => {
    const [archive, setArchive] = useState();
    const [loadedArchive, setLoadedArchive] = useState()

    const fetchLuckyNumbers = (forceUpdate = false) => {
        setLoadedArchive(false);
        const fetchArgs = {
            setData: setArchive,
            setLoaded: setLoadedArchive,
            updateCache: forceUpdate,
        };
        fetchCachedData("archivedNumbers", "/luckyNumbers/archive", fetchArgs);
    }

    useEffect(() => {
        if (!loadedArchive) return;
        fetchLuckyNumbers(true);
    }, [loadedArchive]);

    useEffect(() => {
        fetchLuckyNumbers()
        setPage("archive")
    }, [])

    const _generateArchiveRow = (data) => {
        return data?.map((el, i) =>
            <tr className="even:bg-primary/5 odd:bg-primaryDark/[.15]" key={el.date}>
                <td className="py-1 pl-4">{formatDate(el.date)}</td>
                <td className="py-1">{el.numbers[0]},&nbsp;{el.numbers[1]}</td>
            </tr>
        )
    }

    return (
        <div className="w-11/12 min-h-[82vh] mt-6 justify-center">
            <table className="border-collapse table-auto w-64 md:w-[32rem] mx-auto ">
                <thead>
                    <tr>
                        <th className="text-left pl-4">
                            Data
                        </th>
                        <th className="text-left">
                            Numerki
                        </th>
                    </tr>
                </thead>
                <tbody className="">
                    {_generateArchiveRow(TEST_DATA)}
                </tbody>
            </table>
        </div>
    )
}
export default ArchiveLN