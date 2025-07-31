import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [rol, setRol] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRol = localStorage.getItem('role');
    if (!storedRol) {
      navigate('/role'); // Redirige si no eligió rol
    } else {
      setRol(storedRol);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-darkMist via-[#1a1a2e] to-[#2e1a47] text-moonGray p-10 font-serif">
      {rol === 'master' && (
        <div className="bg-white/5 backdrop-blur-md border border-fadedGold p-8 rounded-xl shadow-xl text-center space-y-4">
          <h1 className="text-3xl text-fadedGold">Welcome, Master!</h1>
          <p>The fate of the mission is in your hands.</p>
        </div>
      )}

      {rol === 'player' && (
        <div className="bg-white/5 backdrop-blur-md border border-gray-500 p-8 rounded-xl shadow-xl text-center space-y-4">
          <h1 className="text-3xl text-gray-200">Welcome, Player!</h1>
          <p>It's all in your mind.</p>
        </div>
      )}
    </div>
  );
}
