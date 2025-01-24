from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import hashlib
import os

app = Flask(__name__)
CORS(app)

# Ensure users.json exists
if not os.path.exists('users.json'):
    with open('users.json', 'w') as f:
        json.dump([], f)

# Ensure classes.json exists
if not os.path.exists('classes.json'):
    with open('classes.json', 'w') as f:
        json.dump([], f)

# Load user data
def load_users():
    with open('users.json', 'r') as f:
        return json.load(f)

# Load class data
def load_classes():
    with open('classes.json', 'r') as f:
        return json.load(f)

# Helper function to hash passwords
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Save users to file
def save_users(users):
    with open('users.json', 'w') as f:
        json.dump(users, f, indent=4)

# Save classes to file
def save_classes(classes):
    with open('classes.json', 'w') as f:
        json.dump(classes, f, indent=4)

# Login endpoint
@app.route('/login', methods=['POST'])
def login():
    try:
        users = load_users()  # Load user data from the source
        data = request.json
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"message": "Email and password are required."}), 400

        hashed_password = hash_password(password)  # Hash the provided password

        user = next((user for user in users if user.get('email') == email and user.get('password') == hashed_password), None)
        
        if user:
            # Prepare the response based on the user role and relevant data
            user_data = {
                "message": "Login berhasil",
                "role": user.get('role'),
                "ruang_kelas": user.get('ruang_kelas', ''),  # Return ruang_kelas if available
            }

            # Add additional details based on role
            if user.get('role') == 'murid':
                user_data["guru_email"] = user.get('guru_email', '')  # Email of the teacher who registered the student
            elif user.get('role') == 'guru':
                user_data["murid_count"] = len(user.get('murid_list', []))  # Count of registered students for the teacher
                user_data["kelas"] = user.get('kelas', '')  # The class the teacher is teaching

            return jsonify(user_data), 200

        return jsonify({"message": "Email atau password salah."}), 401

    except Exception as e:
        return jsonify({"message": "An error occurred.", "error": str(e)}), 500


# Register guru endpoint (Allow guru to register themselves)
@app.route('/register-guru', methods=['POST'])
def register_guru():
    users = load_users()
    data = request.json
    nama = data.get('nama')
    email = data.get('email')
    password = hash_password(data.get('password'))
    role = 'guru'

    # Validasi jika email sudah terdaftar
    if any(user.get('email') == email for user in users):
        return jsonify({"message": "Email sudah terdaftar."}), 400

    users.append({"nama": nama, "email": email, "password": password, "role": role})
    save_users(users)

    return jsonify({"message": "Guru berhasil didaftarkan."}), 201

# Register murid endpoint
@app.route('/register-murid', methods=['POST'])
def register_murid():
    users = load_users()
    data = request.json
    nama = data.get('nama')
    email = data.get('email')
    password = hash_password(data.get('password'))
    ruang_kelas = data.get('ruang_kelas')
    guru_email = data.get('guru_email')
    creator_role = data.get('creator_role')

    # Validasi hanya guru yang dapat mendaftarkan murid
    if creator_role != 'guru':
        return jsonify({"message": "Hanya guru yang dapat mendaftarkan murid."}), 403

    # Validasi jika email murid sudah terdaftar
    if any(user.get('email') == email for user in users):
        return jsonify({"message": "Email sudah terdaftar."}), 400

    users.append({
        'nama': nama,
        'email': email,
        'password': password,
        'role': 'murid',
        'guru_email': guru_email,
        'ruang_kelas': ruang_kelas
    })
    save_users(users)

    return jsonify({"message": "Murid berhasil didaftarkan!"}), 201

# Add new class endpoint
@app.route('/add-class', methods=['POST'])
def add_class():
    classes = load_classes()
    data = request.json
    guru_email = data.get('guru_email')
    ruang_kelas = data.get('ruang_kelas')

    if not ruang_kelas or not guru_email:
        return jsonify({"exists": False, "message": "Ruang kelas dan email guru diperlukan."}), 400

    # Cek apakah ruang_kelas sudah digunakan oleh guru yang sama
    if any(cls.get('ruang_kelas') == ruang_kelas and cls.get('guru_email') == guru_email for cls in classes):
        return jsonify({"exists": True, "message": f"Ruang kelas {ruang_kelas} sudah terdaftar untuk guru ini."}), 400

    # Cek apakah ruang_kelas sudah digunakan oleh guru lain
    if any(cls.get('ruang_kelas') == ruang_kelas for cls in classes):
        return jsonify({"exists": True, "message": f"Ruang kelas {ruang_kelas} sudah terdaftar untuk guru lain."}), 400

    # Simpan ruang kelas baru
    classes.append({'ruang_kelas': ruang_kelas, 'guru_email': guru_email})
    save_classes(classes)

    return jsonify({"exists": False, "message": "Ruang kelas berhasil ditambahkan."}), 201

# Get classes endpoint
@app.route('/get-kelas', methods=['GET'])
def get_kelas():
    guru_email = request.args.get('guru_email')

    if not guru_email:
        return jsonify({'message': 'Guru email tidak ditemukan.'}), 400

    classes = load_classes()
    kelas_list = list(set(cls['ruang_kelas'] for cls in classes if cls['guru_email'] == guru_email))
    
    if not kelas_list:
        return jsonify({'message': 'Tidak ada kelas ditemukan untuk guru ini.'}), 404

    return jsonify(kelas_list), 200


# Get data murid endpoint
@app.route('/data-murid', methods=['GET'])
def get_data_murid():
    users = load_users()
    guru_email = request.args.get('guru_email')
    ruang_kelas = request.args.get('ruang_kelas')
    creator_role = request.args.get('creator_role')

    if creator_role != 'guru':
        return jsonify({"message": "Hanya guru yang dapat mengakses data murid."}), 403

    murid_data = [
        user for user in users
        if user.get('role') == 'murid' and user.get('guru_email') == guru_email and user.get('ruang_kelas') == ruang_kelas
    ]

    if not murid_data:
        return jsonify({"message": "Tidak ada murid di kelas ini."}), 404

    return jsonify(murid_data), 200

# Profil endpoint
@app.route('/profile', methods=['GET'])
def get_profile():
    try:
        # Load users
        users = load_users()
    except Exception as e:
        return jsonify({"message": f"Error loading users: {str(e)}"}), 500

    email = request.args.get('email')

    # Validate email
    if not email or '@' not in email:
        return jsonify({"message": "Invalid email provided"}), 400

    # Find the user by email
    user = next((user for user in users if user['email'] == email), None)

    if user:
        user_data = {
            "name": user.get("name", "Tidak diketahui"),
            "email": user.get('email'),
            "role": user.get('role'),
            "guru_email": user.get('guru_email', ''),
            "ruang_kelas": user.get('ruang_kelas', '')
        }
        return jsonify(user_data), 200

    return jsonify({"message": "User not found"}), 404


# Get mata kuliah endpoint
@app.route('/get-matakuliah', methods=['GET'])
def get_mata_kuliah():
    # Mendapatkan parameter dari permintaan
    kelas = request.args.get('kelas')
    guru_email = request.args.get('guru_email')
    murid_email = request.args.get('murid_email')

    print(f"Request params - kelas: {kelas}, guru_email: {guru_email}, murid_email: {murid_email}")

    # Validasi parameter
    if not kelas or not guru_email:
        print("Parameter kelas atau guru_email tidak diberikan.")
        return jsonify({'message': 'Parameter kelas dan guru_email diperlukan.'}), 400

    try:
        # Memuat data kelas dan pengguna
        classes = load_classes()
        print("Classes loaded successfully.")
        users = load_users()
        print("Users loaded successfully.")
    except Exception as e:
        print(f"Error loading data: {e}")
        return jsonify({'message': 'Internal server error.'}), 500

    # Mencari kelas berdasarkan kelas dan guru_email
    class_found = next((cls for cls in classes if cls['ruang_kelas'] == kelas and cls['guru_email'] == guru_email), None)
    if not class_found:
        print(f'Kelas "{kelas}" tidak ditemukan untuk guru "{guru_email}".')
        return jsonify({'message': f'Kelas "{kelas}" tidak ditemukan untuk guru ini.'}), 404

    # Validasi murid, jika email murid diberikan
    if murid_email:
        murid = next((user for user in users if user['email'] == murid_email and user['role'] == 'murid' and user['ruang_kelas'] == kelas), None)
        if not murid:
            print(f'Murid "{murid_email}" tidak terdaftar di kelas "{kelas}".')
            return jsonify({'message': 'Murid tidak terdaftar di kelas ini.'}), 404
    else:
        print('Murid email tidak diberikan, menampilkan mata kuliah untuk kelas ini tanpa validasi murid.')
    
    # Mendapatkan mata kuliah untuk kelas
    mata_kuliah = class_found.get('mata_kuliah', [])
    if not mata_kuliah:
        print(f'Tidak ada mata kuliah untuk kelas "{kelas}".')
        return jsonify({'message': f'Tidak ada mata kuliah untuk kelas "{kelas}".'}), 404

    print(f"Mata kuliah untuk kelas {kelas}: {mata_kuliah}")
    return jsonify({'mata_kuliah': mata_kuliah}), 200




@app.route('/add-matakuliah', methods=['POST'])
def add_mata_kuliah():
    data = request.json
    kelas = data.get('kelas')
    mata_kuliah = data.get('mata_kuliah')
    ruang = data.get('ruang')
    hari = data.get('hari')
    jam = data.get('jam')
    tanggal = data.get('tanggal')
    pertemuan_ke = data.get('pertemuan_ke')
    
    # Validasi input
    if not mata_kuliah or not ruang or not kelas or not hari or not jam or not tanggal or not pertemuan_ke:
        return jsonify({"message": "Semua informasi diperlukan."}), 400

    try:
        # Load class data
        mata_kuliah_data = load_classes()

        # Find the class and add mata kuliah with its details (ruang, hari, jam, tanggal, pertemuan_ke)
        for cls in mata_kuliah_data:
            if cls['ruang_kelas'] == kelas:
                if 'mata_kuliah' not in cls:
                    cls['mata_kuliah'] = []

                # Add mata kuliah with additional fields (ruang, hari, jam, tanggal, pertemuan_ke)
                cls['mata_kuliah'].append({
                    "mata_kuliah": mata_kuliah,
                    "ruang": ruang,
                    "hari": hari,
                    "jam": jam,
                    "tanggal": tanggal,
                    "pertemuan_ke": pertemuan_ke
                })

                # Save the updated classes data
                save_classes(mata_kuliah_data)
                return jsonify({"message": "Mata kuliah berhasil ditambahkan."}), 201
        
        return jsonify({"message": "Kelas tidak ditemukan."}), 404
    except Exception as e:
        return jsonify({"message": "Gagal menambahkan mata kuliah.", "error": str(e)}), 500




if __name__ == '__main__':
    app.run(debug=True)
