import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- Helper Icon Components ---
const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 7.5v-1.5a6 6 0 0 0-6-6.75v-1.5a6 6 0 0 0-6 6.75v1.5m6-6.75a6 6 0 0 0 6-6.75v-1.5a6 6 0 0 0-12 0v1.5a6 6 0 0 0 6 6.75Z" />
  </svg>
);

const StopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-500 animate-pulse">
    <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3-3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
  </svg>
);

const SpeakerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
  </svg>
);

// --- Browser Speech API for USER INPUT ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  recognition.continuous = false;
  recognition.lang = 'en-IN';
}

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isApiSupported, setIsApiSupported] = useState(!!recognition);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // 👈 new state
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  // --- Audio Player Function ---
  const playAudio = (url, index = null) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);

    audio.onplay = () => setPlayingIndex(index);
    audio.onended = () => setPlayingIndex(null);

    audio.play().catch(err => {
      console.warn("Autoplay blocked:", err);
    });

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
      setInput(event.results[0][0].transcript);
    };
    recognition.onerror = () => setIsListening(false);
  }, []);

  // --- Handlers ---
  const handleListen = () => {
    if (!isApiSupported) {
      alert("Sorry, your browser does not support voice recognition.");
      return;
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
    setIsLoading(true); // 👈 show typing indicator

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post('http://localhost:5001/api/chat',
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
      setIsLoading(false); // 👈 hide typing indicator
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
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      <header className="flex justify-between items-center p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Sahara</h1>
        <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white transition">Logout</button>
      </header>

      <main className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`relative group p-3 rounded-xl max-w-sm md:max-w-md ${msg.sender === 'user' ? 'bg-cyan-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
              <p className="text-white whitespace-pre-wrap">{msg.text}</p>

              {msg.sender === 'ai' && msg.audioUrl && (
                <>
                  <button
                    onClick={() => playAudio(msg.audioUrl, index)}
                    className="absolute -bottom-2 -right-2 p-1 bg-gray-600 rounded-full hover:bg-gray-500 transition"
                    aria-label="Play message audio"
                  >
                    <SpeakerIcon />
                  </button>
                  {playingIndex === index && (
                    <p className="text-xs text-cyan-400 mt-1">🔊 Now Playing…</p>
                  )}
                </>
              )}
            </div>
          </div>
        ))}

        {/* Sahara typing indicator */}
        {isLoading && (
          <div className="flex items-end gap-2 justify-start">
            <div className="p-3 rounded-xl bg-gray-700 rounded-bl-none max-w-xs">
              <p className="text-white flex gap-1">
                Sahara is typing
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-150">.</span>
                <span className="animate-bounce delay-300">.</span>
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:border-cyan-500 transition"
            placeholder={isListening ? "Listening..." : "Share what's on your mind..."}
          />
          <button
            type="button"
            onClick={handleListen}
            disabled={!isApiSupported}
            className={`p-3 rounded-lg transition ${isListening ? 'bg-red-500/20' : 'bg-gray-600 hover:bg-gray-700'} disabled:opacity-50`}
          >
            {isListening ? <StopIcon /> : <MicIcon />}
          </button>
          <button
            type="submit"
            disabled={isLoading} // 👈 disable when loading
            className={`px-5 py-3 rounded-lg font-bold transition flex items-center justify-center ${isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700'}`}
          >
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            ) : (
              "Send"
            )}
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatPage;
