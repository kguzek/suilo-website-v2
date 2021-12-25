import React, { useState, useEffect } from 'react'
import { Outlet, useParams } from 'react-router-dom'

const News = ({ setPage }) => {

    useEffect(() => {
        setPage("news")
    }, [])

    let params = useParams();
    if (params.postID !== undefined) {
        return <Outlet />
    } else {
        return (
            <div>
                <p>News</p>
            </div>
        );
    }
}


export default News