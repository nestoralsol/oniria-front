import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
   <nav className="bg-white/30 backdrop-blur-md text-purple-900 p-4 shadow-sm border-b border-white/40">

      <ul className="flex gap-4">
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/">Cerrar sesión</Link></li>
      </ul>
    </nav>
  );
}