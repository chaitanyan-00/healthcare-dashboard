import React from 'react';

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600 font-medium">Loading patient data...</p>
      <p className="text-sm text-gray-400">Please wait while we fetch medical records</p>
    </div>
  );
}

export default LoadingSpinner;