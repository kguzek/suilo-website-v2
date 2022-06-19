import { useState, useEffect } from "react";
import { X } from "react-feather";
import { fetchWithToken } from "../../firebase";
import { setErrorMessage } from "../../misc";


const Form = ({ isOpen, closeForm, options }) => {
  const [title, setTitle] = useState("");
  const [studentClass, setStudentClass] = useState("1. liceum"); 
  const [quality, setQuality] = useState("nowa");
  const [publisher, setPublisher] = useState("");
  const [subject,setSubject] = useState("polski");
  const [year,setYear] = useState();
  const [level, setLevel]  = useState("rozszerzony");
  const [price, setPrice] = useState();
  const [photo, setPhoto] = useState();
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(e);
    closeForm();
    const params = {
      title: title,
      studentClass: studentClass,
      quality:quality,
      publisher: publisher,
      subject:subject,
      year:year,
      level:level,
      price:price,
      photo:photo  
    }
    fetchWithToken("/books/", "POST", params).then((res) => {
      if (res.ok) {
        //whatever should  be done it it succeds
      } else {
        //whatever should be done it if fails
      }
    });
    //IMPLEMENTSENDING OFFER AND VALIDATING ON SERVER
  };

  if (!isOpen) return null;
  return (
    <div>
      <button onClick={() => closeForm()}>
        <X />
      </button>
      <form onSubmit={handleSubmit} className='flex flex-col'>
        <label className='flex flex-col'>
          Tytuł
          <input placeholder='np. Biologia na czasie 1' type='text' value={title} onChange={(e)=>setTitle(e.target.value)}/>
        </label>
        <label className='flex flex-col'>
          Przedmiot
          <select name='subject' placeholder='Wybierz z listy' value={subject} onChange={(e)=>setSubject(e.target.value)}>
            {options.SUBJECT.map((el) => (
              <option key={el} value={el}>
                {el}
              </option>
            ))}
          </select>
        </label>
        
        <label className='flex flex-col'>
          Wydawca
          <input placeholder='np. Nowa Era' type='text' value={publisher} onChange={(e)=>setPublisher(e.target.value)} />
        </label>
        <label className='flex flex-col'>
          Rok
          <input placeholder='np. 2010' type='number' value={year} onChange={(e)=>setYear(e.target.value)}/>
        </label>
        <label className='flex flex-col'>
          Poziom
          <select name='level' placeholder='Wybierz z listy' value={level} onChange={(e)=>setLevel(e.target.value)}>
            {options.LEVEL.map((el) => (
              <option key={el} value={el}>
                {el}
              </option>
            ))}
          </select>
        </label>
        <label className='flex flex-col'>
          Klasa
          <select name='level' placeholder='Wybierz z listy' value={studentClass} onChange={(e)=>setStudentClass(e.target.value)}>
            {options.CLASS.map((el) => (
              <option key={el} value={el}>
                {el}
              </option>
            ))}
          </select>
        </label>
        <label className='flex flex-col'>
          Jakość
          <select name='quality' placeholder='Wybierz z listy'value={quality} onChange={(e)=>setQuality(e.target.value)}>
            {options.QUALITY.map((el) => (
              <option key={el} value={el}>
                {el}
              </option>
            ))}
          </select>
        </label>
        <label className='flex flex-col'>
          Cena
          <input type='number' value={price} onChange={(e)=>setPrice(e.target.value)}/>
        </label>
        <button type='submit'>Dodaj ogłoszenie</button>
      </form>
    </div>
  );
};

export default Form;
