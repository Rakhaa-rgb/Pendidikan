import React from 'react';
import '../styles/Profil.css';

function Profil({ user }) {
  if (!user) {
    return <p className="profil-loading">Loading user data...</p>;
  }

  return (
    <div className="profil-container">
      <h2 className="profil-title">Profil Pengguna</h2>
      <div className="profil-card">
        <div className="profil-avatar">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/847/847969.png" 
            alt="User Avatar" 
            className="avatar-img"
          />
        </div>
        <div className="profil-details">
          {/* Display basic user information */}
          <p><strong>Nama:</strong> {user.nama || "N/A"}</p>
          <p><strong>Email:</strong> {user.email || "N/A"}</p>
          <p><strong>Role:</strong> {user.role || "N/A"}</p>

          {/* Additional info for 'murid' */}
          {user.role === 'murid' && (
            <>
              <p><strong>Guru Pendaftar:</strong> {user.guru_email || "N/A"}</p>
              <p><strong>Ruang Kelas:</strong> {user.ruang_kelas || "N/A"}</p>
            </>
          )}

          {/* Additional info for 'guru' */}
          {user.role === 'guru' && (
            <>
              <p><strong>Jumlah Murid Terdaftar:</strong> {user.murid_count || 0}</p>
              <p><strong>Kelas yang Diajarkan:</strong> {user.kelas || "N/A"}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profil;
