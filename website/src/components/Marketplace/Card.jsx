import React from 'react';
import { Trash2 } from 'react-feather';

const SUBJECT_IMAGES = {
  polski:
    'https://images.unsplash.com/photo-1588934532857-c85a7bcd63ca?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=627&q=80',
  angielski:
    'https://images.unsplash.com/photo-1549314662-c81dcbec48a8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1476&q=80',
  niemiecki:
    'https://images.unsplash.com/photo-1527866959252-deab85ef7d1b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  hiszpański:
    'https://images.unsplash.com/photo-1561632669-7f55f7975606?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  francuski:
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2073&q=80',
  matematyka:
    'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=735&q=80',
  fizyka:
    'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
  chemia:
    'https://images.unsplash.com/photo-1628863353691-0071c8c1874c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  biologia:
    'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
  geografia:
    'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  historia:
    'https://images.unsplash.com/photo-1461360370896-922624d12aa1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1474&q=80',
  HiT: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  HiS: 'https://images.unsplash.com/photo-1472173148041-00294f0814a2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  WOS: 'https://images.unsplash.com/photo-1491841651911-c44c30c34548?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  informatyka:
    'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  ekonomia:
    'https://images.unsplash.com/photo-1427751840561-9852520f8ce8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1476&q=80',
  TOK: 'https://images.unsplash.com/photo-1614899099690-3bd319d25f99?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
  przedsiębiorczość:
    'https://images.unsplash.com/photo-1604594849809-dfedbc827105?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  kultura:
    'https://images.unsplash.com/flagged/photo-1572392640988-ba48d1a74457?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80',
  inny: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80',
};

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
        src={SUBJECT_IMAGES[offerData.subject] ?? SUBJECT_IMAGES.inny}
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
