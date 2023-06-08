import { useState, useEffect } from 'react';
import { X } from 'react-feather';
import { fetchWithToken } from '../../firebase';

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
  WoS: 'https://images.unsplash.com/photo-1491841651911-c44c30c34548?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  informatyka:
    'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  ekonomia:
    'https://images.unsplash.com/photo-1427751840561-9852520f8ce8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1476&q=80',
  ToK: 'https://images.unsplash.com/photo-1614899099690-3bd319d25f99?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
  przedsiębiorczość:
    'https://images.unsplash.com/photo-1604594849809-dfedbc827105?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  kultura:
    'https://images.unsplash.com/flagged/photo-1572392640988-ba48d1a74457?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80',
  inne: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80',
};

const Form = ({ isOpen, closeForm, options, handlePostResponse }) => {
  const [title, setTitle] = useState('');
  const [studentClass, setStudentClass] = useState('1. liceum');
  const [quality, setQuality] = useState('nowa');
  const [publisher, setPublisher] = useState('');
  const [subject, setSubject] = useState('polski');
  const [year, setYear] = useState('');
  const [level, setLevel] = useState('rozszerzony');
  const [price, setPrice] = useState('');
  const [photo, setPhoto] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(e);
    closeForm();
    const params = {
      title: title,
      studentClass: studentClass,
      quality: quality,
      publisher: publisher,
      subject: subject,
      year: year,
      level: level,
      price: price,
      photo: photo,
    };
    fetchWithToken('/books/', 'POST', params).then(handlePostResponse);
  };

  useEffect(() => {
    setPhoto(SUBJECT_IMAGES[subject]);
  }, [subject]);

  if (!isOpen) return null;

  return (
    <div className="fixed flex h-screen w-screen justify-center align-middle inset-0 z-[99999999]">
      <div onClick={() => closeForm()} className="bg-black/20 w-full h-full absolute inset-0" />
      <div className="absolute drop-shadow-2xl bg-white rounded-xl p-5 top-[47.5%] -translate-y-[50%]">
        <div className="flex flex-row justify-end w-full ">
          <button onClick={() => closeForm()} className="pointer">
            <X size={24} className="stroke-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <label className="flex flex-col pt-2 text-text4 text-sm">
            Tytuł
            <input
              required
              className="text-text1 text-base min-w-[300px] bg-gray-100 box-border px-2 py-1 rounded-md"
              placeholder="np. Biologia na czasie 1"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="flex flex-col pt-2 text-text4 text-sm">
            Przedmiot
            <select
              required
              className="text-text1 text-base min-w-[300px] bg-gray-100 box-border px-2 py-1 rounded-md"
              name="subject"
              placeholder="Wybierz przedmiot"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {options.SUBJECT.map((el) => (
                <option key={el} value={el}>
                  {el}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col pt-2 text-text4 text-sm">
            Wydawnictwo
            <select
              required
              className="text-text1 text-base min-w-[300px] bg-gray-100 box-border px-2 py-1 rounded-md"
              name="publisher"
              placeholder="Wybierz wydawnictwo"
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
            >
              {options.PUBLISHER.map((el) => (
                <option key={el} value={el}>
                  {el}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col pt-2 text-text4 text-sm">
            Rok
            <input
              required
              className="text-text1 text-base min-w-[300px] bg-gray-100 box-border px-2 py-1 rounded-md"
              placeholder="np. 2010"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </label>
          <label className="flex flex-col pt-2 text-text4 text-sm">
            Poziom
            <select
              required
              className="text-text1 text-base min-w-[300px] bg-gray-100 box-border px-2 py-1 rounded-md"
              name="level"
              placeholder="Wybierz z listy"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              {options.LEVEL.map((el) => (
                <option key={el} value={el}>
                  {el}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col pt-2 text-text4 text-sm">
            Klasa
            <select
              required
              className="text-text1 text-base min-w-[300px] bg-gray-100 box-border px-2 py-1 rounded-md"
              name="level"
              placeholder="Wybierz z listy"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
            >
              {options.GRADE.map((el) => (
                <option key={el} value={el}>
                  {el}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col pt-2 text-text4 text-sm">
            Jakość
            <select
              required
              className="text-text1 text-base min-w-[300px] bg-gray-100 box-border px-2 py-1 rounded-md"
              name="quality"
              placeholder="Wybierz z listy"
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
            >
              {options.QUALITY.map((el) => (
                <option key={el} value={el}>
                  {el}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col pt-2 text-text4 text-sm">
            Cena
            <input
              required
              className="text-text1 text-base min-w-[300px] bg-gray-100 box-border px-2 py-1 rounded-md"
              type="number"
              placeholder="np. 25"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>
          <button
            type="submit"
            className="bg-primary py-2 rounded-md text-white mt-4 hover:bg-primaryDark transition-all duration-100"
          >
            Dodaj ogłoszenie
          </button>
        </form>
      </div>
    </div>
  );
};

export default Form;
