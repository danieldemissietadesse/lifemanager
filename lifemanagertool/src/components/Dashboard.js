import 'tailwindcss/tailwind.css';
import React, { useState, useEffect, useRef } from 'react';
import { getAuth, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";

const Dashboard = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(null);
  const messagesEndRef = useRef(null);
  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt'), limit(50));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(messages);
    });

    listFiles();

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    await addDoc(collection(db, 'messages'), {
      text: newMessage,
      createdAt: new Date(),
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || auth.currentUser.email
    });

    setNewMessage('');
  };

  const listFiles = async () => {
    const listRef = ref(storage, `files/${auth.currentUser.uid}`);
    const res = await listAll(listRef);
    const filesPromises = res.items.map(async (itemRef) => {
      const url = await getDownloadURL(itemRef);
      return { name: itemRef.name, url };
    });
    const files = await Promise.all(filesPromises);
    setFiles(files);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(file.name);
    const storageRef = ref(storage, `files/${auth.currentUser.uid}/${file.name}`);
    await uploadBytes(storageRef, file);
    await listFiles();
    setUploadingFile(null);
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-800">AI Student Copilot</h2>
          <p className="text-sm text-gray-600">{auth.currentUser.email}</p>
        </div>
        <nav className="mt-4">
          <a href="#" className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-200">Dashboard</a>
          <a href="#" className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-200">Courses</a>
          <a href="#" className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-200">Assignments</a>
          <a href="#" className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-200">Resources</a>
        </nav>
        <div className="absolute bottom-0 w-64 p-4">
          <button onClick={handleSignOut} className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.map((msg) => (
            <div key={msg.id} className={`mb-4 ${msg.userId === auth.currentUser.uid ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-2 rounded-lg ${msg.userId === auth.currentUser.uid ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'}`}>
                <p className="font-semibold">{msg.userName}</p>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="bg-gray-200 p-4">
          <div className="flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 py-2 px-4 bg-white rounded-l-lg focus:outline-none"
            />
            <button type="submit" className="py-2 px-4 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none">
              Send
            </button>
          </div>
        </form>
      </div>

      {/* File Management Sidebar */}
      <div className="w-64 bg-white shadow-md p-4">
        <h3 className="text-lg font-semibold mb-4">Files</h3>
        <input
          type="file"
          onChange={handleFileUpload}
          className="mb-4"
        />
        {uploadingFile && <p className="text-sm text-gray-600 mb-2">Uploading: {uploadingFile}</p>}
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li key={index} className="flex items-center justify-between">
              <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{file.name}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;