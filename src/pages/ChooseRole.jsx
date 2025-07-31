import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ChooseRole() {
  const navigate = useNavigate();

  const selectRole = (role) => {
    localStorage.setItem('role', role);
    navigate('/dashboard'); // o a otra ruta según el rol
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-darkMist via-[#1a1a2e] to-[#2e1a47] text-moonGray font-serif">
      <div className="bg-white/5 backdrop-blur-md p-10 rounded-xl border border-fadedGold shadow-xl text-center space-y-6 w-full max-w-md">
        <h1 className="text-3xl text-fadedGold mb-6">Choose Your Role</h1>

        <button
          onClick={() => selectRole('master')}
          className="w-full bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 text-black py-3 rounded-lg hover:brightness-110 transition font-bold border border-yellow-700 shadow-md"
        >
          I am The Master
        </button>

        <button
          onClick={() => selectRole('player')}
          className="w-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-500 text-white py-3 rounded-lg hover:brightness-110 transition font-bold border border-gray-400 shadow-md"
        >
          I am a player
        </button>
      </div>
    </div>
  );
}
