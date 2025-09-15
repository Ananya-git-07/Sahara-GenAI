import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/auth/register`;
            
            const response = await axios.post(apiUrl, { username, password });
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            navigate('/chat');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 px-4 py-8">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Main register card */}
                <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
                    {/* Header with gradient */}
                    <div className="relative p-8 pb-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10"></div>
                        <div className="relative text-center">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/25">
                                <span className="text-white font-bold text-2xl">S</span>
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                                Join Sahara
                            </h1>
                            <p className="text-gray-400">Create your anonymous account to start talking</p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="px-8 pb-8">
                        <form onSubmit={handleRegister} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-300 block mb-2">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full p-4 bg-gray-700/50 rounded-xl border border-gray-600/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 focus:bg-gray-700/80 transition-all duration-200 text-white placeholder-gray-400"
                                            placeholder="Choose a unique username"
                                            required
                                        />
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 to-teal-500/0 hover:from-emerald-500/5 hover:to-teal-500/5 transition-all duration-200 pointer-events-none"></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        This will be your anonymous identity
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-300 block mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full p-4 bg-gray-700/50 rounded-xl border border-gray-600/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 focus:bg-gray-700/80 transition-all duration-200 text-white placeholder-gray-400"
                                            placeholder="Create a secure password"
                                            required
                                        />
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 to-teal-500/0 hover:from-emerald-500/5 hover:to-teal-500/5 transition-all duration-200 pointer-events-none"></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Keep this safe - you'll need it to access your account
                                    </p>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <p className="text-red-400 text-sm text-center font-medium">{error}</p>
                                </div>
                            )}

                            {/* Privacy notice */}
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                <p className="text-emerald-400 text-xs text-center">
                                    🔒 Your privacy is protected. No personal information is required.
                                </p>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full p-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                                        </svg>
                                        Create Account
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Login link */}
                        <div className="mt-6 pt-6 border-t border-gray-700/50">
                            <p className="text-sm text-center text-gray-400">
                                Already have an account?{' '}
                                <Link 
                                    to="/login" 
                                    className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors duration-200 hover:underline"
                                >
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Additional info */}
                <div className="mt-8 text-center space-y-2">
                    <p className="text-gray-500 text-sm">
                        Join thousands of users in anonymous, safe conversations
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                            </svg>
                            Anonymous
                        </span>
                        <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                            </svg>
                            Secure
                        </span>
                        <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                            </svg>
                            Supportive
                        </span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default RegisterPage;