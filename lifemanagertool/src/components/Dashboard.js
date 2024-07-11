import 'tailwindcss/tailwind.css';
import React, { useState, useRef, useEffect } from 'react';
import { getAuth, signOut } from "firebase/auth";

const Dashboard = ({ onNavigateToProfile }) => {
  const auth = getAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [chatHistory, setChatHistory] = useState([
    { id: 1, title: "Course Schedule" },
    { id: 2, title: "Calculus Homework" },
    { id: 3, title: "Campus Events" },
  ]);
  const [currentChat, setCurrentChat] = useState({ id: 0, title: "New Chat" });
  const [fileCategory, setFileCategory] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef(null);

  const featuresData = [
    { name: 'Personalized', icon: '📚' },
    { name: 'Tutoring', icon: '🧑‍🏫' },
    { name: 'Feedback', icon: '✅' },
    { name: 'Visual', icon: '🖼️' },
    { name: 'Adaptive', icon: '🧠' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSignOut = () => signOut(auth);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() === '') return;
    setMessages([...messages, { text: inputMessage, sender: 'user' }]);
    setInputMessage('');
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { text: `AI response to: ${inputMessage}`, sender: 'ai' }]);
    }, 1000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && fileCategory) {
      setFiles([...files, { file, category: fileCategory }]);
      setMessages([...messages, { text: `File uploaded: ${file.name} (${fileCategory})`, sender: 'system' }]);
      setFileCategory('');
    }
  };

  const handleNewChat = () => {
    const newChatId = chatHistory.length + 1;
    const newChat = { id: newChatId, title: `New Chat ${newChatId}` };
    setChatHistory([...chatHistory, newChat]);
    setCurrentChat(newChat);
    setMessages([]);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Collapsible Sidebar */}
      <div className={`bg-gray-800 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          {!isSidebarCollapsed && <h2 className="text-xl font-semibold text-blue-400">Copilot</h2>}
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="text-gray-400 hover:text-white">
            {isSidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        
        <nav className="flex-grow overflow-y-auto">
          {featuresData.map((feature, index) => (
            <button key={index} className="w-full text-left py-2 px-4 text-sm text-gray-300 hover:bg-gray-700 flex items-center">
              <span className="mr-2">{feature.icon}</span>
              {!isSidebarCollapsed && feature.name}
            </button>
          ))}
          
          {!isSidebarCollapsed && (
            <div className="mt-4 px-4">
              <button onClick={handleNewChat} className="w-full py-2 px-4 mb-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                New Chat
              </button>
              {chatHistory.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setCurrentChat(chat)}
                  className={`w-full text-left py-2 px-4 text-sm rounded mb-1 ${
                    currentChat.id === chat.id ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`}
                >
                  {chat.title}
                </button>
              ))}
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button onClick={onNavigateToProfile} className="w-full py-2 px-4 mb-2 bg-gray-700 text-white rounded hover:bg-gray-600">
            {isSidebarCollapsed ? '👤' : 'Profile'}
          </button>
          <button onClick={handleSignOut} className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600">
            {isSidebarCollapsed ? '🚪' : 'Sign Out'}
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-800 shadow-md p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">{currentChat.title}</h1>
          <p className="text-sm text-gray-400">{auth.currentUser.email}</p>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3/4 p-3 rounded-lg ${
                message.sender === 'user' ? 'bg-blue-600' : 
                message.sender === 'ai' ? 'bg-gray-700' : 
                'bg-gray-600'
              }`}>
                {message.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">Send</button>
          </form>
        </div>
      </div>

      {/* File Management Sidebar */}
      <div className="w-64 bg-gray-800 shadow-md p-4 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 text-blue-400">Files & Resources</h3>
        <select
          value={fileCategory}
          onChange={(e) => setFileCategory(e.target.value)}
          className="w-full p-2 mb-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Category</option>
          <option value="homework">Homework</option>
          <option value="lecture">Lecture Notes</option>
          <option value="project">Project</option>
          <option value="other">Other</option>
        </select>
        <input
          type="file"
          onChange={handleFileUpload}
          className="mb-4 text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
        />
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded-lg">
              <span className="text-sm truncate">{file.file.name}</span>
              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">{file.category}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;