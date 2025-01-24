import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserPlus, FaUsers, FaSignOutAlt, FaChalkboardTeacher, FaPlusCircle, FaCalendarAlt } from 'react-icons/fa';
import '../styles/DashboardGuru.css';

import RegisterMurid from './RegisterMurid';
import DataMurid from './DataMurid';
import AddClass from './AddClass';
import PengisianJadwal from './PengisianJadwal';  // Import Pengisian Jadwal

function DashboardGuru({ user, onLogout }) {
  const [selectedSection, setSelectedSection] = useState('');
  const navigate = useNavigate();

  const handleSectionClick = (section) => {
    setSelectedSection(section);
  };

  const handleLogout = () => {
    // Hapus data login dari localStorage atau sessionStorage
    localStorage.removeItem('user');  // jika Anda menyimpan data di localStorage
    // sessionStorage.removeItem('user'); // jika Anda menyimpan data di sessionStorage

    onLogout(); // Memanggil fungsi onLogout jika ada di props untuk memberi tahu parent bahwa user sudah logout
    navigate('/signin');  // Redirect ke halaman login setelah logout
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2><FaChalkboardTeacher style={{ marginRight: '8px' }} /> Guru Menu</h2>
        <ul>
          <li>
            <Link to="#" onClick={() => handleSectionClick('addClass')}>
              <FaPlusCircle style={{ marginRight: '5px' }} /> Tambah Ruang Kelas
            </Link>
          </li>
          <li>
            <Link to="#" onClick={() => handleSectionClick('registerMurid')}>
              <FaUserPlus style={{ marginRight: '5px' }} /> Daftarkan Murid
            </Link>
          </li>
          <li>
            <Link to="#" onClick={() => handleSectionClick('dataMurid')}>
              <FaUsers style={{ marginRight: '5px' }} /> Data Murid
            </Link>
          </li>
          {/* Menambahkan Pengisian Jadwal di Sidebar */}
          <li>
            <Link to="#" onClick={() => handleSectionClick('pengisianJadwal')}>
              <FaCalendarAlt style={{ marginRight: '5px' }} /> Pengisian Jadwal
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
        <h2>Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</h2>

        {/* Conditionally Render Components */}
        {selectedSection === 'addClass' && <AddClass user={user} />}
        {selectedSection === 'registerMurid' && <RegisterMurid user={user} />}
        {selectedSection === 'dataMurid' && <DataMurid user={user} />}
        {/* Render Pengisian Jadwal */}
        {selectedSection === 'pengisianJadwal' && <PengisianJadwal />}
      </div>
    </div>
  );
}

export default DashboardGuru;
