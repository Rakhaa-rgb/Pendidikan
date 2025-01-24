import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardGuru from './DashboardGuru';
import DashboardMurid from './DashboardMurid';
import '../styles/Signin.css';
import { useUser } from '../context/UserContext';

function SignIn() {
  const { user, setUserData } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // When the component loads, check if the user is already stored in localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUserData(storedUser);
    }
  }, [setUserData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/login', {
        email,
        password,
      });

      // Ensure response contains required user data
      if (response.status === 200 && response.data.role) {
        const loggedInUser = {
          email,
          role: response.data.role,
          ruang_kelas: response.data.ruang_kelas || '', // Ensure ruang_kelas is included
          nama: response.data.nama || 'Tidak diketahui', // Ensure nama is included
          guru_email: response.data.guru_email || '',
        };

        // Save user data to localStorage
        localStorage.setItem('user', JSON.stringify(loggedInUser));

        // Update the context with user data
        setUserData(loggedInUser);

        // Reset form fields and errors
        setEmail('');
        setPassword('');
        setError('');
      } else {
        setError('Email atau password salah.');
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Email atau password salah.');
      } else {
        setError('Terjadi kesalahan, coba lagi nanti.');
      }
    }
  };

  const handleLogout = () => {
    setUserData(null);
    localStorage.removeItem('user');
  };

  // If the user is logged in, show the appropriate dashboard based on role
  if (user) {
    return user.role === 'guru' ? (
      <DashboardGuru user={user} onLogout={handleLogout} />
    ) : (
      <DashboardMurid user={user} onLogout={handleLogout} />
    );
  }

  return (
    <div className="signin-container">
      <h2>Login ke Akun Anda</h2>
      <p>Selamat datang kembali! Silakan login dengan kredensial Anda.</p>
      <form onSubmit={handleSubmit} className="signin-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Masukkan email Anda"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Masukkan password Anda"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <button type="submit" className="submit-btn">Login</button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default SignIn;
