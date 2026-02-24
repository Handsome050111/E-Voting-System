import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await register(name, email, password, 'voter');
            navigate('/verify-otp', { state: { email: res.email, debugOtp: res.debugOtp } });
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="card w-full max-w-md space-y-8 animate-fade-in-up">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-slate-900">Create Account</h2>
                        <p className="mt-2 text-sm text-slate-600">Join the platform to cast your secure vote.</p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm rounded">
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="label">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
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
                            <div>
                                <label className="label">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="input-field"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={6}
                                />
                                <p className="text-xs text-slate-500 mt-1">Must be at least 6 characters.</p>
                            </div>
                        </div>

                        <button type="submit" className="w-full btn-primary py-2.5 text-sm uppercase tracking-wide">
                            Create Account
                        </button>
                    </form>

                    <div className="text-center text-sm text-slate-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
