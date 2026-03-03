import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ChooseRole() {
  const navigate = useNavigate();

  useEffect(() => {
    // Si no hay token, vuelve a login
    const token = localStorage.getItem('token');
    if (!token) navigate('/');
  }, [navigate]);

  const selectRole = (role) => {
  localStorage.setItem('role', role);

  if (role === 'player') {
    navigate('/avatar/crear');
    return;
  }

  if (role === 'master') {
    navigate('/master/crear-partida');
    return;
  }

  // fallback 
  navigate('/dashboard');
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-darkMist via-[#1a1a2e] to-[#2e1a47] text-moonGray font-serif">
      <div className="bg-white/5 backdrop-blur-md p-10 rounded-xl border border-fadedGold shadow-xl text-center space-y-6 w-full max-w-md">
        <h1 className="text-3xl text-fadedGold mb-2">Elige tu rol</h1>
        <p className="text-sm text-gray-300">Esto define tu experiencia en la partida.</p>

        <button
          onClick={() => selectRole('master')}
          className="w-full bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 text-black py-3 rounded-lg hover:brightness-110 transition font-bold border border-yellow-700 shadow-md"
        >
          Soy el Maestro
        </button>

        <button
          onClick={() => selectRole('player')}
          className="w-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 text-white py-3 rounded-lg hover:brightness-110 transition font-bold border border-gray-500 shadow-md"
        >
          Soy Jugador
        </button>
      </div>
    </div>
  );
}
