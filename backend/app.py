from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime
from functools import wraps

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:5000"])

def get_db():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

def log_access(patient_id, role, action="VIEWED"):
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO AuditLog (patient_id, accessed_by, timestamp, action) VALUES (?, ?, ?, ?)",
            (patient_id, role, datetime.now().isoformat(), action)
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Audit log error: {e}")

def require_role(allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            role = request.headers.get("role", "GUEST")
            if role not in allowed_roles:
                return jsonify({"error": f"Forbidden: {role} cannot access this resource"}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def filter_clinical_notes(patient_data, role):
    if role != "DOCTOR":
        patient_data["clinical_notes"] = "[REDACTED - Doctor access only]"
    return patient_data

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        "status": "healthy",
        "version": "1.0",
        "timestamp": datetime.now().isoformat(),
        "message": "🏥 Secure Healthcare API",
        "endpoints": {
            "GET /patients": "Get all patients",
            "GET /patients/<id>": "Get single patient",
            "GET /patients/search?q=name": "Search patients by name",
            "POST /patients": "Create new patient",
            "GET /audit": "View audit logs (DOCTOR only)"
        }
    }), 200

@app.route('/patients', methods=['GET'])
def get_all_patients():
    try:
        role = request.headers.get("role", "GUEST")
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM PatientRecord ORDER BY name")
        patients = cursor.fetchall()
        conn.close()
        
        patients_list = []
        for patient in patients:
            patient_dict = dict(patient)
            if role != "DOCTOR":
                patient_dict["clinical_notes"] = "[REDACTED - Doctor access only]"
            patients_list.append(patient_dict)
            log_access(patient_dict["id"], role, "VIEWED_ALL")
        
        return jsonify({
            "success": True,
            "role": role,
            "count": len(patients_list),
            "patients": patients_list
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/patients/search', methods=['GET'])
def search_patients():
    try:
        role = request.headers.get("role", "GUEST")
        search_query = request.args.get('q', '')
        
        if not search_query:
            return jsonify({"success": False, "error": "Search query required"}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM PatientRecord WHERE name LIKE ? ORDER BY name",
            (f'%{search_query}%',)
        )
        patients = cursor.fetchall()
        conn.close()
        
        patients_list = []
        for patient in patients:
            patient_dict = dict(patient)
            if role != "DOCTOR":
                patient_dict["clinical_notes"] = "[REDACTED - Doctor access only]"
            patients_list.append(patient_dict)
        
        return jsonify({
            "success": True,
            "role": role,
            "query": search_query,
            "count": len(patients_list),
            "patients": patients_list
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/patients/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    try:
        role = request.headers.get("role", "GUEST")
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM PatientRecord WHERE id = ?", (patient_id,))
        patient = cursor.fetchone()
        conn.close()
        
        if not patient:
            return jsonify({
                "success": False,
                "error": {
                    "message": "🔍 We couldn't find a patient with that ID",
                    "suggestion": "Would you like to:",
                    "options": [
                        "📋 View all patients",
                        "➕ Register as new patient",
                        "🔎 Search by name instead"
                    ],
                    "patient_id_provided": patient_id
                }
            }), 404
        
        patient_dict = dict(patient)
        patient_dict = filter_clinical_notes(patient_dict, role)
        log_access(patient_id, role, "VIEWED")
        
        return jsonify({
            "success": True,
            "role": role,
            "patient": patient_dict
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/patients', methods=['POST'])
@require_role(["DOCTOR", "NURSE"])
def create_patient():
    try:
        role = request.headers.get("role")
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        required = ['name', 'age', 'gender']
        if not all(k in data for k in required):
            return jsonify({"error": "Missing required fields. Need: name, age, gender"}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO PatientRecord (name, age, gender, appointment_status, clinical_notes)
            VALUES (?, ?, ?, ?, ?)
        ''', (data['name'], data['age'], data['gender'], 
              data.get('appointment_status', 'Pending'),
              data.get('clinical_notes', '')))
        
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        
        log_access(new_id, role, "CREATED")
        
        return jsonify({
            "success": True,
            "message": "Patient created successfully",
            "id": new_id,
            "created_by": role
        }), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/audit', methods=['GET'])
@require_role(["DOCTOR"])
def get_audit_logs():
    try:
        role = request.headers.get("role")
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM AuditLog ORDER BY timestamp DESC LIMIT 100")
        logs = cursor.fetchall()
        conn.close()
        
        logs_list = [dict(log) for log in logs]
        return jsonify({
            "success": True,
            "role": role,
            "total_logs": len(logs_list),
            "audit_logs": logs_list
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Secure Healthcare API Server...")
    print("📍 Server running at: http://localhost:5000")
    print("🔐 Role-based access control enabled")
    print("📝 Audit logging active")
    print("🔍 Search endpoint: /patients/search?q=name")
    app.run(debug=True, port=5000)