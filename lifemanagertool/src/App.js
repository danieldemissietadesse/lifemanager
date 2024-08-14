import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';
import { Send, Upload, Loader, Search, X, Menu, User, History, Book, ChevronDown } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where, doc, setDoc, getDoc, addDoc } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';



const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const DEFAULT_ASSISTANT_ID = 'asst_sJcX7CiUVGw1xyuH3BwE8mgi';
const CIS_ASSISTANT_ID = 'asst_fpIfIc3rlfvL4qDVmAcgYcas';
const CIS_SENIOR_PROJECT_ASSISTANT_ID = 'asst_itHtToNbE2LB56RSBYXbeJKr';
const E_COMMERCE_ASSISTANT_ID = 'asst_HxnThQ3z4KBxxzcyHsGkapoz';

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
const db = getFirestore(app);
const functions = getFunctions(app);

const staticSuggestions = {
  'Default': [
    "What can you help me with?",
    "Tell me about Wentworth Institute of Technology.",
    "How can I improve my study habits?",
    "What are some good resources for learning programming?"
  ],
  'CIS': [
    "What are the core courses in the CIS program?",
    "How can I prepare for a career in CIS?",
    "What programming languages are most important for CIS?",
    "Can you explain the difference between CIS and Computer Science?"
  ],
  'CIS Senior Project': [
    "What are the main components of a CIS senior project?",
    "How should I choose a topic for my senior project?",
    "What are some common challenges in senior projects?",
    "How can I effectively manage my senior project timeline?"
  ],
  'E-Commerce': [
    "What are the key elements of a successful e-commerce website?",
    "How has e-commerce evolved in recent years?",
    "What are some common e-commerce business models?",
    "How can I ensure security in e-commerce transactions?"
  ]
};


console.log('REACT_APP_OPENAI_API_KEY:', process.env.REACT_APP_OPENAI_API_KEY);

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [threadId, setThreadId] = useState(null);
  const [isClassSidebarOpen, setIsClassSidebarOpen] = useState(false);
  const [isMajorSidebarOpen, setIsMajorSidebarOpen] = useState(false);
  const [classSearchTerm, setClassSearchTerm] = useState('');
  const [majorSearchTerm, setMajorSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [majorResults, setMajorResults] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [currentAssistantId, setCurrentAssistantId] = useState(DEFAULT_ASSISTANT_ID);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);
  const [isStudySidebarOpen, setIsStudySidebarOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState('Default');
  const [userIP, setUserIP] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [studyInstructions, setStudyInstructions] = useState('');
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [studyTimer, setStudyTimer] = useState(25 * 60); // 25 minutes in seconds
  const [isStudyTimerRunning, setIsStudyTimerRunning] = useState(false);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);
  const [flashcardChat, setFlashcardChat] = useState([]);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const loadChatHistory = () => {
      const savedMessages = localStorage.getItem('currentChat');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
        setShowSuggestions(false);
      }
      if (isSignedIn) {
        const savedHistory = localStorage.getItem('chatHistory');
        if (savedHistory) {
          setChatHistory(JSON.parse(savedHistory));
        }
      } else {
        setChatHistory([]);
      }
    };

    loadChatHistory();
    getUserIP();
  }, [isSignedIn]);

  useEffect(() => {
    localStorage.setItem('currentChat', JSON.stringify(messages));
    if (messages.length > 0) {
      setShowSuggestions(false);
    }
  }, [messages]);

  useEffect(() => {
    if (selectedMajor === 'CIS') {
      setCurrentAssistantId(CIS_ASSISTANT_ID);
    } else if (currentModel === 'CIS Senior Project') {
      setCurrentAssistantId(CIS_SENIOR_PROJECT_ASSISTANT_ID);
    } else if (currentModel === 'E-Commerce') {
      setCurrentAssistantId(E_COMMERCE_ASSISTANT_ID);
    } else {
      setCurrentAssistantId(DEFAULT_ASSISTANT_ID);
    }
  }, [selectedMajor, currentModel]);

  useEffect(() => {
    let interval;
    if (isStudyTimerRunning && studyTimer > 0) {
      interval = setInterval(() => {
        setStudyTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (studyTimer === 0) {
      setIsStudyTimerRunning(false);
      setIsStudyMode(false);
      alert("Study session completed!");
    }
    return () => clearInterval(interval);
  }, [isStudyTimerRunning, studyTimer]);

  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setUserIP(data.ip);
      checkIPUsage(data.ip);
    } catch (error) {
      console.error('Error getting user IP:', error);
    }
  };

  const checkIPUsage = async (ip) => {
    if (!ip) return;
    const ipDocRef = doc(db, 'ipUsage', ip);
    const ipDoc = await getDoc(ipDocRef);
    if (ipDoc.exists()) {
      const data = ipDoc.data();
      setMessageCount(data.messageCount || 0);
    } else {
      await setDoc(ipDocRef, { messageCount: 0 });
    }
  };

  const updateIPUsage = async () => {
    if (!userIP) return;
    const ipDocRef = doc(db, 'ipUsage', userIP);
    await setDoc(ipDocRef, { messageCount: messageCount + 1 }, { merge: true });
  };

  const generateLoadingMessage = async () => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Generate a short, funny loading message in the format 'I'm thinking... (probably about X)' where X is something unexpected and humorous." },
          { role: "user", content: "Generate a loading message" }
        ],
        temperature: 0.7,
        max_tokens: 30,
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generating loading message:', error);
      return "I'm thinking... (probably about something witty)";
    }
  };

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim() || isLoading) return;
    if (messageCount >= 25 && !isSignedIn) {
      alert("You've reached the free message limit. Please sign in to continue.");
      return;
    }

    setIsLoading(true);
    setMessages(prevMessages => [...prevMessages, { role: 'user', content: message }]);
    setInputMessage('');
    setMessageCount(prevCount => prevCount + 1);
    if (!isSignedIn) {
      updateIPUsage();
    }

    const newLoadingMessage = await generateLoadingMessage();
    setLoadingMessage(newLoadingMessage);

    try {
      console.log("Starting message processing...");
      let currentThreadId = threadId;
      if (!currentThreadId) {
        console.log("Creating new thread...");
        const thread = await openai.beta.threads.create();
        currentThreadId = thread.id;
        setThreadId(currentThreadId);
        console.log("New thread created:", currentThreadId);
      }

      console.log("Adding message to thread...");
      await openai.beta.threads.messages.create(currentThreadId, {
        role: "user",
        content: message
      });
      console.log("Message added to thread");

      console.log("Creating run...");
      const run = await openai.beta.threads.runs.create(
        currentThreadId,
        { 
          assistant_id: currentAssistantId,
          instructions: `Please use the knowledge from the uploaded files to answer the user's question. If you use information from a file, mention which file you used. The current major is ${selectedMajor || 'not selected'}, the current class is ${selectedClass || 'not selected'}.`
        }
      );
      console.log("Run created:", run.id);

      let assistantMessage = '';
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: '', isLoading: true }]);

      console.log("Waiting for run to complete...");
      while (true) {
        const runStatus = await openai.beta.threads.runs.retrieve(currentThreadId, run.id);
        console.log("Run status:", runStatus.status);
        
        if (runStatus.status === 'completed') {
          console.log("Run completed, retrieving messages...");
          const messages = await openai.beta.threads.messages.list(currentThreadId);
          assistantMessage = messages.data[0].content[0].text.value;
          console.log("Assistant message:", assistantMessage);
          break;
        } else if (runStatus.status === 'failed') {
          console.error("Run failed:", runStatus.last_error);
          throw new Error(`Run failed: ${runStatus.last_error?.message || 'Unknown error'}`);
        }

        await new Promise(resolve => setTimeout(resolve, 1000)); // Poll every second
      }

      setMessages(prevMessages => [
        ...prevMessages.slice(0, -1),
        { role: 'assistant', content: assistantMessage, isLoading: false }
      ]);

      if (isSignedIn) {
        saveChatToFirebase(currentThreadId, [...messages, { role: 'user', content: message }, { role: 'assistant', content: assistantMessage }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', error.response?.data);
      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'assistant', content: `I'm sorry, I encountered an error while processing your request: ${error.message}`, isLoading: false }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveChatToFirebase = async (threadId, messages) => {
    try {
      const chatRef = collection(db, 'users', user.uid, 'chats');
      await addDoc(chatRef, {
        threadId: threadId,
        messages: messages,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error saving chat to Firebase:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    const newUploadedFiles = [];
  
    try {
      for (const file of files) {
        const uploadedFile = await openai.files.create({
          file: file,
          purpose: 'assistants'
        });
        newUploadedFiles.push({ id: uploadedFile.id, name: file.name });
      }
  
      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'system', content: `File${newUploadedFiles.length > 1 ? 's' : ''} uploaded successfully.` }
      ]);
    } catch (error) {
      console.error('Error in file upload process:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'system', content: `Error uploading file: ${error.message}` }
      ]);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      setIsSignedIn(true);
      if (messages.length > 0) {
        setMessages(prevMessages => [
          ...prevMessages,
          { role: 'system', content: `*Switched to ${currentModel} model. Your chat history will now be saved.*` }
        ]);
        saveChatToFirebase(threadId, messages);
      }
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  const handleAddClasses = () => {
    setIsClassSidebarOpen(true);
    setIsMajorSidebarOpen(false);
    setIsHistorySidebarOpen(false);
    setIsStudySidebarOpen(false);
  };

  const handleAddMajor = () => {
    setIsMajorSidebarOpen(true);
    setIsClassSidebarOpen(false);
    setIsHistorySidebarOpen(false);
    setIsStudySidebarOpen(false);
  };

  const handleClassSearch = async (searchTerm) => {
    setClassSearchTerm(searchTerm);
    try {
      const classesRef = collection(db, 'classes');
      const q = query(
        classesRef,
        where('major', '==', 'CIS'),
        where('enrollmentYear', '==', 2019)
      );
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(course => course.name.toLowerCase().includes(searchTerm.toLowerCase()));
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching classes:', error);
    }
  };

  const handleMajorSearch = (searchTerm) => {
    setMajorSearchTerm(searchTerm);
    const mockResults = [
      { id: 1, name: 'Computer Information Systems' },
    ].filter(major => major.name.toLowerCase().includes(searchTerm.toLowerCase()));
    setMajorResults(mockResults);
  };

  const handleMajorSelect = (majorName) => {
    const newMajor = majorName === 'Computer Information Systems' ? 'CIS' : majorName;
    setSelectedMajor(newMajor);
    setSelectedClass(null);
    setIsMajorSidebarOpen(false);
    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'system', content: `Major changed to ${newMajor}. Now using ${newMajor === 'CIS' ? 'CIS' : 'default'} assistant.` }
    ]);
    setShowSuggestions(true);
  };

  const handleClassSelect = (className) => {
    setSelectedClass(className);
    setIsClassSidebarOpen(false);
    let newModel;
    if (className === 'CIS SENIOR PROJECT-MGMT-5510-01') {
      newModel = 'CIS Senior Project';
    } else if (className === 'E-COMMERCE-MGMT-3100-01') {
      newModel = 'E-Commerce';
    } else {
      newModel = 'Default';
    }
    handleModelChange(newModel);
  };

  const startNewChat = () => {
    if (messages.length === 0) return;

    if (isSignedIn) {
      saveChatToFirebase(threadId, messages);
    } else {
      const tempHistory = JSON.parse(localStorage.getItem('tempChatHistory') || '[]');
      tempHistory.push({ id: Date.now(), messages, threadId });
      localStorage.setItem('tempChatHistory', JSON.stringify(tempHistory));
    }

    setMessages([]);
    setThreadId(null);
    localStorage.removeItem('currentChat');
    setShowSuggestions(true);
  };

  const toggleHistorySidebar = () => {
    setIsHistorySidebarOpen(!isHistorySidebarOpen);
    setIsClassSidebarOpen(false);
    setIsMajorSidebarOpen(false);
    setIsStudySidebarOpen(false);
  };

  const toggleStudySidebar = () => {
    if (currentModel !== 'CIS Senior Project' && currentModel !== 'E-Commerce') {
      alert("Please select CIS Senior Project or E-Commerce class first.");
      return;
    }
    setIsStudySidebarOpen(!isStudySidebarOpen);
    setIsClassSidebarOpen(false);
    setIsMajorSidebarOpen(false);
    setIsHistorySidebarOpen(false);
  };

  const loadChatFromHistory = (chat) => {
    setMessages(chat.messages);
    setThreadId(chat.threadId);
    setIsHistorySidebarOpen(false);
    localStorage.setItem('currentChat', JSON.stringify(chat.messages));
    setShowSuggestions(false);
  };

  const handleModelChange = (model) => {
    setCurrentModel(model);
    switch (model) {
      case 'CIS':
        setCurrentAssistantId(CIS_ASSISTANT_ID);
        break;
      case 'CIS Senior Project':
        setCurrentAssistantId(CIS_SENIOR_PROJECT_ASSISTANT_ID);
        break;
      case 'E-Commerce':
        setCurrentAssistantId(E_COMMERCE_ASSISTANT_ID);
        break;
      default:
        setCurrentAssistantId(DEFAULT_ASSISTANT_ID);
    }
    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'system', content: `Switched to ${model} model.` }
    ]);
    setShowSuggestions(true);
  };

  const generateFlashcards = async () => {
    if (!studyInstructions.trim()) {
      alert("Please enter study instructions first.");
      return;
    }
  
    setIsGeneratingFlashcards(true);
    try {
      console.log("Generating flashcards for:", currentModel);
      console.log("Study instructions:", studyInstructions);
  
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: `You are an expert in ${currentModel}. Generate 10 flashcards based on the following instructions: ${studyInstructions}` },
          { role: "user", content: "Generate 10 flashcards. Each flashcard should have a word or term on the front and its definition or explanation on the back. Format each flashcard as 'Front: [word/term] || Back: [definition/explanation]'. Provide exactly 10 flashcards, each on a new line." }
        ],
        temperature: 0.7,
      });
  
      console.log("Raw AI response:", response.choices[0].message.content);
  
      const generatedFlashcards = response.choices[0].message.content
        .split('\n')
        .filter(line => line.includes('||'))
        .map(line => {
          const [front, back] = line.split('||').map(s => s.replace(/^(Front|Back): /, '').trim());
          return { front, back };
        });
  
      console.log("Parsed flashcards:", generatedFlashcards);
  
      if (generatedFlashcards.length !== 10) {
        throw new Error(`Expected 10 flashcards, but got ${generatedFlashcards.length}`);
      }
  
      setFlashcards(generatedFlashcards);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      alert(`Error generating flashcards: ${error.message}`);
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const startStudying = () => {
    if (flashcards.length === 0) {
      alert("Please generate flashcards first.");
      return;
    }
    setIsStudyMode(true);
    setIsStudyTimerRunning(true);
    setCurrentFlashcardIndex(0);
    setIsFlashcardFlipped(false);
    setFlashcardChat([]);
  };

  const stopStudying = () => {
    setIsStudyMode(false);
    setIsStudyTimerRunning(false);
    setStudyTimer(25 * 60); // Reset timer to 25 minutes
  };

  const nextFlashcard = () => {
    if (currentFlashcardIndex < flashcards.length - 1) {
      setCurrentFlashcardIndex(prevIndex => prevIndex + 1);
      setIsFlashcardFlipped(false);
      setFlashcardChat([]);
    } else {
      alert("You've completed all flashcards!");
      stopStudying();
    }
  };

  const flipFlashcard = () => {
    setIsFlashcardFlipped(!isFlashcardFlipped);
  };

  const handleFlashcardChat = async (message) => {
    setFlashcardChat(prevChat => [...prevChat, { role: 'user', content: message }]);
    
    try {
      const currentFlashcard = flashcards[currentFlashcardIndex];
      console.log("Current flashcard:", currentFlashcard);
  
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: `You are a helpful study assistant for ${currentModel}. The current flashcard has the word "${currentFlashcard.front}" on the front. The definition on the back is "${currentFlashcard.back}". 
          If the card is not flipped, provide hints and guidance to help the user guess the definition without revealing it directly. 
          If the card is flipped or if the user explicitly asks for the answer, you can discuss the definition in detail.
          Current card state: ${isFlashcardFlipped ? 'flipped' : 'not flipped'}.` },
          ...flashcardChat.map(chat => ({ role: chat.role, content: chat.content })),
          { role: "user", content: message }
        ],
        temperature: 0.7,
      });
  
      const aiResponse = response.choices[0].message.content;
      console.log("AI response:", aiResponse);
  
      setFlashcardChat(prevChat => [...prevChat, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('Error in flashcard chat:', error);
      setFlashcardChat(prevChat => [...prevChat, { role: 'assistant', content: `I'm sorry, I encountered an error: ${error.message}` }]);
    }
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      <header className="p-4 flex flex-wrap justify-between items-center border-b border-gray-800">
        <div className="flex items-center space-x-4 mb-2 md:mb-0">
          <h1 className="text-xl font-bold">WITCopilot</h1>
          <select 
            value={currentModel} 
            onChange={(e) => handleModelChange(e.target.value)}
            className="bg-gray-800 text-white rounded p-1"
          >
            <option value="Default">Default</option>
            <option value="CIS">CIS</option>
            <option value="CIS Senior Project">CIS Senior Project</option>
            <option value="E-Commerce">E-Commerce</option>
          </select>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleHistorySidebar}
            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm"
          >
            <History size={16} className="inline-block mr-1" /> History
          </button>
          <button
            onClick={toggleStudySidebar}
            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm"
          >
            <Book size={16} className="inline-block mr-1" /> Study
          </button>
          {isSignedIn ? (
            <button 
              onClick={() => setIsProfileOpen(true)} 
              className="p-1 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              <User size={20} />
            </button>
          ) : (
            <button 
              onClick={handleGoogleSignIn} 
              className="px-3 py-1 bg-white text-black rounded hover:bg-gray-200 transition-colors text-sm"
            >
              Sign In/Sign Up
            </button>
          )}
        </div>
      </header>
      <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          {isStudyMode ? (
            <div className="bg-gray-900 p-4 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Study Mode</h2>
              <p>Time remaining: {Math.floor(studyTimer / 60)}:{studyTimer % 60 < 10 ? '0' : ''}{studyTimer % 60}</p>
              <div className="mt-4">
                <h3 className="text-lg font-bold">Flashcard {currentFlashcardIndex + 1}/{flashcards.length}</h3>
                <div className="mt-2 p-4 bg-gray-800 rounded-lg cursor-pointer" onClick={flipFlashcard}>
  {isFlashcardFlipped ? (
    <div>
      <p className="text-sm text-gray-400">Definition:</p>
      <p className="text-lg font-bold">{flashcards[currentFlashcardIndex]?.back || "No content"}</p>
    </div>
  ) : (
    <div>
      <p className="text-sm text-gray-400">Word/Term:</p>
      <p className="text-lg font-bold">{flashcards[currentFlashcardIndex]?.front || "No content"}</p>
    </div>
  )}
</div>
                <div className="mt-4">
                  <h4 className="text-lg font-bold mb-2">Chat with AI about this flashcard:</h4>
                  <div className="space-y-2 mb-2">
                    {flashcardChat.map((message, index) => (
                      <div key={index} className={`p-2 rounded ${message.role === 'user' ? 'bg-blue-900' : 'bg-gray-800'}`}>
                        <strong>{message.role === 'user' ? 'You:' : 'AI:'}</strong> {message.content}
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Ask a question about this flashcard..."
                    className="w-full p-2 bg-gray-800 rounded"
                    onKeyPress={(e) => e.key === 'Enter' && e.target.value && handleFlashcardChat(e.target.value)}
                  />
                </div>
                <div className="mt-4 space-x-2">
                  <button 
                    onClick={flipFlashcard}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Flip Card
                  </button>
                  <button 
                    onClick={nextFlashcard}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Next Flashcard
                  </button>
                  <button 
                    onClick={stopStudying}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Stop Studying
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {showSuggestions && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-black">
                  {staticSuggestions[currentModel].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(suggestion)}
                      className="p-2 bg-gray-800 rounded-lg text-left text-sm hover:bg-gray-700 transition-colors"
                      disabled={isLoading}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              {messages.map((message, index) => (
                <div key={index} className={`p-4 rounded-lg ${
                  message.role === 'user' ? 'bg-gray-800 ml-auto' : 
                  message.role === 'assistant' ? 'bg-gray-900' :
                  'bg-gray-900 text-center italic'
                } max-w-[80%]`}>
                  <p className="text-sm text-white">{message.content}</p>
                  {message.isLoading && message.role === 'assistant' && (
                    <div className="mt-2 flex items-center">
                      <Loader className="animate-spin mr-2" size={16} />
                      <span className="text-xs italic text-white">{loadingMessage}</span>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        {(currentModel === 'CIS Senior Project' || currentModel === 'E-Commerce') && !isStudyMode && (
  <div className="w-64 bg-gray-900 p-4 overflow-y-auto hidden md:block">
    <h2 className="text-lg font-bold mb-4">Study Assistant</h2>
    <textarea
      value={studyInstructions}
      onChange={(e) => setStudyInstructions(e.target.value)}
      placeholder="Enter study instructions here..."
      className="w-full p-2 bg-gray-800 rounded mb-4 h-32"
    />
    <button 
      onClick={generateFlashcards}
      className="w-full p-2 bg-blue-600 rounded hover:bg-blue-700 mb-4 flex items-center justify-center"
      disabled={isGeneratingFlashcards}
    >
      {isGeneratingFlashcards ? (
        <>
          <Loader className="animate-spin mr-2" size={16} />
          Generating...
        </>
      ) : (
        'Generate Flashcards'
      )}
    </button>
    {flashcards.length > 0 && (
      <>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Study Timer (minutes)</label>
          <input
            type="number"
            value={Math.floor(studyTimer / 60)}
            onChange={(e) => setStudyTimer(parseInt(e.target.value) * 60)}
            className="w-full p-2 bg-gray-800 rounded"
          />
        </div>
        <button 
          onClick={startStudying}
          className="w-full p-2 bg-green-600 rounded hover:bg-green-700"
        >
          Start Studying
        </button>
      </>
    )}
  </div>
)}
      </main>
      <div className="p-4 border-t border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={startNewChat}
            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm"
            disabled={messages.length === 0 || isStudyMode}
          >
            New Chat
          </button>
          <span className="text-xs text-gray-400">{messageCount}/25 messages</span>
        </div>
        <div className="flex space-x-2 items-center h-10">
          <button 
            onClick={() => fileInputRef.current.click()} 
            className="h-full px-4 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors focus:outline-none focus:ring-1 focus:ring-white"
            disabled={isLoading || isStudyMode}
          >
            <Upload size={16} />
          </button>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Message WITCopilot..."
            className="flex-grow h-full px-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading || isStudyMode}
          />
          <button 
            onClick={() => handleSendMessage()} 
            disabled={isLoading || isStudyMode} 
            className="h-full px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-1 focus:ring-white disabled:opacity-50"
          >
            <Send size={16} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            className="hidden"
            disabled={isLoading || isStudyMode}
          />
        </div>
      </div>
      {isHistorySidebarOpen && (
        <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 p-4 overflow-y-auto z-50">
          <h2 className="text-lg font-bold mb-4">Chat History</h2>
          {isSignedIn ? (
            chatHistory.map((chat, index) => (
              <div 
                key={chat.id} 
                className="p-2 bg-gray-800 rounded mb-2 cursor-pointer hover:bg-gray-700"
                onClick={() => loadChatFromHistory(chat)}
              >
                Chat {chatHistory.length - index}
              </div>
            ))
          ) : (
            <p>Please sign in to view your chat history.</p>
          )}
        </div>
      )}
      {isStudySidebarOpen && (
        <div className="fixed inset-y-0 right-0 w-64 bg-gray-900 p-4 overflow-y-auto z-50">
          <h2 className="text-lg font-bold mb-4">Study Assistant for {currentModel}</h2>
          <textarea
            value={studyInstructions}
            onChange={(e) => setStudyInstructions(e.target.value)}
            placeholder="Enter study instructions here..."
            className="w-full p-2 bg-gray-800 rounded mb-4 h-32"
          />
          <button 
            onClick={generateFlashcards}
            className="w-full p-2 bg-blue-600 rounded hover:bg-blue-700 mb-4 flex items-center justify-center"
            disabled={isGeneratingFlashcards}
          >
            {isGeneratingFlashcards ? (
              <>
                <Loader className="animate-spin mr-2" size={16} />
                Generating...
              </>
            ) : (
              'Generate Flashcards'
            )}
          </button>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Study Timer (minutes)</label>
            <input
              type="number"
              value={Math.floor(studyTimer / 60)}
              onChange={(e) => setStudyTimer(parseInt(e.target.value) * 60)}
              className="w-full p-2 bg-gray-800 rounded"
            />
          </div>
          <button 
            onClick={startStudying}
            className="w-full p-2 bg-green-600 rounded hover:bg-green-700 mb-4"
            disabled={flashcards.length === 0}
          >
            Start Studying
          </button>
          <h3 className="text-lg font-bold mt-4 mb-2">Flashcards</h3>
          <div className="space-y-2">
            {flashcards.map((card, index) => (
              <div key={index} className="bg-gray-800 p-2 rounded">
                <p><strong>Front:</strong> {card.front}</p>
                <p><strong>Back:</strong> {card.back}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {isProfileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">User Profile</h2>
              <button onClick={() => setIsProfileOpen(false)} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <p><strong>Name:</strong> {user?.displayName}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>School:</strong> Wentworth Institute of Technology</p>
              <p><strong>Major:</strong> {selectedMajor || 'Not selected'}</p>
              <p><strong>Class:</strong> {selectedClass || 'Not selected'}</p>
              <p><strong>Current Assistant:</strong> {currentModel}</p>
              <p><strong>Joined Date:</strong> {user?.metadata.creationTime}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;