import { useState, useEffect } from "react";
import { Trash } from "react-feather";
import { fetchWithToken } from "../../firebase";

const Card = ({ offerData,userEmail,userInfo }) => {
  const {
    title,
    user,
    name,
    studentClass,
    email,
    quality,
    publisher,
    subject,
    year,
    photo,
    price,
    level,
    id,
  } = offerData;

  const _handleDelete = () => {
    fetchWithToken("/books/" + id, "DELETE").then((res)=>{
      console.log(res);
    })
  };

  return (
    <div className='w-full'>
      {
        (userEmail === email || userInfo?.isAdmin)&&

        <button onClick={() => _handleDelete()}>
          <Trash />
        </button>


      }
     
      <img
        src={photo}
        className='bg-gray-200/75 object-cover w-full aspect-[16/11] rounded-t-lg'
      />
      <div>
        <p>{title}</p>
        <p>
          {publisher} - {year}
        </p>
        <p>Przedmiot: {subject}</p>
        <p>
          Poziom: {level} - {studentClass}
        </p>
        <p>Stan: {quality}</p>
        <a href={`mailto:${email}`}>{email}</a>
        <div>
          <p>{price}</p>
        </div>
      </div>
    </div>
  );
};

export default Card;
