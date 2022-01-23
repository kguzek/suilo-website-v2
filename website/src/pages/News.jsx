import React, { useState, useEffect } from 'react'
import { Outlet, useParams, useNavigate } from 'react-router-dom'
import NewsCardComplex from '../components/NewsCardComplex'
import NewsCardSimple from '../components/NewsCardSimple'

const News = ({ setPage }) => {
    const [pageIdx, setPageIdx] = useState(1)

    useEffect(() => {
        setPage("news")
    }, []);


    let params = useParams();
    // let navigate = useNavigate();
    // if (pageIdx === null) {
    //     let tmp = params.pageIdx === undefined ? 1 : params.pageIdx;
    //     setPageIdx(tmp)
    //     navigate("/aktualnosci1");
    //     return null;
    // } else {
    if (params.postID !== undefined) {
        return <Outlet />
    } else {
        return (
            <div>
                <p>News - {pageIdx}</p>
            </div>
        );
    }
}



export default News