import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/DataMurid.css';
import { useUser } from '../context/UserContext'; // Mengimpor useUser dari context

function DataMurid() {
  const { user } = useUser(); // Mengakses state pengguna dari context
  const [state, setState] = useState({
    kelas: '',
    kelasList: [],
    muridList: [],
    message: '',
  });

  const { kelas, kelasList, muridList, message } = state;

  // Fetch classes from server when component mounts
  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get-kelas', {
          params: { guru_email: user.email }, // Mengirimkan email guru untuk mendapatkan kelas yang relevan
        });
        setState((prevState) => ({
          ...prevState,
          kelasList: Array.isArray(response.data) ? response.data : [],
          message: '',
        }));
      } catch (error) {
        console.error(error);
        setState((prevState) => ({
          ...prevState,
          message: 'Gagal mengambil data kelas.',
        }));
      }
    };

    // Only call API if kelasList is empty
    if (kelasList.length === 0) {
      fetchKelas();
    }
  }, [kelasList.length, user.email]); // Dependensi pada kelasList.length dan email pengguna

  // Fetch students when kelas is selected
  useEffect(() => {
    const fetchMurid = async () => {
      if (kelas) {
        try {
          const response = await axios.get('http://localhost:5000/data-murid', {
            params: { guru_email: user.email, ruang_kelas: kelas, creator_role: user.role },
          });
          setState((prevState) => ({
            ...prevState,
            muridList: response.data,
            message: '',
          }));
        } catch (error) {
          console.error(error);
          setState((prevState) => ({
            ...prevState,
            message: 'Gagal mengambil data murid.',
          }));
        }
      }
    };

    fetchMurid();
  }, [kelas, user.email, user.role]); // Dependensi pada kelas, email pengguna, dan role

  return (
    <div className="data-murid-container">
      <h2 className="data-murid-title">Data Murid</h2>

      <select
        value={kelas}
        onChange={(e) => setState({ ...state, kelas: e.target.value })}
        className="data-murid-select"
      >
        <option value="">Pilih Kelas</option>
        {kelasList.length > 0 ? (
          kelasList.map((kelasItem, index) => (
            <option key={index} value={kelasItem}>
              {kelasItem}
            </option>
          ))
        ) : (
          <option value="">Kelas tidak ditemukan</option>
        )}
      </select>

      {message && <p className="data-murid-message">{message}</p>}

      {muridList.length > 0 ? (
        <table className="data-murid-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Ruang Kelas</th>
            </tr>
          </thead>
          <tbody>
            {muridList.map((murid, index) => (
              <tr key={index}>
                <td>{murid.nama}</td>
                <td>{murid.email}</td>
                <td>{murid.ruang_kelas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="data-murid-info">Belum ada murid di kelas ini.</p>
      )}
    </div>
  );
}

export default DataMurid;
