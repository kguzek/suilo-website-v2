import { useState, useEffect } from "react";
import { X } from "react-feather";

const Form = ({ isOpen, closeForm, options }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(e);
    closeForm();
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
          <input placeholder='np. Biologia na czasie 1' type='text' />
        </label>
        <label className='flex flex-col'>
          Przedmiot
          <select name='subject' placeholder='Wybierz z listy'>
            {options.SUBJECT.map((el) => (
              <option key={el} value={el}>
                {el}
              </option>
            ))}
          </select>
        </label>
        <label className='flex flex-col'>
          Wydawca
          <input placeholder='np. Nowa Era' type='text' />
        </label>
        <label className='flex flex-col'>
          Rok
          <input placeholder='np. 2010' type='number' />
        </label>
        <label className='flex flex-col'>
          Poziom
          <select name='subject' placeholder='Wybierz z listy'>
            {options.LEVEL.map((el) => (
              <option key={el} value={el}>
                {el}
              </option>
            ))}
          </select>
        </label>
        <label className='flex flex-col'>
          Jakość
          <select name='subject' placeholder='Wybierz z listy'>
            {options.QUALITY.map((el) => (
              <option key={el} value={el}>
                {el}
              </option>
            ))}
          </select>
        </label>
        <label className='flex flex-col'>
          Cena
          <input type='number' />
        </label>
        <label className='flex flex-col'>
          Email
          {/* AUTO FROM USER */}
          <input type='email' />
        </label>
        <button type='submit'>Dodaj ogłoszenie</button>
      </form>
    </div>
  );
};

export default Form;
