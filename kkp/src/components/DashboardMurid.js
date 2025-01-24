import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import axios from 'axios'; 
import '../styles/DashboardMurid.css';

import Profil from './Profil';
import JadwalMurid from './JadwalMurid';

function DashboardMurid({ user, onLogout }) {
  const [selectedSection, setSelectedSection] = useState('');
  const navigate = useNavigate();

  // Fungsi untuk menangani klik pada menu
  const handleSectionClick = (section) => {
    setSelectedSection(section);
  };

  const handleLogout = () => {
    localStorage.removeItem('user'); // Hapus data login dari localStorage
    onLogout(); // Memanggil fungsi onLogout jika ada di props untuk memberi tahu parent bahwa user sudah logout
    navigate('/signin'); // Redirect ke halaman login setelah logout
  };

  // Mengambil data jadwal dari backend
  useEffect(() => {
    const fetchJadwal = async () => {
      try {
        if (!user.kelas) {
          return;
        }
        const response = await axios.get('http://localhost:5000/get-matakuliah', {
          params: { kelas: user.kelas }
        });

        if (response.data.jadwal && response.data.jadwal.length > 0) {
          // Use the jadwal data here if needed
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (user.kelas) {
      fetchJadwal();
    }
  }, [user.kelas]);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2><FaUsers style={{ marginRight: '8px' }} /> Murid Menu</h2>
        <ul>
          <li>
            <Link to="#" onClick={() => handleSectionClick('profil')}>
              <FaUserCircle style={{ marginRight: '5px' }} /> Lihat Profil
            </Link>
          </li>
          <li>
            <Link to="#" onClick={() => handleSectionClick('jadwalmurid')}>
              <FaCalendarAlt style={{ marginRight: '5px' }} /> Jadwal Matakuliah
            </Link>
          </li>
        </ul>
        <button onClick={handleLogout} className="btn logout-btn">
          <FaSignOutAlt style={{ marginRight: '5px' }} /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h1>Selamat Datang, {user.username}!</h1>
        <h2>Role: Murid</h2>

        {/* Conditionally Render Components */}
        {selectedSection === 'profil' && <Profil user={user} />}
        {selectedSection === 'jadwalmurid' && <JadwalMurid user={user} />}

        {/* Default View */}
        {!selectedSection && (
          <p>Pilih menu di samping untuk memulai.</p>
        )}
      </div>
    </div>
  );
}

export default DashboardMurid;
