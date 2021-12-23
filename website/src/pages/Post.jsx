import React, { useState, useEffect } from 'react'
import { useParams } from "react-router-dom";

const Post = () => {
    let params = useParams();
    return (
        <div>
            <p>Post - {params.postID}</p>
        </div>
    );
}


export default Post