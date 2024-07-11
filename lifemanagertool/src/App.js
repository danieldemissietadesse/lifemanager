import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import SignInSignUpPage from './components/SignInSignUpPage';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
        setCurrentView('dashboard');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleNavigateToProfile = () => {
    setCurrentView('profile');
  };

  const handleNavigateToDashboard = () => {
    setCurrentView('dashboard');
  };

  if (!user) {
    return <SignInSignUpPage />;
  }

  return (
    <div className="App">
      {currentView === 'dashboard' ? (
        <Dashboard onNavigateToProfile={handleNavigateToProfile} />
      ) : (
        <Profile onBack={handleNavigateToDashboard} />
      )}
    </div>
  );
}

export default App;