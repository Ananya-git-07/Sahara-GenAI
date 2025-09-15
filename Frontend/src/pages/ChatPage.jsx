import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- Helper Icon Components ---
const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 7.5v-1.5a6 6 0 0 0-6-6.75v-1.5a6 6 0 0 0-6 6.75v1.5m6-6.75a6 6 0 0 0 6-6.75v-1.5a6 6 0 0 0-12 0v1.5a6 6 0 0 0 6 6.75Z" />
  </svg>
);

const StopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-400">
    <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
  </svg>
);

const SpeakerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.768 59.768 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

// --- Browser Speech API for USER INPUT ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
}

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isApiSupported, setIsApiSupported] = useState(!!recognition);
    const navigate = useNavigate();
    const [playingIndex, setPlayingIndex] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const audioRef = useRef(null);

  // --- Audio Player Function ---
  const playAudio = (url) => {
      if (audioRef.current) {
          audioRef.current.pause();
      }
      const audio = new Audio(url);
      audio.play();
      audioRef.current = audio;
  };

  // --- Effects ---
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
    } else {
      setMessages([{
        sender: 'ai',
        text: "Namaste, I'm Sahara. It's a safe space here. Please feel free to share what's on your mind. I'm here to listen."
      }]);
    }
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!recognition) return;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
        setInput(transcript);
    };
    
    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
    };
}, []);

  // --- Handlers ---
    const handleListen = () => {
        if (!isApiSupported) {
            alert("Sorry, your browser does not support voice recognition.");
            return;
        }

        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        if (audioRef.current) {
            audioRef.current.pause();
        }

        if (isListening) {
            recognition.stop();
        } else {
            setInput('');
            recognition.start();
        }
    };

  const handleSend = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = input;
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/chat`;

      const response = await axios.post(apiUrl,
          { message: messageToSend },
          { headers: { Authorization: `Bearer ${token}` } }
      );

      const { reply, audioUrl } = response.data;
      const aiMessage = { sender: 'ai', text: reply, audioUrl };
      setMessages(prev => [...prev, aiMessage]);
      playAudio(audioUrl, messages.length);
    } catch (error) {
      if (error.response?.status === 403) {
        localStorage.clear();
        navigate('/login');
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: "I'm having trouble right now. Please try again." }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    localStorage.clear();
    navigate('/login');
  };

  // --- JSX ---
  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
      {/* Header */}
      <header className="relative p-6 border-b border-gray-700/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10"></div>
        <div className="relative flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Sahara
              </h1>
              <p className="text-xs text-gray-400">Your AI Companion</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 border border-gray-600/50"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Chat Messages */}
      <main className="flex-1 p-6 overflow-y-auto space-y-6">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex items-end gap-3 animate-fadeIn ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">S</span>
              </div>
            )}
            
            <div className={`relative group p-4 rounded-2xl max-w-sm md:max-w-md transition-all duration-300 hover:scale-[1.02] ${
              msg.sender === 'user' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 rounded-br-sm shadow-lg shadow-cyan-500/25' 
                : 'bg-gradient-to-r from-gray-700 to-gray-800 rounded-bl-sm shadow-lg shadow-gray-900/50 border border-gray-600/30'
            }`}>
              <p className="text-white whitespace-pre-wrap leading-relaxed">{msg.text}</p>

              {msg.sender === 'ai' && msg.audioUrl && (
                <>
                  <button
                    onClick={() => playAudio(msg.audioUrl, index)}
                    className="absolute -bottom-2 -right-2 p-2 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full hover:from-cyan-500 hover:to-blue-500 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25 hover:scale-110"
                    aria-label="Play message audio"
                  >
                    <SpeakerIcon />
                  </button>
                  {playingIndex === index && (
                    <div className="absolute -top-8 right-0 bg-cyan-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                      🎵 Playing
                    </div>
                  )}
                </>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">U</span>
              </div>
            )}
          </div>
        ))}

        {/* Sahara typing indicator */}
        {isLoading && (
          <div className="flex items-end gap-3 animate-fadeIn">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-r from-gray-700 to-gray-800 rounded-bl-sm max-w-xs border border-gray-600/30">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-150"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-300"></div>
                </div>
                <p className="text-gray-300 text-sm">Sahara is thinking...</p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input Footer */}
      <footer className="p-6 border-t border-gray-700/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 to-slate-900/50"></div>
        <div className="relative">
          <form onSubmit={handleSend} className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full p-4 pr-12 bg-gray-800/80 rounded-xl border border-gray-600/50 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/25 transition-all duration-200 text-white placeholder-gray-400"
                placeholder={isListening ? "🎤 Listening..." : "Share what's on your mind..."}
              />
              {input && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              )}
            </div>

            <button
              type="button"
              onClick={handleListen}
              disabled={!isApiSupported}
              className={`p-4 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                isListening 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/25 animate-pulse' 
                  : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-cyan-500 hover:to-blue-500 shadow-lg hover:shadow-cyan-500/25'
              }`}
            >
              {isListening ? <StopIcon /> : <MicIcon />}
            </button>

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/25 hover:scale-105 disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <SendIcon />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </form>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ChatPage;