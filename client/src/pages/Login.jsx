import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const location = useLocation();
    const [successMsg, setSuccessMsg] = useState(location.state?.message || '');

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
        setSuccessMsg('');
        try {
            const data = await login(email, password);
            if (data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (error) {
            if (error.response?.data?.needsVerification) {
                navigate('/verify-otp', { state: { email: error.response.data.email } });
            } else {
                setError(error.response?.data?.message || 'Invalid email or password.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="card w-full max-w-md space-y-8 animate-fade-in-up">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-slate-900">Welcome Back</h2>
                        <p className="mt-2 text-sm text-slate-600">Sign in to your account to vote or manage elections.</p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm rounded transition-all">
                                <p>{error}</p>
                            </div>
                        )}

                        {successMsg && (
                            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 text-emerald-700 text-sm rounded transition-all">
                                <p>{successMsg}</p>
                            </div>
                        )}

                        <div className="space-y-4">
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
                                <div className="flex items-center justify-between">
                                    <label className="label">Password</label>
                                    <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Forgot password?</Link>
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="input-field"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full btn-primary py-2.5 text-sm uppercase tracking-wide">
                            Sign In
                        </button>
                    </form>

                    <div className="text-center text-sm text-slate-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Register here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
