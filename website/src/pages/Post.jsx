import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MetaTags from 'react-meta-tags';

const Post = ({ setPage }) => {
    const [loaded, setLoaded] = useState(false)
    const [currentPostData, setCurrentPostData] = useState({})

    let params = useParams();
    let navigate = useNavigate();

    useEffect(() => {
        setPage("news")
    }, [])

    if (params.postID === undefined) {
        navigate("/aktualnosci");
        return null;
    } else if (!loaded) {
        /*
           FETCH POST DATA FROM API AND SAVE IT TO 
           AS STATE AND CHANGE STATE TO LOADED

           fetch(`URL${params.postID}`).then((res)=>{
               setCurrentPostData(res);
               setLoaded(true);
           });
       */
        return null; // LOADING SCREEN //
    } else {
        return (
            <div className="page-main">

            </div>
        );
    }

}


export default Post