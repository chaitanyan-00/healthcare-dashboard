# 🏥 ResDe.ai Healthcare Dashboard

## Complete Full-Stack Healthcare Application

### Features
- ✅ Role-Based Access Control (DOCTOR/NURSE)
- ✅ HIPAA-Compliant Clinical Notes Redaction
- ✅ Patient Search Functionality
- ✅ Audit Logging for Compliance
- ✅ Beautiful Responsive UI with Tailwind CSS
- ✅ Docker & CI/CD Ready

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- SQLite3

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/healthcare-app.git
cd healthcare-app

# Setup Backend
cd backend
pip install -r requirements.txt
python init_db.py
python app.py

# Setup Frontend (new terminal)
cd ../frontend
npm install
npm start