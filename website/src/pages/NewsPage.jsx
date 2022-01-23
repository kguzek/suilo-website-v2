import React, { useState, useEffect } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import NewsCardComplex from '../components/NewsCardComplex'
import NewsCardSimple from '../components/NewsCardSimple'

const NewsPage = () => {
    const [pageIdx, setPageIdx] = useState(null)
    let params = useParams();
    return (
        <div>
            <p>News - {pageIdx}</p>
        </div>
    );
}

export default NewsPage;