import { useState } from 'react';
import { X } from 'react-feather';
import { fetchWithToken } from '../../firebase';

const Form = ({ isOpen, closeForm, options, handlePostResponse }) => {
  const [title, setTitle] = useState('');
  const [studentClass, setStudentClass] = useState(options.GRADE[0]);
  const [quality, setQuality] = useState(options.QUALITY[0]);
  const [publisher, setPublisher] = useState(options.PUBLISHER[0]);
  const [subject, setSubject] = useState(options.SUBJECT[0]);
  const [year, setYear] = useState('');
  const [level, setLevel] = useState(options.LEVEL[0]);
  const [price, setPrice] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(e);
    closeForm();
    const params = {
      title,
      studentClass,
      quality,
      publisher,
      subject,
      year,
      level,
      price,
    };
    fetchWithToken('/books/', 'POST', params).then(handlePostResponse);
  };

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
            Stan
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
            Cena (zł)
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
