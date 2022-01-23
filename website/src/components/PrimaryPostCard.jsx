import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';

const PrimaryPostCard = ({ postData }) => {
    const {
        id,
        title,
        text,//NEED TO BE SHORTENED JUST FOR PREVIEW TO NOT DOWNLOADING WHOLE ARTICLE
        date,
        photo,
        views //NEW
    } = postData;


    return (
        <div className="primary-post-card">
            <img src={photo} className="primary-post-image" />
            <h2 className="primary-post-header">
                {title}
            </h2>
            <div className="primary-description-box">
                <h3 className="primary-post-description-p">
                    {text}
                </h3>
                <Link to={`post/${id}`} className="primary-post-btn">
                    czytaj dalej
                </Link>
            </div>
        </div>
    );
}

export default PrimaryPostCard;