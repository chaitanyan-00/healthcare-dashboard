import sqlite3

def init_db():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    # Patient Records Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS PatientRecord (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            gender TEXT NOT NULL,
            appointment_status TEXT DEFAULT 'Pending',
            clinical_notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Audit Log Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS AuditLog (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            accessed_by TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            action TEXT NOT NULL,
            FOREIGN KEY (patient_id) REFERENCES PatientRecord(id)
        )
    ''')

    # Check if table is empty
    cursor.execute("SELECT COUNT(*) FROM PatientRecord")
    count = cursor.fetchone()[0]
    
    if count == 0:
        sample_patients = [
            ('John Doe', 45, 'Male', 'Completed', 'Patient has history of hypertension. BP: 128/84. Prescribed Lisinopril 10mg.'),
            ('Jane Smith', 32, 'Female', 'Confirmed', 'Routine checkup. All vitals normal. No acute distress.'),
            ('Bob Johnson', 67, 'Male', 'Pending', 'COMPLAINS OF CHEST PAIN. Needs immediate ECG and cardiology referral.'),
            ('Sarah Williams', 28, 'Female', 'Completed', 'Prenatal checkup - Week 28. Baby heartbeat strong: 145 bpm.'),
            ('Michael Brown', 52, 'Male', 'Confirmed', 'Diabetes Type 2. HbA1c: 7.2%. Prescribed Metformin 500mg.'),
            ('Emily Davis', 34, 'Female', 'Pending', 'Reports persistent headaches for 2 weeks. Scheduling MRI.'),
            ('David Wilson', 41, 'Male', 'Confirmed', 'Annual physical. Cholesterol slightly elevated.'),
            ('Lisa Anderson', 29, 'Female', 'Completed', 'Post-op follow-up. Incision healing well.'),
            ('James Taylor', 58, 'Male', 'Pending', 'Chest pain radiating to left arm. STAT EKG ordered.'),
            ('Maria Garcia', 44, 'Female', 'Confirmed', 'Follow-up on hypertension. BP controlled on current meds.'),
            ('Robert Chen', 37, 'Male', 'Completed', 'Sports physical. All clear, no restrictions.'),
            ('Patricia Brown', 62, 'Female', 'Pending', 'Dizziness and falls. Needs balance assessment.')
        ]

        cursor.executemany('''
            INSERT INTO PatientRecord (name, age, gender, appointment_status, clinical_notes)
            VALUES (?, ?, ?, ?, ?)
        ''', sample_patients)
        print(f"✅ Added {len(sample_patients)} sample patients")
    else:
        print(f"✅ Database already has {count} patients")

    conn.commit()
    conn.close()
    print("✅ Database initialized successfully!")

if __name__ == '__main__':
    init_db()