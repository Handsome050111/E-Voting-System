import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        try {
            await api.post(`/auth/reset-password/${token}`, { password });
            setMessage('Password has been reset successfully. Redirecting to login...');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error resetting password');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="card w-full max-w-md space-y-8 animate-fade-in-up">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-slate-900">Set New Password</h2>
                        <p className="mt-2 text-sm text-slate-600">Please enter your new password below.</p>
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

                        <div className="space-y-4">
                            <div>
                                <label className="label">New Password</label>
                                <input
                                    type="password"
                                    required
                                    className="input-field"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="label">Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    className="input-field"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full btn-primary py-2.5 text-sm uppercase tracking-wide">
                            Reset Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
