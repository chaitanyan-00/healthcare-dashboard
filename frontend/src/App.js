import React, { useState } from 'react';
import Dashboard from './components/Dashboard';

function App() {
  const [role, setRole] = useState('DOCTOR');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                🏥 ResDe.ai Clinical Dashboard
              </h1>
              <p className="text-gray-500 mt-2">Patient Management System with Role-Based Access Control</p>
            </div>
            
            {/* Role Switcher */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-600">ACCESS ROLE:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setRole('DOCTOR')}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                    role === 'DOCTOR' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>👨‍⚕️</span> DOCTOR
                </button>
                <button
                  onClick={() => setRole('NURSE')}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                    role === 'NURSE' 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>👩‍⚕️</span> NURSE
                </button>
              </div>
            </div>
          </div>
          
          {/* Security Banner */}
          <div className="mt-5 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <p className="font-semibold text-amber-800">HIPAA Compliant Mode Active</p>
                <p className="text-sm text-amber-700">
                  Clinical notes are <span className="font-bold">{role !== 'DOCTOR' ? 'REDACTED' : 'visible'}</span> for <span className="font-bold">{role}</span> role
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <Dashboard role={role} />
      </div>
    </div>
  );
}

export default App;