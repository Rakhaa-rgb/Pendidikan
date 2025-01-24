// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Components Import
import SignIn from './components/SignIn';
import RegisterGuru from './components/RegisterGuru';
import RegisterMurid from './components/RegisterMurid';
import DashboardGuru from './components/DashboardGuru';
import DashboardMurid from './components/DashboardMurid';
import Profil from './components/Profil';
import JadwalMurid from './components/JadwalMurid';
import DataMurid from './components/DataMurid';
import PengisianJadwal from './components/PengisianJadwal';

// Context Import
import { UserProvider, useUser } from './context/UserContext';

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

// Pisahkan konten aplikasi agar Navbar bisa dikontrol
const AppContent = () => {
  const { user } = useUser();

  return (
    <>
      {!user && <Navbar />}  {/* Navbar hanya tampil jika belum login */}
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/register-guru" element={<RegisterGuru />} />
        <Route path="/register-murid" element={<RegisterMurid />} />
        <Route path="/pengisian-jadwal" element={<PengisianJadwal />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/jadwalmurid" element={<JadwalMurid />} />
        <Route path="/data-murid" element={<DataMurid />} />
        <Route path="/dashboard" element={<DashboardRoute />} />
        <Route path="/" element={<DashboardRoute />} />
      </Routes>
    </>
  );
};

// Navbar Component - Tampil hanya saat belum login
const Navbar = () => {
  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/signin">Sign In</Link></li>
        <li><Link to="/register-guru">Register Guru</Link></li>
      </ul>
    </nav>
  );
};

// Dashboard Route dengan Role-based Rendering
const DashboardRoute = () => {
  const { user, setUserData } = useUser();

  if (!user) return <SignIn />;

  const handleLogout = () => {
    setUserData(null);
    localStorage.removeItem('user');
  };

  // Render Dashboard sesuai role
  return user.role === 'guru' ? (
    <DashboardGuru user={user} onLogout={handleLogout} />
  ) : (
    <DashboardMurid user={user} onLogout={handleLogout} />
  );
};

export default App;
