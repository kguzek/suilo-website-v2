import React, { useState, useEffect } from 'react'
import { useParams } from "react-router-dom";

const Post = () => {
    let params = useParams();
    return (
        <main>
            <p>Post {params.postID}</p>
        </main>
    );
}


export default Post