import React, { createContext, useState, useContext, useEffect } from 'react';

// Membuat context pengguna
const UserContext = createContext();

// Provider untuk mengelola state pengguna
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);  // State user, default null
  const [loading, setLoading] = useState(true);  // State untuk loading data
  const [error, setError] = useState(null);  // State untuk menangani error saat memuat data

  // ✅ Memuat data user dari localStorage saat aplikasi pertama kali dijalankan
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    try {
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error reading user data from localStorage:", error);
      setError("Terjadi kesalahan saat memuat data pengguna.");
      setUser(null); // Fallback if there's an error reading the data
    }
    setLoading(false);  // Loading selesai
  }, []);

  // Fungsi untuk memperbarui state pengguna dan menyimpannya di localStorage
  const setUserData = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));  // Save to localStorage
    } else {
      localStorage.removeItem('user');  // Remove from localStorage on logout
    }
  };

  // Jika masih loading, tampilkan indikator loading
  if (loading) {
    return <div className="spinner">Memuat data pengguna...</div>;  // Replace with a spinner or animation
  }

  // Jika terjadi error saat loading data
  if (error) {
    return <p>{error}</p>;
  }

  return (
    <UserContext.Provider value={{ user, setUserData }}>
      {children} {/* Memberikan context ke seluruh komponen anak */}
    </UserContext.Provider>
  );
};

// Hook untuk mengakses state pengguna
export const useUser = () => {
  return useContext(UserContext);
};
