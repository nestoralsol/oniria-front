import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toOptions } from '../utils/catalogToOptions';


export default function CrearAvatar() {
  const [name, setName] = useState('');
  const [biology, setBiology] = useState('humano');
  const [color, setColor] = useState('#6b21a8');
  const [job, setJob] = useState('Doctor');
  const navigate = useNavigate();

  const [dadoBiology, setDadoBiology] = useState(null);

  const tirarDado = () => Math.floor(Math.random() * 6) + 1;

  const handleSubmit = (e) => {
    e.preventDefault();
    const avatar = { name, biology, color, job , dado:{biology:dadoBiology},


    };
    localStorage.setItem('avatar', JSON.stringify(avatar));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-darkMist via-[#1a1a2e] to-[#2e1a47] text-moonGray p-10 font-serif flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white/5 backdrop-blur-md border border-fadedGold p-8 rounded-xl shadow-xl w-full max-w-md space-y-4"
      >
        <h1 className="text-3xl text-fadedGold text-center mb-4">Biography</h1>
        <div>
        <input
          type="text"
          placeholder="Avatar Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-3 rounded-lg border border-fadedGold bg-black/30 placeholder-gray-400 text-moonGray"
        />
        </div>

       <div className="flex items-center gap-2">
  <select
    value={biology}
    onChange={(e) => setBiology(e.target.value)}
    className="flex-1 p-3 rounded-lg border border-fadedGold bg-black/30 text-moonGray"
  >
    <option value="humano">Humano</option>
    <option value="elfo">Elfo</option>
    <option value="golem">Gólem</option>
    <option value="sombra">Criatura de sombra</option>
  </select>

  <button
    type="button"
    onClick={() => setDadoBiology(tirarDado())}
    className="text-sm text-indigo-300 underline whitespace-nowrap"
  >
    🎲
  </button>

  {dadoBiology && (
    <span className="text-sm text-moonGray whitespace-nowrap">Dado: {dadoBiology}</span>
  )}
</div>
        <label className="block text-sm mt-2">Color</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full h-10 rounded-lg border border-fadedGold"
        />

        <label className="block text-sm mt-2">Job</label>
        <div className="flex justify-between space-x-2">
          {['Informatic', 'Busman', 'Fireman', 'Doctor'].map((el) => (
            <button
              type="button"
              key={el}
              onClick={() => setJob(el)}
               className={`flex-1 py-2 rounded-lg border text-white font-bold ${
      job === el ? 'bg-arcanePurple' : 'bg-black/30'
    }`}
  >
    {el}
            </button>
          ))}
        </div>

        <div className="mt-4 text-center">
          <p className="mb-2 text-sm">Preview:</p>
          <div
            className="w-20 h-20 rounded-full mx-auto border-4"
            style={{ backgroundColor: color }}
          ></div>
          <p className="mt-2 text-xs italic">{biology} of job {job}</p>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-arcanePurple via-purple-700 to-indigo-800 text-white py-2 rounded-lg hover:brightness-110 transition font-serif shadow-md border border-purple-500 mt-4"
        >
          Invoke your Avatar
        </button>
      </form>
    </div>
  );
}
