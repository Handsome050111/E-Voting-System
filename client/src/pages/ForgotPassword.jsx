import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            await api.post('/auth/forgot-password', { email });
            setMessage('Password reset link has been sent to your email.');
        } catch (err) {
            setError(err.response?.data?.message || 'Error sending email');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="card w-full max-w-md space-y-8 animate-fade-in-up">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-slate-900">Reset Password</h2>
                        <p className="mt-2 text-sm text-slate-600">Enter your email to receive valid reset instructions.</p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {message && (
                            <div className="bg-green-50 border-l-4 border-green-500 p-4 text-green-700 text-sm rounded">
                                <p>{message}</p>
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm rounded">
                                <p>{error}</p>
                            </div>
                        )}

                        <div>
                            <label className="label">Email Address</label>
                            <input
                                type="email"
                                required
                                className="input-field"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="w-full btn-primary py-2.5 text-sm uppercase tracking-wide">
                            Send Reset Link
                        </button>
                    </form>

                    <div className="text-center text-sm text-slate-600">
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
