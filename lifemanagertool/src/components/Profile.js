import 'tailwindcss/tailwind.css';
import React from 'react';

const Profile = ({ onBack }) => {
  // Placeholder data - replace with real data fetched from your backend
  const studentData = {
    name: "John Doe",
    id: "W00123456",
    email: "doej@wit.edu",
    major: "Computer Science",
    expectedGraduation: "May 2025",
    gpa: "3.8",
    credits: 75,
    advisor: "Dr. Jane Smith"
  };

  const connectedSystems = [
    { name: "Brightspace", status: "Connected", lastSync: "2023-07-10 14:30" },
    { name: "LeopardWeb", status: "Connected", lastSync: "2023-07-10 15:00" },
    { name: "WIT Library", status: "Connected", lastSync: "2023-07-09 09:15" }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <button onClick={onBack} className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Back to Dashboard
      </button>
      <h1 className="text-3xl font-bold mb-6">Student Profile</h1>
      
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Personal Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><strong>Name:</strong> {studentData.name}</div>
          <div><strong>Student ID:</strong> {studentData.id}</div>
          <div><strong>Email:</strong> {studentData.email}</div>
          <div><strong>Major:</strong> {studentData.major}</div>
          <div><strong>Expected Graduation:</strong> {studentData.expectedGraduation}</div>
          <div><strong>GPA:</strong> {studentData.gpa}</div>
          <div><strong>Credits Completed:</strong> {studentData.credits}</div>
          <div><strong>Academic Advisor:</strong> {studentData.advisor}</div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Connected Systems</h2>
        <div className="space-y-4">
          {connectedSystems.map((system, index) => (
            <div key={index} className="flex justify-between items-center bg-gray-700 p-4 rounded">
              <div>
                <h3 className="font-semibold">{system.name}</h3>
                <p className="text-sm text-gray-400">Last synced: {system.lastSync}</p>
              </div>
              <span className="px-2 py-1 bg-green-500 text-white text-sm rounded">{system.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;