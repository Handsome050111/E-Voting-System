import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';

const VerifyOTP = () => {
    // OTP State initialized lower down based on location hook
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState('');
    const [countdown, setCountdown] = useState(30);

    const navigate = useNavigate();
    const location = useLocation();

    // Get email and debugOtp from location state (passed from Register page)
    const email = location.state?.email;
    const debugOtp = location.state?.debugOtp;

    // Pre-fill OTP if backend provided a debug OTP due to email failure
    const [otp, setOtp] = useState(debugOtp || '');
    const { login } = useContext(AuthContext);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const handleResend = async () => {
        if (!email) return;
        setResendLoading(true);
        setError('');
        setResendMessage('');

        try {
            const res = await api.post('/auth/resend-otp', { email });
            setResendMessage(res.data.message);
            setCountdown(30); // Reset timer on success
        } catch (err) {
            setError(err.response?.data?.message || 'Resend failed');
        } finally {
            setResendLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Missing email information. Please try registering again.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/verify-otp', { email, otp });

            if (res.data.success) {
                // Manually set user in context if needed, or redirect to login
                // Here we'll redirect to login after a short delay
                setTimeout(() => {
                    navigate('/login', { state: { message: 'Verification successful! Please login.' } });
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-slate-100 animate-fade-in">
                <div className="text-center mb-8">
                    <div className="bg-indigo-100 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Verify Your Email</h1>
                    <p className="text-slate-500 mt-2">We've sent a 4-digit code to <span className="font-semibold text-slate-700">{email || 'your email'}</span></p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm flex items-center gap-3 border border-red-100">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {error}
                    </div>
                )}

                {resendMessage && (
                    <div className="bg-emerald-50 text-emerald-600 p-4 rounded-lg mb-6 text-sm flex items-center gap-3 border border-emerald-100 italic">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {resendMessage}
                    </div>
                )}

                {debugOtp && (
                    <div className="bg-amber-50 text-amber-600 p-4 rounded-lg mb-6 text-sm flex items-center gap-3 border border-amber-200">
                        <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <div>
                            <p className="font-bold">Email Config Error</p>
                            <p>We couldn't send the email because your Render variables are misconfigured. However, your account was created! We've pre-filled the OTP below to let you continue.</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-2 block">Enter verification code</label>
                        <input
                            type="text"
                            maxLength="4"
                            placeholder="0000"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otp.length < 4}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Verify Account'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-500">
                        Didn't receive the code?{' '}
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendLoading || countdown > 0}
                            className={`font-bold transition-colors ${countdown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-indigo-600 hover:underline'}`}
                        >
                            {resendLoading ? 'Sending...' : (countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP')}
                        </button>
                    </p>
                    <button
                        onClick={() => navigate('/register')}
                        className="mt-4 text-xs font-semibold text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 mx-auto"
                    >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to registration
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
