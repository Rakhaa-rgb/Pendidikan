import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import '../styles/RegisterMurid.css';

function RegisterMurid() {
  const { user } = useUser();
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ruangKelas, setRuangKelas] = useState('');
  const [kelasList, setKelasList] = useState([]);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const [isKelasLoaded, setIsKelasLoaded] = useState(false); // Track if classes are loaded

  // Function to fetch classes from backend
  const fetchKelas = useCallback(async () => {
    if (!user || !user.email || isLoading || isKelasLoaded) return; // Check loading and kelas loaded state

    console.log("Fetching classes for: ", user.email);
    setIsLoading(true); // Set loading to true to avoid re-fetching

    try {
      const response = await axios.get('http://localhost:5000/get-kelas', {
        params: { guru_email: user.email },
      });

      console.log('Fetched classes:', response.data);

      if (response.status === 200) {
        const fetchedClasses = response.data; // Array of class names
        if (Array.isArray(fetchedClasses) && fetchedClasses.length > 0) {
          setKelasList(fetchedClasses);
        } else {
          setMessage('Tidak ada kelas ditemukan.');
          setIsError(true);
        }
      } else {
        setMessage('Tidak ada kelas ditemukan.');
        setIsError(true);
      }
      setIsKelasLoaded(true); // Mark classes as loaded
    } catch (error) {
      console.error(error);
      setMessage('Gagal mengambil data kelas.');
      setIsError(true);
    } finally {
      setIsLoading(false); // Set loading to false after the API call completes
    }
  }, [user, isLoading, isKelasLoaded]);

  // useEffect to load classes when the component is first mounted or user changes
  useEffect(() => {
    if (user && user.email && !isKelasLoaded) {
      fetchKelas();
    }
  }, [user, fetchKelas, isKelasLoaded]);

  // Handler for submitting the murid registration form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || user.role !== 'guru') {
      setMessage('Anda tidak memiliki akses untuk mendaftarkan murid.');
      setIsError(true);
      return;
    }

    if (!ruangKelas) {
      setMessage('Harap pilih kelas terlebih dahulu.');
      setIsError(true);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/register-murid', {
        nama: nama.trim(),
        email: email.trim(),
        password: password,
        ruang_kelas: ruangKelas,
        guru_email: user.email,
        creator_role: user.role,
      });

      setMessage(response.data.message);
      setIsError(false);
      setNama('');
      setEmail('');
      setPassword('');
      setRuangKelas('');
    } catch (err) {
      console.error(err);
      setMessage('Registrasi gagal. Periksa koneksi atau email sudah terdaftar.');
      setIsError(true);
    }
  };

  return (
    <div className="register-murid-container">
      <h2 className="register-murid-title">Daftarkan Murid</h2>
      <form onSubmit={handleSubmit} className="register-murid-form">
        <input
          type="text"
          placeholder="Nama Lengkap"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className="register-murid-input"
          required
        />
        <input
          type="email"
          placeholder="Email Murid"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="register-murid-input"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="register-murid-input"
          required
        />
        <select
          value={ruangKelas}
          onChange={(e) => setRuangKelas(e.target.value)}
          className="register-murid-select"
          required
        >
          <option value="">Pilih Kelas</option>
          {kelasList.length > 0 ? (
            kelasList.map((kelas, index) => (
              <option key={index} value={kelas}>
                {kelas}
              </option>
            ))
          ) : (
            <option disabled>Tidak ada kelas tersedia</option>
          )}
        </select>
        <button type="submit" className="register-murid-button">
          Daftar Murid
        </button>
      </form>
      {message && (
        <p className={`register-murid-message ${isError ? 'error' : 'success'}`}>{message}</p>
      )}
    </div>
  );
}

export default RegisterMurid;
