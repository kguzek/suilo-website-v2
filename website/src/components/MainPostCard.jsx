import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';

const MainPostCard = ({ postData }) => {
    const {
        id,
        title,
        text,//NEED TO BE SHORTENED JUST FOR PREVIEW TO NOT DOWNLOADING WHOLE ARTICLE
        date,
        photo,
        views //NEW
    } = postData;


    return (
        <div className="main-post-card">
            <p className="main-post-date">{date}</p>
            <img src={photo} className="main-post-image" />
            <h2 className="main-post-header">
                {title}
            </h2>
            <div className="main-description-box">
                <h3 className="main-post-description-p">
                    {text}
                </h3>
                <Link to={`post/${id}`} className="main-post-btn">
                    czytaj dalej
                </Link>
            </div>
        </div>
    );
}

export default MainPostCard;