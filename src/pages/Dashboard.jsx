import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const storedRole = localStorage.getItem('role');
    if (!storedRole) {
      navigate('/role');
      return;
    }

    setRole(storedRole);
  }, [navigate]);

  const avatar = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('avatar') || 'null');
    } catch {
      return null;
    }
  }, []);

  if (!role) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-darkMist via-[#1a1a2e] to-[#2e1a47] text-moonGray p-10 font-serif">
      {role === 'master' && (
        <div className="bg-white/5 backdrop-blur-md border border-fadedGold p-8 rounded-xl shadow-xl text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-3xl text-fadedGold">Bienvenido, Maestro</h1>
          <p>Tu mesa aguarda. Prepara el sueño…</p>
        </div>
      )}

      {role === 'player' && (
        <div className="bg-white/5 backdrop-blur-md border border-gray-500 p-8 rounded-xl shadow-xl text-center space-y-5 max-w-2xl mx-auto">
          <h1 className="text-3xl text-gray-200">Bienvenido, Jugador</h1>

          {avatar ? (
            <div className="space-y-3">
              <h2 className="text-xl text-fadedGold">Tu Avatar</h2>

              <div className="mx-auto w-24 h-24 rounded-full border-4 border-fadedGold bg-black/30 flex items-center justify-center text-2xl">
                <span>{avatar?.emblema || '☽'}</span>
              </div>

              <p className="text-lg font-semibold">{avatar?.name || 'Sin nombre'}</p>

              <p className="text-sm italic opacity-90">
                {[
                  avatar?.temperament_key,
                  avatar?.philosophy_key,
                  avatar?.dream_phase_key,
                ].filter(Boolean).join(' • ')}
              </p>

              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={() => navigate('/avatar/crear')}
                  className="bg-gradient-to-r from-arcanePurple via-purple-700 to-indigo-800 text-white py-2 px-5 rounded-lg border border-purple-500 hover:brightness-110"
                >
                  Editar avatar
                </button>

                <button
                  onClick={() => {
                    localStorage.removeItem('avatar');
                    window.location.reload();
                  }}
                  className="bg-black/30 text-moonGray py-2 px-5 rounded-lg border border-gray-400 hover:brightness-110"
                >
                  Borrar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p>Aún no has creado un avatar para la partida.</p>
              <button
                onClick={() => navigate('/avatar/crear')}
                className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-2 px-6 rounded-lg border border-purple-500 hover:brightness-110 shadow-lg"
              >
                Crear Avatar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
