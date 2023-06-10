import React from 'react';
import { Trash2 } from 'react-feather';

const Card = ({ offerData, userEmail, userInfo, setPopupDelete, setDeletedBookID }) => (
  <div className="w-full drop-shadow-6xl relative bg-white h-auto flex flex-col justify-between rounded-lg">
    {(userEmail === offerData.email || userInfo?.isAdmin) && (
      <button
        onClick={() => {
          setPopupDelete(true);
          setDeletedBookID(offerData.id);
        }}
        className="absolute top-2 left-2 bg-black/20 p-[.3rem] rounded-lg"
      >
        <Trash2 size={22} color="white" />
      </button>
    )}
    <div>
      <img
        src={offerData.photo}
        alt={offerData.title}
        className="bg-gray-200/75 object-cover w-full aspect-[11/6] rounded-t-lg"
        loading="lazy"
      />
      <div className="px-3 pt-3">
        <div>
          <p
            className="text-text1 leading-6 font-medium text-xl tracking-tight mb-2 overflow-hidden whitespace-nowrap"
            style={{ textOverflow: 'ellipsis' }}
            title={offerData.title}
          >
            {offerData.title}
          </p>
          <p className="text-text4 text-sm -mt-[.15rem] pb-1">
            {offerData.publisher} - {offerData.year}
          </p>
          <p className="text-text4 text-sm">
            Przedmiot: <span className="text-text2 text-base">{offerData.subject}</span>
          </p>
          <p className="text-text4 text-sm">
            Poziom:{' '}
            <span className="text-text2 text-base">
              {offerData.level} - {offerData.studentClass}
            </span>
          </p>
          <p className="text-text4 text-sm">
            Stan: <span className="text-text2 text-base">{offerData.quality}</span>
          </p>
          <a href={`mailto:${offerData.email}`} className="">
            {offerData.email}
          </a>
        </div>
      </div>
    </div>

    <div className="w-full flex flex-row justify-end pt-1">
      <p className="pr-4 pb-3 text-primary font-semibold text-2xl">{offerData.price} zł</p>
    </div>
  </div>
);

export default Card;
