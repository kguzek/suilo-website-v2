import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';

const SecondaryPostCard = ({ postData }) => {
    const {
        id,
        title,
        text, //NEED TO BE SHORTENED JUST FOR PREVIEW TO NOT DOWNLOADING WHOLE ARTICLE
        date,
        photo,
        views //NEW
    } = postData;

    return (
        <div className="secondary-post-card">
            <img src={photo} className="secondary-post-image" />
            <Link to={`post/${id}`} className="secondary-post-header" title={title}>
                {title}
            </Link>
        </div>
    );
}

export default SecondaryPostCard;