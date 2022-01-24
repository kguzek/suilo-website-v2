import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MetaTags from 'react-meta-tags';
import MainPostCard from '../components/MainPostCard';
import SecondaryPostCard from '../components/SecondaryPostCard';

const testDataMain = [
    {
        id: `ijsdfb32tew`,
        title: `Adam Sarkowicz: "uczymy do ostatniego żywego ucznia" `,
        textShort: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
        content: `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. `,
        date: new Date(),
        photo: `https://www.sportslaski.pl/static/thumbnail/article/med/13452.jpg`,
        views: `2137`,
        alt: "",
        postAuthor: "Mikołaj Mrózek",
        imageAuthor: "Mikołaj Mrózek",
    },
    {
        id: `sdf89ub8743`,
        title: `SpeedDating edycja 2022 - informacje`,
        textShort: `Nowa edycja SpeedDating'u już przednami, w tym poście znajdziecie wszystkie przydatne informacje dotyczące tegorocznej edycji wydarzenia.`,
        date: new Date(),
        photo: `https://images.unsplash.com/photo-1544911845-1f34a3eb46b1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
        views: `4326`
    },
    {
        id: `534879bjifsd`,
        title: `PiS znowu atakuje polską edukację `,
        textShort: `Co tu dużo mówić, w końcu żyjemy w Polsce.. Niemniej tutaj mamy dla was krótkie podsumownie aktualnych informacji dotyczących LexCzarnek i idiotyzmów polskiego obozu rządzącego. `,
        date: new Date(),
        photo: `https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
        views: `42069`
    },
    {
        id: `432fsdsdffd`,
        title: `Fotorelacja z wycieczki do babiogórskiego parku narodowego`,
        textShort: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
        date: new Date(),
        photo: `https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
        views: `2137`
    },
]

const Post = ({ setPage }) => {
    const [loaded, setLoaded] = useState(false)
    const [currentPostData, setCurrentPostData] = useState({})

    let newDate = testDataMain[0].date.toLocaleDateString("pl-PL", { year: 'numeric', month: 'short', day: 'numeric' })

    let params = useParams();
    let navigate = useNavigate();

    useEffect(() => {
        setPage("news")
    }, [])

    const _renderMainPreview = (data) => {
        return data !== undefined ? data.map((el, idx) => <MainPostCard key={`${el.id}${idx}`} postData={el} />) : null;
    }
    const _renderSecondaryPreview = (data) => {
        return data !== undefined ? data.map((el, idx) => <div style={{ marginBottom: "1.5em" }}><SecondaryPostCard key={`${el.id}${idx}`} postData={el} /></div>) : null
    }

    if (params.postID === undefined) {
        navigate("/aktualnosci");
        return null;
    } else if (!loaded) {
        /*
           FETCH POST DATA FROM API AND SAVE IT TO 
           AS STATE AND CHANGE STATE TO LOADED

           fetch(`URL${params.postID}`).then((res)=>{
               setCurrentPostData(res); */
        setLoaded(true);
        //    });

        return null; // LOADING SCREEN //
    } else {
        return (
            <div className="page-main">
                <MetaTags>
                    <title>{testDataMain[0].title}</title>
                    <meta name="description" content={testDataMain[0].textShort} />
                    <meta property="og:title" content={testDataMain[0].title} />
                    <meta property="og:image" content="" /> {/* IMAGE TO BE ADDED */}
                </MetaTags>
                <div className="post-division">
                    <article>
                        <img className="post-image" src={testDataMain[0].photo} alt={testDataMain[0].alt} />
                        <p className="image-author">Zdjęcie: {testDataMain[0].imageAuthor}</p>
                        <p className="post-info"><span style={{ fontWeight: "500" }}>{newDate}</span>&nbsp;&nbsp;·&nbsp;&nbsp;{testDataMain[0].views} wyświetleń</p>
                        <h1 className="article-title">
                            {testDataMain[0].title}
                        </h1>
                        <p className="article-content">
                            {testDataMain[0].content}
                        </p>
                    </article>
                    <div className="post-sidebar">
                        {_renderSecondaryPreview(/*JSON WITH NEXT 4 ITEMS FROM previewsData*/testDataMain)}

                    </div>
                </div>
                <div className="main-grid">
                    {_renderMainPreview(/*JSON WITH REST OF THE ITEMS FROM previewsData*/testDataMain)}
                </div>
            </div>
        );
    }

}


export default Post