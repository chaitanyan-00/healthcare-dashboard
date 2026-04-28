import React from 'react';

function PatientModal({ patient, role, onClose }) {
  const getStatusStyle = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Confirmed': return 'bg-green-100 text-green-800 border border-green-200';
      case 'Completed': return 'bg-blue-100 text-blue-800 border border-blue-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pending': return '⏰';
      case 'Confirmed': return '✅';
      case 'Completed': return '✓';
      default: return '📋';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Patient Medical Record</h2>
            <p className="text-sm text-gray-500 mt-1">Complete health information</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Patient Info */}
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase font-semibold">Full Name</p>
              <p className="text-lg font-bold text-gray-800 mt-1">{patient.name}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase font-semibold">Age / Gender</p>
              <p className="text-lg font-bold text-gray-800 mt-1">{patient.age} years • {patient.gender}</p>
            </div>
          </div>
          
          {/* Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Appointment Status</p>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusStyle(patient.appointment_status)}`}>
              <span>{getStatusIcon(patient.appointment_status)}</span>
              {patient.appointment_status}
            </span>
          </div>

          {/* Clinical Notes */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-indigo-500 text-xl">📋</span>
              <p className="font-bold text-gray-700">Clinical Notes</p>
              {role !== 'DOCTOR' && (
                <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Restricted</span>
              )}
            </div>
            <div className={`rounded-xl p-5 ${role === 'DOCTOR' ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50 border-2 border-gray-200'}`}>
              {role === 'DOCTOR' ? (
                <p className="text-gray-700 leading-relaxed">{patient.clinical_notes}</p>
              ) : (
                <div className="text-center py-6">
                  <div className="text-5xl mb-3">🔒</div>
                  <p className="text-gray-600 font-semibold">Access Restricted</p>
                  <p className="text-sm text-gray-500 mt-2">Only physicians can view clinical notes (HIPAA Compliance)</p>
                  <p className="text-xs text-gray-400 mt-3">Current role: {role}</p>
                </div>
              )}
            </div>
          </div>

          {/* Security Footer */}
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 text-center">
            <p>🔒 HIPAA Compliant • Access Logged • Role: {role}</p>
            <p className="mt-1">All accesses are recorded in audit trail for compliance</p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end">
          <button onClick={onClose} className="px-6 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default PatientModal;