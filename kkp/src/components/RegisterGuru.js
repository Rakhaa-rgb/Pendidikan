import React, { useState } from 'react';
import axios from 'axios';
import '../styles/RegisterGuru.css'; 

function RegisterGuru() {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/register-guru', {
        nama,
        email,
        password,
        role: 'guru',
        creator_role: 'admin',
      });
      
      setMessage(response.data.message);
      setNama('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setMessage('Registrasi gagal');
    }
  };

  return (
    <div className="register-container"> 
      <h2>Register Guru</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nama"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register Guru</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default RegisterGuru;
