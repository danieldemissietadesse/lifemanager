import React, { useState } from 'react';
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendPasswordResetEmail
} from "firebase/auth";
import 'tailwindcss/tailwind.css';

const firebaseConfig = {
  apiKey: "AIzaSyDR1WSRZY7pmOcPRR_RYwV5O5kSwLTSow8",
  authDomain: "lifemanager-e9a32.firebaseapp.com",
  projectId: "lifemanager-e9a32",
  storageBucket: "lifemanager-e9a32.appspot.com",
  messagingSenderId: "713689999202",
  appId: "1:713689999202:web:83ab8f48464d01d5ff6e3b",
  measurementId: "G-VQ06GJB1QN"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const SignInSignUpPage = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [authMethod, setAuthMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setMessage('Account created successfully!');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage('Signed in successfully!');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setMessage('Signed in with Google successfully!');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent. Check your inbox.');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white">Welcome to Your AI Native Student Copilot</h1>
          <p className="text-gray-300">Streamline Your Learning Journey with Ease</p>
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

          <div className="space-y-4">
            <div className="flex space-x-2">
              <button
                className={`flex-1 py-2 px-4 rounded ${authMethod === 'email' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                onClick={() => setAuthMethod('email')}
              >
                Email
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded ${authMethod === 'institution' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                onClick={() => setAuthMethod('institution')}
              >
                Institution
              </button>
            </div>

            <form className="space-y-4" onSubmit={activeTab === 'signin' ? handleSignIn : handleSignUp}>
              <input 
                type="email" 
                placeholder={authMethod === 'email' ? "Email Address" : "Institution Email"} 
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

            {activeTab === 'signin' && (
              <div className="text-center mt-2">
                <button onClick={handleForgotPassword} className="text-sm text-blue-400 hover:text-blue-300">Forgot Password?</button>
              </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && <p className="text-green-500 text-sm">{message}</p>}
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button 
                onClick={handleGoogleSignIn}
                className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-400">
          <a href="#" className="hover:text-gray-300">Terms of Service</a> |{' '}
          <a href="#" className="hover:text-gray-300">Privacy Policy</a> |{' '}
          <a href="#" className="hover:text-gray-300">Contact Support</a>
        </div>
      </div>
    </div>
  );
};

export default SignInSignUpPage;