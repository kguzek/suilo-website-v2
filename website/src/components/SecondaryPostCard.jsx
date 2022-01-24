import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';

const SecondaryPostCard = ({ postData }) => {
    const {
        id,
        title,
        textShort, //NEED TO BE SHORTENED JUST FOR PREVIEW TO NOT DOWNLOADING WHOLE ARTICLE
        date,
        photo,
        views //NEW
    } = postData;

    return (
        <Link to={`post/${id}`} className="secondary-post-card" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <img src={photo} className="secondary-post-image" />
            <p className="secondary-post-header" title={title}> {title}</p>
        </Link>
    );
}

export default SecondaryPostCard;