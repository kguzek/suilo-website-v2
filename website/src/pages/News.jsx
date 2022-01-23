import React, { useState, useEffect } from 'react'
import { Outlet, useParams, useNavigate } from 'react-router-dom'
import PrimaryPostCard from '../components/PrimaryPostCard'
import SecondaryPostCard from '../components/SecondaryPostCard'
import MainPostCard from '../components/MainPostCard'

const News = ({ setPage }) => {
    const [pageIdx, setPageIdx] = useState(1)
    const [loaded, setLoaded] = useState(false)
    const [previewsData, setPreviewsData] = useState({})
    let params = useParams();

    ///////////////////////////
    const testData = {
        id: `ijsdfb32tew`,
        title: `Adam Sarkowicz: "uczymy do ostatniego żywego ucznia" `,
        text: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
        date: ``,
        photo: ``,
        views: ``,
    };
    ///////////////////////////

    useEffect(() => {
        setPage("news")

        /* 
        ---FETCHING DATA FOR PREVIEWS---

        fetch(`URL${pageIdx}`).then((res)=>{
            SORT IT BY DATE - NEWEST UP ON FRONT
            YOU CAN BREAK IT UP TO 3 DIFFRENT STATES FOR FOLLOWING
            3 FIRST, 4 NEXT, REST(not API ;) )
            setPreviewsData(res) */
        setLoaded(true)
        /*
        })
        */

    }, []);

    const _renderPrimaryPreview = (data) => {
        return data !== undefined ? data.map((el, idx) => <PrimaryPostCard key={`${el.id}${idx}`} postData={el} />) : null
    }
    const _renderSecondaryPreview = (data) => {
        return data !== undefined ? data.map((el, idx) => <SecondaryPostCard key={`${el.id}${idx}`} postData={el} />) : null
    }
    const _renderMainPreview = (data) => {
        return data !== undefined ? data.map((el, idx) => <MainPostCard key={`${el.id}${idx}`} postData={el} />) : null;
    }


    if (params.postID !== undefined) {
        return <Outlet />
    } else if (!loaded) {
        return (
            <div className="page-main" style={{ minHeight: "100vh" }}>
                {/* loading animation */}
            </div>
        );
    }
    else {
        return (
            <div className="page-main" style={{ minHeight: "100vh" }}>
                <p>News - {pageIdx}</p>
                <PrimaryPostCard postData={testData} />
                {_renderPrimaryPreview(/*JSON WITH FIRST 3 ITEMS FROM previewsData*/)}
                {_renderSecondaryPreview(/*JSON WITH NEXT 4 ITEMS FROM previewsData*/)}
                {_renderMainPreview(/*JSON WITH REST OF THE ITEMS FROM previewsData*/)}
            </div>
        );
    }
}



export default News