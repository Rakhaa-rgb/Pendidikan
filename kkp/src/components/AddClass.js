import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AddClass.css';
import { useUser } from '../context/UserContext'; // Mengimpor useUser dari context

function AddClass() {
  const { user } = useUser(); // Mengakses informasi pengguna dari context
  const [state, setState] = useState({
    kelasList: [],
    newClass: '',
    message: '',
  });

  const { newClass, message } = state;

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

    fetchKelas();
  }, [user.email]); // Menambahkan dependency pada user.email

  const handleAddClass = async (e) => {
    e.preventDefault();

    if (!newClass) {
      setState((prevState) => ({
        ...prevState,
        message: 'Nama kelas tidak boleh kosong.',
      }));
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/add-class', {
        guru_email: user.email, // Menggunakan email guru dari context
        ruang_kelas: newClass,  // Menyimpan ruang_kelas dengan nama kelas yang diberikan
      });

      if (response.data.exists) {
        setState((prevState) => ({
          ...prevState,
          message: response.data.message,
        }));
      } else {
        setState((prevState) => ({
          ...prevState,
          kelasList: [...prevState.kelasList, newClass],
          newClass: '',
          message: 'Kelas berhasil ditambahkan!',
        }));
      }
    } catch (error) {
      console.error(error);
      setState((prevState) => ({
        ...prevState,
        message: 'Gagal menambahkan kelas.',
      }));
    }
  };

  return (
    <div className="add-class-container">
      <h2 className="add-class-title">Tambah Kelas</h2>

      <form onSubmit={handleAddClass}>
        <input
          type="text"
          value={newClass}
          onChange={(e) => setState({ ...state, newClass: e.target.value })}
          placeholder="Nama Kelas"
          required
        />

        <button type="submit">Tambah Kelas</button>
      </form>

      {message && <p className="add-class-message">{message}</p>}

    </div>
  );
}

export default AddClass;
