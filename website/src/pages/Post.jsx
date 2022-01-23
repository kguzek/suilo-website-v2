import React, { useState, useEffect } from 'react'
import { Outlet, useParams, useNavigate } from 'react-router-dom'

const Post = ({ setPage }) => {

    let params = useParams();
    let navigate = useNavigate();

    useEffect(() => {
        setPage("news")
    }, [])

    if (params.postID === undefined) {
        navigate("/aktualnosci");
        return null;
    } else {
        return (
            <div className="page-main">
                <p>Post - {params.postID}</p>
            </div>
        );
    }

}


export default Post