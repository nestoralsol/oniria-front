import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid Credentials');
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-darkMist via-[#1a1a2e] to-[#2e1a47] text-moonGray font-serif overflow-hidden">
      {/* Bruma mágica - partículas suaves */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full blur-md animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${5 + Math.random() * 5}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Formulario de login */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white/5 backdrop-blur-md border border-fadedGold p-8 rounded-xl shadow-xl w-96"
      >
        <h2 className="text-3xl font-serif text-fadedGold mb-6 text-center">Access To Oniria</h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 rounded-lg border border-fadedGold bg-black/30 text-moonGray placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-arcanePurple"
        />

        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-3 rounded-lg border border-fadedGold bg-black/30 text-moonGray placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-arcanePurple"
        />

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-arcanePurple via-purple-700 to-indigo-800 text-white py-2 rounded-lg hover:brightness-125 transition font-serif shadow-md border border-purple-500"
        >
          Invoke
        </button>
      </form>
    </div>
  );
}
