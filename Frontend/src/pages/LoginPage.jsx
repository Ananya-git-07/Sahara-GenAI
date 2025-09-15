import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
    try {
            // --- THIS IS THE CHANGE ---
            const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`;

            const response = await axios.post(apiUrl, { username, password });
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            navigate('/chat');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 px-4 py-8">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Main login card */}
                <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
                    {/* Header with gradient */}
                    <div className="relative p-8 pb-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10"></div>
                        <div className="relative text-center">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/25">
                                <span className="text-white font-bold text-2xl">S</span>
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                                Welcome Back
                            </h1>
                            <p className="text-gray-400">Log in to continue your session with Sahara</p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="px-8 pb-8">
                        <form onSubmit={handleLogin} className="space-y-6">
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
                                            className="w-full p-4 bg-gray-700/50 rounded-xl border border-gray-600/50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/25 focus:bg-gray-700/80 transition-all duration-200 text-white placeholder-gray-400"
                                            placeholder="Enter your username"
                                            required
                                        />
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/0 to-blue-500/0 hover:from-cyan-500/5 hover:to-blue-500/5 transition-all duration-200 pointer-events-none"></div>
                                    </div>
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
                                            className="w-full p-4 bg-gray-700/50 rounded-xl border border-gray-600/50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/25 focus:bg-gray-700/80 transition-all duration-200 text-white placeholder-gray-400"
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/0 to-blue-500/0 hover:from-cyan-500/5 hover:to-blue-500/5 transition-all duration-200 pointer-events-none"></div>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <p className="text-red-400 text-sm text-center font-medium">{error}</p>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full p-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-cyan-500/25 hover:scale-[1.02] disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Signing in...
                                    </>
                                ) : (
                                    'Log In'
                                )}
                            </button>
                        </form>

                        {/* Register link */}
                        <div className="mt-6 pt-6 border-t border-gray-700/50">
                            <p className="text-sm text-center text-gray-400">
                                Need an account?{' '}
                                <Link 
                                    to="/register" 
                                    className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors duration-200 hover:underline"
                                >
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Additional info */}
                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        Secure login powered by advanced encryption
                    </p>
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

export default LoginPage;