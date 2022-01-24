import React, { useState, useEffect } from 'react'
import { Outlet, useParams, useNavigate } from 'react-router-dom'
import PrimaryPostCard from '../components/PrimaryPostCard'
import SecondaryPostCard from '../components/SecondaryPostCard'
import MainPostCard from '../components/MainPostCard'
import MetaTags from 'react-meta-tags';

///////////////////////////
const testDataPrimary = [
    {
        id: `ijsdfb32tew`,
        title: `Adam Sarkowicz: "uczymy do ostatniego żywego ucznia" `,
        text: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
        date: new Date(),
        photo: `https://www.sportslaski.pl/static/thumbnail/article/med/13452.jpg`,
        views: `2137`
    },
    {
        id: `sdf89ub8743`,
        title: `SpeedDating edycja 2022 - informacje`,
        text: `Nowa edycja SpeedDating'u już przednami, w tym poście znajdziecie wszystkie przydatne informacje dotyczące tegorocznej edycji wydarzenia.`,
        date: new Date(),
        photo: `https://images.unsplash.com/photo-1544911845-1f34a3eb46b1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
        views: `4326`
    },
    {
        id: `534879bjifsd`,
        title: `PiS znowu atakuje polską edukację `,
        text: `Co tu dużo mówić, w końcu żyjemy w Polsce.. Niemniej tutaj mamy dla was krótkie podsumownie aktualnych informacji dotyczących LexCzarnek i idiotyzmów polskiego obozu rządzącego. `,
        date: new Date(),
        photo: `https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
        views: `42069`
    },
];
const testDataSecondary = [
    {
        id: `432fsdsdffd`,
        title: `Fotorelacja z wycieczki do babiogórskiego parku narodowego`,
        text: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
        date: new Date(),
        photo: `https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
        views: `2137`
    },
    {
        id: `5349769fgdgfd`,
        title: `Teorie spiskowe odnośnie p. Dziedzica [ZOBACZ ZDJĘCIA]`,
        text: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
        date: new Date(),
        photo: `https://images.unsplash.com/photo-1470145318698-cb03732f5ddf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80`,
        views: `2137`
    },
    {
        id: `ijsfdsfdfsd32`,
        title: `Kalendarz maturalny 2022`,
        text: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
        date: new Date(),
        photo: `https://images.unsplash.com/photo-1506784365847-bbad939e9335?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1168&q=80`,
        views: `4324`
    },
    {
        id: `34243423tew`,
        title: `Nowe obostrzenia na terenie szkoły`,
        text: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
        date: new Date(),
        photo: `https://images.unsplash.com/photo-1584744982491-665216d95f8b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
        views: `2137`
    }
];
const testDataMain = [
    {
        id: `ijsdfb32tew`,
        title: `Adam Sarkowicz: "uczymy do ostatniego żywego ucznia" `,
        text: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
        date: new Date(),
        photo: `https://www.sportslaski.pl/static/thumbnail/article/med/13452.jpg`,
        views: `2137`
    },
    {
        id: `sdf89ub8743`,
        title: `SpeedDating edycja 2022 - informacje`,
        text: `Nowa edycja SpeedDating'u już przednami, w tym poście znajdziecie wszystkie przydatne informacje dotyczące tegorocznej edycji wydarzenia.`,
        date: new Date(),
        photo: `https://images.unsplash.com/photo-1544911845-1f34a3eb46b1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
        views: `4326`
    },
    {
        id: `534879bjifsd`,
        title: `PiS znowu atakuje polską edukację `,
        text: `Co tu dużo mówić, w końcu żyjemy w Polsce.. Niemniej tutaj mamy dla was krótkie podsumownie aktualnych informacji dotyczących LexCzarnek i idiotyzmów polskiego obozu rządzącego. `,
        date: new Date(),
        photo: `https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
        views: `42069`
    },
    {
        id: `432fsdsdffd`,
        title: `Fotorelacja z wycieczki do babiogórskiego parku narodowego`,
        text: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
        date: new Date(),
        photo: `https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
        views: `2137`
    },
    {
        id: `5349769fgdgfd`,
        title: `Teorie spiskowe odnośnie p. Dziedzica [ZOBACZ ZDJĘCIA]`,
        text: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
        date: new Date(),
        photo: `https://images.unsplash.com/photo-1470145318698-cb03732f5ddf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80`,
        views: `2137`
    },
    {
        id: `ijsfdsfdfsd32`,
        title: `Kalendarz maturalny 2022`,
        text: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
        date: new Date(),
        photo: `https://images.unsplash.com/photo-1506784365847-bbad939e9335?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1168&q=80`,
        views: `4324`
    },
    {
        id: `34243423tew`,
        title: `Nowe obostrzenia na terenie szkoły`,
        text: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
        date: new Date(),
        photo: `https://images.unsplash.com/photo-1584744982491-665216d95f8b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
        views: `2137`
    }
];
///////////////////////////

const News = ({ setPage }) => {
    const [pageIdx, setPageIdx] = useState(1)
    const [loaded, setLoaded] = useState(false)
    const [previewsData, setPreviewsData] = useState({})
    let params = useParams();

    useEffect(() => {
        setPage("news")
        /* 
        ---FETCHING DATA FOR PREVIEWS---

        fetch(`URL${pageIdx}`).then((res)=>{
            SORT IT BY DATE - NEWEST UP ON FRONT
            YOU CAN BREAK IT INTO TO 3 DIFFRENT STATES FOR FOLLOWING
            3 FIRST, 4 NEXT, REST(not API ;) )
            setPreviewsData(res) */
        setLoaded(true)
        /*
        })
        */

    }, []);


    useEffect(() => {
        /* 
        ---FETCHING DATA FOR PREVIEWS !ON PAGE CHANGE!---

        fetch(`URL${pageIdx}`).then((res)=>{
            SORT IT BY DATE - NEWEST UP ON FRONT
            WITHOUT BREAKING INTO SUBCATEGORIES
            setPreviewsData(res) */
        setLoaded(true)
        /*
        })
        */

    }, [pageIdx]);

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
                <MetaTags>
                    <title>Aktualności | Samorząd Uczniowski 1 Liceum Ogólnokształcącego w Gliwicach</title>
                    <meta name="description" content="Aktualności z życia Samorządu Uczniowskiego, oraz 1 Liceum Ogólnokształącego w Gliwicach." />
                    <meta property="og:title" content="Aktualności | SUILO Gliwice" />
                    <meta property="og:image" content="" /> {/* IMAGE TO BE ADDED */}
                </MetaTags>
                <div className="primary-grid">
                    {_renderPrimaryPreview(/*JSON WITH FIRST 3 ITEMS FROM previewsData*/testDataPrimary)}
                </div>
                <div className="secondary-grid">
                    {_renderSecondaryPreview(/*JSON WITH NEXT 4 ITEMS FROM previewsData*/testDataSecondary)}
                </div>
                <div className="main-grid">
                    {_renderMainPreview(/*JSON WITH REST OF THE ITEMS FROM previewsData*/testDataMain)}
                </div>
            </div>
        );
    }
}



export default News