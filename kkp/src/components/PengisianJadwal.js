  import React, { useState, useEffect } from 'react';
  import '../styles/PengisianJadwal.css';
  import axios from 'axios';
  import { useUser } from '../context/UserContext';
  import { FaArrowLeft, FaPlusCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
  import { useNavigate } from 'react-router-dom';

  function PengisianJadwal() {
    const { user } = useUser();
    const navigate = useNavigate();
    const [kelasList, setKelasList] = useState([]);
    const [mataKuliahList, setMataKuliahList] = useState([]);
    const [selectedKelas, setSelectedKelas] = useState(null);
    const [newMataKuliah, setNewMataKuliah] = useState('');
    const [tipeKelas, setTipeKelas] = useState('');
    const [newRuang, setNewRuang] = useState('');
    const [newLink, setNewLink] = useState('');
    const [newHari, setNewHari] = useState('');
    const [newJam, setNewJam] = useState('');
    const [newTanggal, setNewTanggal] = useState('');
    const [newPertemuanKe, setNewPertemuanKe] = useState('');
    const [message, setMessage] = useState('');
    const [formState, setFormState] = useState('selectKelas');
    const [showMataKuliahTable, setShowMataKuliahTable] = useState(false);
    const [showAddMataKuliahForm, setShowAddMataKuliahForm] = useState(false);

    const hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const jamOptions = ['07:00 - 09:00', '09:00 - 11:00', '11:00 - 13:00', '13:00 - 15:00', '15:00 - 17:00'];

    useEffect(() => {
      const fetchKelas = async () => {
        try {
          const response = await axios.get('http://localhost:5000/get-kelas', {
            params: { guru_email: user.email },
          });
          setKelasList(response.data);
        } catch (error) {
          console.error(error);
          setMessage('Gagal mengambil data kelas.');
        }
      };
      fetchKelas();
    }, [user.email]);

    useEffect(() => {
      if (selectedKelas) {
        const fetchMataKuliah = async () => {
          try {
            const response = await axios.get('http://localhost:5000/get-matakuliah', {
              params: { kelas: selectedKelas, guru_email: user.email },
            });
            setMataKuliahList(response.data.mata_kuliah || []);
          } catch (error) {
            console.error(error);
            setMessage('Gagal mengambil mata kuliah untuk kelas ini.');
          }
        };
        fetchMataKuliah();
      }
    }, [selectedKelas, user.email]);

    const handleAddMataKuliah = async () => {
      if (
        newMataKuliah &&
        tipeKelas &&
        newHari &&
        newJam &&
        newTanggal &&
        newPertemuanKe &&
        ((tipeKelas === 'Online' && newLink) || (tipeKelas === 'Offline' && newRuang))
      ) {
        try {
          await axios.post('http://localhost:5000/add-matakuliah', {
            kelas: selectedKelas,
            mata_kuliah: newMataKuliah,
            tipe: tipeKelas,
            ruang: tipeKelas === 'Offline' ? newRuang : newLink,
            hari: newHari,
            jam: newJam,
            tanggal: newTanggal,
            pertemuan_ke: newPertemuanKe,
            guru_email: user.email,
          });
          setMataKuliahList([
            ...mataKuliahList,
            {
              mata_kuliah: newMataKuliah,
              tipe: tipeKelas,
              ruang: tipeKelas === 'Offline' ? newRuang : newLink,
              hari: newHari,
              jam: newJam,
              tanggal: newTanggal,
              pertemuan_ke: newPertemuanKe,
            },
          ]);
          setNewMataKuliah('');
          setTipeKelas('');
          setNewRuang('');
          setNewLink('');
          setNewHari('');
          setNewJam('');
          setNewTanggal('');
          setNewPertemuanKe('');
          setShowAddMataKuliahForm(false);
          setMessage('Mata kuliah berhasil ditambahkan!');
        } catch (error) {
          console.error(error);
          setMessage('Gagal menambahkan mata kuliah.');
        }
      } else {
        setMessage('Semua kolom harus diisi!');
      }
    };

    const handleSelectKelas = (kelas) => {
      setSelectedKelas(kelas);
      setMessage(`Kelas ${kelas} berhasil dipilih!`);
      setFormState('selectMataKuliah');
    };

    const renderForm = () => {
      if (formState === 'selectKelas') {
        return (
          <div className="pengisian-jadwal-kelas-list-container active">
            <h4>Pilih Kelas</h4>
            <ul className="pengisian-jadwal-kelas-list">
              {kelasList.map((kelas, index) => (
                <li key={index} className="pengisian-jadwal-kelas-item">
                  <span>{kelas}</span>
                  <button onClick={() => handleSelectKelas(kelas)}><FaArrowLeft /> Pilih</button>
                </li>
              ))}
            </ul>
          </div>
        );
      }

      if (formState === 'selectMataKuliah') {
        return (
          <div className="pengisian-jadwal-mata-kuliah-list-container active">
            <h4>Mata Kuliah - Kelas {selectedKelas}</h4>
            <button onClick={() => setShowMataKuliahTable(!showMataKuliahTable)}>
              {showMataKuliahTable ? <FaEyeSlash /> : <FaEye />} Lihat Daftar
            </button>
            {showMataKuliahTable && (
              <table className="pengisian-jadwal-mata-kuliah-table">
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
                  {mataKuliahList.map((mk, index) => (
                    <tr key={index}>
                      <td>{mk.mata_kuliah}</td>
                      <td>{mk.ruang}</td>
                      <td>{mk.hari}</td>
                      <td>{mk.jam}</td>
                      <td>{mk.tanggal}</td>
                      <td>{mk.pertemuan_ke}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button onClick={() => setShowAddMataKuliahForm(!showAddMataKuliahForm)}>
              {showAddMataKuliahForm ? <FaEyeSlash /> : <FaPlusCircle />} Tambah Mata Kuliah
            </button>
            {showAddMataKuliahForm && (
              <div className="pengisian-jadwal-tambah-mata-kuliah-form">
                <input
                  className="pengisian-jadwal-input"
                  placeholder="Nama Mata Kuliah"
                  value={newMataKuliah}
                  onChange={(e) => setNewMataKuliah(e.target.value)}
                />
                <select
                  className="pengisian-jadwal-select"
                  value={tipeKelas}
                  onChange={(e) => setTipeKelas(e.target.value)}
                >
                  <option value="">Pilih Tipe Kelas</option>
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                </select>
                {tipeKelas === 'Online' && (
                  <input
                    className="pengisian-jadwal-input"
                    placeholder="Link Platform"
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                  />
                )}
                {tipeKelas === 'Offline' && (
                  <input
                    className="pengisian-jadwal-input"
                    placeholder="Nama Ruangan"
                    value={newRuang}
                    onChange={(e) => setNewRuang(e.target.value)}
                  />
                )}
                <select
                  className="pengisian-jadwal-select"
                  value={newHari}
                  onChange={(e) => setNewHari(e.target.value)}
                >
                  <option value="">Pilih Hari</option>
                  {hariOptions.map((hari, index) => (
                    <option key={index} value={hari}>
                      {hari}
                    </option>
                  ))}
                </select>
                <select
                  className="pengisian-jadwal-select"
                  value={newJam}
                  onChange={(e) => setNewJam(e.target.value)}
                >
                  <option value="">Pilih Jam</option>
                  {jamOptions.map((jam, index) => (
                    <option key={index} value={jam}>
                      {jam}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  className="pengisian-jadwal-input"
                  value={newTanggal}
                  onChange={(e) => setNewTanggal(e.target.value)}
                />
                <input
                  type="number"
                  className="pengisian-jadwal-input"
                  placeholder="Pertemuan Ke"
                  value={newPertemuanKe}
                  onChange={(e) => setNewPertemuanKe(e.target.value)}
                />
                <button className="pengisian-jadwal-tambah-btn" onClick={handleAddMataKuliah}>
                  Tambah Mata Kuliah
                </button>
              </div>
            )}
          </div>
        );
      }
    };

    return (
      <div className="pengisian-jadwal-container">
        <div className="pengisian-jadwal-message">{message}</div>
        {renderForm()}
      </div>
    );
  }

  export default PengisianJadwal;
