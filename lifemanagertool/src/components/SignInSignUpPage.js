import 'tailwindcss/tailwind.css';
import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

const SignInSignUpPage = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const auth = getAuth();

  const validateEmail = (email) => {
    return email.endsWith('@wit.edu');
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please use your @wit.edu email address");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      setMessage('Verification email sent. Please check your inbox.');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(email)) {
      setError("Please use your @wit.edu email address");
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        setError("Please verify your email before signing in.");
        return;
      }
      // Successfully signed in
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-white">Welcome to your AI Student Copilot</h1>
          <p className="text-gray-300">Streamline Your Learning Journey with Ease</p>
          <p className="text-sm text-gray-400 mt-2">Alpha version: Open only to Wentworth Institute of Technology students</p>
        </div>

        <div className="bg-gray-800 shadow-md rounded-lg p-6">
          <div className="flex mb-4">
            <button
              className={`flex-1 py-2 px-4 text-center ${activeTab === 'signin' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'} rounded-l-lg focus:outline-none`}
              onClick={() => setActiveTab('signin')}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2 px-4 text-center ${activeTab === 'signup' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'} rounded-r-lg focus:outline-none`}
              onClick={() => setActiveTab('signup')}
            >
              Sign Up
            </button>
          </div>

          <form className="space-y-4" onSubmit={activeTab === 'signin' ? handleSignIn : handleSignUp}>
            <input 
              type="email" 
              placeholder="Wentworth Email (@wit.edu)"
              className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {activeTab === 'signup' && (
              <input 
                type="password" 
                placeholder="Confirm Password" 
                className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            )}
            <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {activeTab === 'signin' ? "Sign In" : "Sign Up"}
            </button>
          </form>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {message && <p className="text-green-500 text-sm mt-2">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default SignInSignUpPage;