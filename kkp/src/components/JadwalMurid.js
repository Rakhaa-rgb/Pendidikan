import React, { useEffect, useState, useCallback } from "react";
import { useUser } from "../context/UserContext";
import "../styles/JadwalMurid.css";

const JadwalMurid = () => {
  const { user } = useUser();
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasFetched, setHasFetched] = useState(false);

  const isValidUser =
    user &&
    user.role === "murid" &&
    user.ruang_kelas &&
    user.guru_email &&
    user.email;

  const fetchJadwal = useCallback(async () => {
    if (!isValidUser || hasFetched) return;

    setLoading(true);
    setError("");

    try {
      console.log(
        `Fetching jadwal for kelas: ${user.ruang_kelas}, guru_email: ${user.guru_email}, murid_email: ${user.email}`
      );

      const response = await fetch(
        `http://localhost:5000/get-matakuliah?kelas=${user.ruang_kelas}&guru_email=${user.guru_email}&murid_email=${user.email}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Gagal mengambil data jadwal. Status: ${response.status} - ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const data = await response.json();
      console.log("Jadwal berhasil diambil:", data.mata_kuliah);
      setJadwal(data.mata_kuliah || []);
      setHasFetched(true);
    } catch (err) {
      console.error("Error fetching jadwal:", err.message);
      setError(err.message || "Terjadi kesalahan saat mengambil data jadwal.");
    } finally {
      setLoading(false);
    }
  }, [isValidUser, hasFetched, user]);

  useEffect(() => {
    fetchJadwal();
  }, [fetchJadwal]);

  const handleRetry = () => {
    setHasFetched(false);
    fetchJadwal();
  };

  if (loading) {
    return <p className="loading">Memuat jadwal, harap tunggu...</p>;
  }

  return (
    <div className="jadwal-murid">
      <h2>Jadwal Mata Kuliah</h2>
      {error ? (
        <div className="error-container">
          <p className="error">{error}</p>
          <button onClick={handleRetry} className="retry-button">
            Coba Lagi
          </button>
        </div>
      ) : jadwal.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Mata Kuliah</th>
              <th>Ruang</th>
              <th>Hari</th>
              <th>Jam</th>
              <th>Tanggal</th>
              <th>Pertemuan Ke</th>
            </tr>
          </thead>
          <tbody>
            {jadwal.map((item, index) => (
              <tr key={index}>
                <td>{item.mata_kuliah}</td>
                <td>{item.ruang}</td>
                <td>{item.hari}</td>
                <td>{item.jam}</td>
                <td>{item.tanggal}</td>
                <td>{item.pertemuan_ke}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-data">Tidak ada jadwal tersedia untuk Anda.</p>
      )}
    </div>
  );
};

export default JadwalMurid;
