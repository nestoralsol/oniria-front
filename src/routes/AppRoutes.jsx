import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';
import MainLayout from '../layouts/MainLayout';
import ChooseRole from '../pages/ChooseRole';




export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/role" element={<ChooseRole />} />
        <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}