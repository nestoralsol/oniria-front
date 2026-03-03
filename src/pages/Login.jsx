import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isRegister
      ? 'http://localhost:8000/oniria/v1/signup'
      : 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAkhPhW1aiXyz6Kes9JFA1xcv0JLgfJv_o';

    const payload = isRegister
      ? { email, password }
      : { email, password, returnSecureToken: true };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data?.error?.message || 'Error in the Request';
        throw new Error(msg);
      }

      // ✅ LOGIN (Firebase)
      if (!isRegister) {
        const token = data?.idToken;
        if (!token) throw new Error('Firebase did not return idToken');

        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', data?.refreshToken || '');
        localStorage.setItem('localId', data?.localId || '');
      } else {
        // ✅ SIGNUP (tu backend): guarda token si viene
        const token = data?.token || data?.access_token || data?.idToken;
        if (token) localStorage.setItem('token', token);
      }
      localStorage.removeItem('role'); //borramos el rol para que pueda cambiarlo

      navigate('/role');
    } catch (err) {
      setError(err.message || ('Error in ' + (isRegister ? 'signup' : 'login')));
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-darkMist via-[#1a1a2e] to-[#2e1a47] text-moonGray font-serif overflow-hidden">
      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white/5 backdrop-blur-md border border-fadedGold p-8 rounded-xl shadow-xl w-96"
      >
        <h2 className="text-3xl font-serif text-fadedGold mb-6 text-center">
          {isRegister ? 'Sign Up in Oniria' : 'Access to Oniria'}
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 rounded-lg border border-fadedGold bg-black/30 text-moonGray placeholder-gray-400 focus:outline-none"
          required
        />

        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-3 rounded-lg border border-fadedGold bg-black/30 text-moonGray placeholder-gray-400 focus:outline-none"
          required
        />

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-arcanePurple via-purple-700 to-indigo-800 text-white py-2 rounded-lg hover:brightness-125 transition font-serif shadow-md border border-purple-500"
        >
          {isRegister ? 'Sign Up' : 'Log In'}
        </button>

        <p className="text-sm text-center text-gray-400 mt-4">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-indigo-300 underline"
          >
            {isRegister ? 'Log In' : 'Sign Up'}
          </button>
        </p>
      </form>
    </div>
  );
}
