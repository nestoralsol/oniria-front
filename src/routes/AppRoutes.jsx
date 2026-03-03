import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import ChooseRole from '../pages/ChooseRole';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';
import MainLayout from '../layouts/MainLayout';
import CrearAvatarWizard from '../pages/CrearAvatarWizard';
import RequireRole from '../components/RequireRole';
import CrearWorkshopWizard from '../pages/CrearWorkshopWizard';







export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/role" element={<ChooseRole />} />
        <Route path="/avatar/crear" element={<CrearAvatarWizard />} />
        <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/master/crear-partida" element={<CrearWorkshopWizard />} />
        <Route
          path="/master/crear-partida"
          element={
            <RequireRole role="master">
              <CrearWorkshopWizard />
            </RequireRole>
          }
        />
        <Route
          path="/avatar/crear"
          element={
            <RequireRole role="player">
              <CrearAvatarWizard />
            </RequireRole>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
