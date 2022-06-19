import { useState, useEffect } from "react";
import { Trash } from "react-feather";

const Card = ({ offerData }) => {
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
  } = offerData;

  const _handleDelete = () => {
    // IMPLEMENT DELETING HERE
  };

  return (
    <div className='w-full'>
      <button onClick={() => _handleDelete()}>
        <Trash />
      </button>
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
