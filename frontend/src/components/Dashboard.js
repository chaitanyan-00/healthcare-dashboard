import React, { useState, useEffect, useCallback } from 'react';
import PatientModal from './PatientModal';
import LoadingSpinner from './LoadingSpinner';

function Dashboard({ role }) {
  const [patients, setPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]); // Store full list for suggestions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/patients', {
        headers: { 'role': role }
      });
      const data = await response.json();
      if (data.success) {
        setPatients(data.patients);
        setAllPatients(data.patients); // Store full list
      } else {
        throw new Error(data.error || 'Failed to fetch');
      }
    } catch (err) {
      setError('Cannot connect to server. Please make sure backend is running on port 5000');
    } finally {
      setLoading(false);
    }
  }, [role]);

  const searchPatients = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchPerformed(false);
      setShowSuggestions(false);
      fetchPatients();
      return;
    }
    
    setLoading(true);
    setSearchPerformed(true);
    setShowSuggestions(false);
    try {
      const response = await fetch(`http://localhost:5000/patients/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { 'role': role }
      });
      const data = await response.json();
      if (data.success) {
        setPatients(data.patients);
        // Show suggestions if no results found
        if (data.patients.length === 0) {
          setShowSuggestions(true);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, role, fetchPatients]);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchPerformed(false);
    setShowSuggestions(false);
    fetchPatients();
  };

  // Get similar names for suggestions
  const getSuggestions = () => {
    if (!searchQuery || allPatients.length === 0) return [];
    
    const query = searchQuery.toLowerCase();
    return allPatients
      .filter(p => p.name.toLowerCase().includes(query) || 
                   p.name.toLowerCase().split(' ').some(word => word.startsWith(query)))
      .slice(0, 5); // Show top 5 suggestions
  };

  // Get alternative suggestions (common names to try)
  const getAlternativeSuggestions = () => {
    const commonNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Bob', 'Emily'];
    return commonNames.filter(name => 
      !allPatients.some(p => p.name.toLowerCase().includes(name.toLowerCase()))
    ).slice(0, 3);
  };

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

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

  const filteredPatients = filter === 'all' 
    ? patients 
    : patients.filter(p => p.appointment_status === filter);

  const stats = {
    total: patients.length,
    pending: patients.filter(p => p.appointment_status === 'Pending').length,
    confirmed: patients.filter(p => p.appointment_status === 'Confirmed').length,
    completed: patients.filter(p => p.appointment_status === 'Completed').length
  };

  const suggestions = getSuggestions();
  const alternatives = getAlternativeSuggestions();

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl">
        <div className="flex items-start gap-4">
          <div className="text-3xl">⚠️</div>
          <div>
            <h3 className="text-red-800 font-bold text-lg mb-2">Connection Error</h3>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={fetchPatients}
              className="mt-4 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
              🔄 Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-gray-500 hover:shadow-lg transition-all">
          <p className="text-gray-500 text-sm font-medium">TOTAL PATIENTS</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-yellow-500 hover:shadow-lg transition-all">
          <p className="text-gray-500 text-sm font-medium">PENDING</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500 hover:shadow-lg transition-all">
          <p className="text-gray-500 text-sm font-medium">CONFIRMED</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{stats.confirmed}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500 hover:shadow-lg transition-all">
          <p className="text-gray-500 text-sm font-medium">COMPLETED</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{stats.completed}</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar with Empathy */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Search by patient name... (e.g., 'John' or 'Smith')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchPatients()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <button
            onClick={searchPatients}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Search
          </button>
          <button
            onClick={clearSearch}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Clear
          </button>
          
          <div className="h-8 w-px bg-gray-300 mx-2"></div>
          
          {/* Filter Buttons */}
          <span className="font-semibold text-gray-700">Filter:</span>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('Pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'Pending' ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
            }`}
          >
            ⏰ Pending ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('Confirmed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'Confirmed' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            ✅ Confirmed ({stats.confirmed})
          </button>
          <button
            onClick={() => setFilter('Completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'Completed' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            ✓ Completed ({stats.completed})
          </button>
          <button
            onClick={fetchPatients}
            className="ml-auto px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center gap-2"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Empathetic Help Text - Always visible */}
        <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
          <span>💡</span>
          <span>Tip: You can search by first name, last name, or any part of the patient's name</span>
        </div>
      </div>

      {/* Empathetic "No Results" Message with Smart Suggestions */}
      {searchPerformed && patients.length === 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🔍</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-blue-800 mb-2">
                {searchQuery ? `No patients found matching "${searchQuery}"` : "No results found"}
              </h3>
              
              <p className="text-blue-700 mb-4">
                Don't worry - this happens sometimes during busy rounds. Let us help you find what you're looking for.
              </p>
              
              {/* Smart Suggestions */}
              {suggestions.length > 0 && (
                <div className="mb-4">
                  <p className="font-semibold text-blue-800 mb-2">📋 Did you mean one of these?</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map(patient => (
                      <button
                        key={patient.id}
                        onClick={() => {
                          setSearchQuery(patient.name);
                          searchPatients();
                        }}
                        className="px-3 py-1 bg-white text-blue-700 rounded-lg border border-blue-300 hover:bg-blue-100 transition"
                      >
                        {patient.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Alternative Actions */}
              <div className="space-y-3">
                <p className="font-semibold text-blue-800">💡 What would you like to do?</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={clearSearch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    📋 View All Patients
                  </button>
                  <button
                    onClick={() => {
                      setFilter('all');
                      clearSearch();
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                  >
                    ✅ Show All Active Patients
                  </button>
                  <button
                    onClick={() => {
                      setFilter('Pending');
                      clearSearch();
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex items-center gap-2"
                  >
                    ⏰ Show Pending Appointments
                  </button>
                </div>
              </div>
              
              {/* Alternative name suggestions */}
              {alternatives.length > 0 && (
                <div className="mt-4 pt-3 border-t border-blue-200">
                  <p className="text-sm text-blue-700">
                    🤔 Not sure about the spelling? Try searching for common names like: 
                    {alternatives.map((name, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchQuery(name);
                          searchPatients();
                        }}
                        className="ml-2 text-blue-800 underline hover:text-blue-600"
                      >
                        {name}
                      </button>
                    ))}
                  </p>
                </div>
              )}
              
              {/* Empathy Note */}
              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                <p className="text-sm text-blue-800">
                  🫂 <strong>We understand you're in the middle of rounds.</strong> If you need immediate assistance, 
                  you can also call the IT support desk at <strong>ext. 1234</strong> or ask your charge nurse for help.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Age</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Gender</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPatients.map((patient) => (
                <tr 
                  key={patient.id} 
                  className="hover:bg-gray-50 transition cursor-pointer group"
                  onClick={() => setSelectedPatient(patient)}
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{patient.name}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{patient.age}</td>
                  <td className="px-6 py-4 text-gray-600">{patient.gender}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusStyle(patient.appointment_status)}`}>
                      <span>{getStatusIcon(patient.appointment_status)}</span>
                      {patient.appointment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 font-medium group-hover:text-blue-800 transition">
                      View Details →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPatients.length === 0 && !searchPerformed && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No patients found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filter or clear search</p>
          </div>
        )}
      </div>

      {/* Patient Modal */}
      {selectedPatient && (
        <PatientModal 
          patient={selectedPatient} 
          role={role}
          onClose={() => setSelectedPatient(null)} 
        />
      )}
    </div>
  );
}

export default Dashboard;