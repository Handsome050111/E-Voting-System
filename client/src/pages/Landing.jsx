import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Landing = () => {
    const { user } = useContext(AuthContext);
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchElections = async () => {
            try {
                const res = await api.get('/elections');
                // Only show active elections for privacy/secrecy
                const activeElections = res.data.filter(e => e.status === 'active');
                setElections(activeElections.slice(0, 3)); // Show top 3 active
                setLoading(false);
            } catch (error) {
                console.error('Error fetching elections:', error);
                setLoading(false);
            }
        };
        fetchElections();
    }, []);

    return (
        <div className="min-h-screen bg-white overflow-hidden">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
                <div className="absolute top-0 right-0 -z-10 w-2/3 h-full opacity-10">
                    <img src="/artifacts/voting_hero_bg.png" alt="Hero Background" className="w-full h-full object-cover" />
                </div>
                {/* ... same decorative blurs ... */}

                <div className="container mx-auto">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 font-bold text-xs uppercase tracking-widest mb-6 animate-fade-in">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            Next-Generation E-Voting
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] mb-8 animate-slide-up">
                            Secure your voice, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">Power your choice.</span>
                        </h1>
                        <p className="text-xl text-slate-500 leading-relaxed mb-10 max-w-2xl animate-slide-up [animation-delay:0.2s]">
                            Experience a blockchain-inspired, cryptographically secure voting platform designed for transparency, integrity, and absolute privacy.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up [animation-delay:0.4s]">
                            {user ? (
                                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="group bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-200 hover:bg-slate-900 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1">
                                    Go to Dashboard
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </Link>
                            ) : (
                                <Link to="/register" className="group bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-200 hover:bg-slate-900 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1">
                                    Create Your Account
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </Link>
                            )}
                            <Link to="/results" className="bg-white text-slate-900 border-2 border-slate-100 px-8 py-4 rounded-2xl font-black text-lg hover:border-indigo-100 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1">
                                View Election Results
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Live Polls Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div className="max-w-xl">
                            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight italic">Live Polling</h2>
                            <p className="text-lg text-slate-600">Secure voting is currently in progress for these active elections. Your voice matters.</p>
                        </div>
                        <Link to="/results" className="text-indigo-600 font-bold flex items-center gap-2 group">
                            View all elections
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="bg-slate-50 rounded-[2rem] h-64 animate-pulse"></div>
                            ))
                        ) : elections.length > 0 ? (
                            elections.map((election) => (
                                <div key={election._id} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-indigo-100 transition-all hover:-translate-y-2">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl">
                                            {election.title.charAt(0)}
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${election.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {election.status}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-3 line-clamp-1">{election.title}</h3>
                                    <p className="text-slate-500 mb-8 line-clamp-2 text-sm leading-relaxed">{election.description}</p>
                                    <Link
                                        to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : (election.status === 'active' ? '/login' : '/results')}
                                        className="w-full bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white text-slate-900 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        {user ? 'Go to Dashboard' : (election.status === 'active' ? 'Vote Now' : 'View Details')}
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold italic">No active polls at the moment. Check back soon!</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-slate-50 overflow-hidden relative border-t border-slate-100">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-20">
                        <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight italic">Unmatched Security</h2>
                        <p className="text-lg text-slate-600">We prioritize the integrity of every vote with state-of-the-art cryptographic safeguards.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-indigo-100 transition-all hover:-translate-y-2">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4">Encryption First</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">End-to-end encryption ensures your identity and choice remain anonymous and untransferable.</p>
                        </div>
                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-indigo-100 transition-all hover:-translate-y-2">
                            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-8">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4">OTP Verification</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">Multi-factor email authentication ensures only registered, verified voters can access the ballot.</p>
                        </div>
                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-indigo-100 transition-all hover:-translate-y-2">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4">Verifiable Audit</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">Transparent activity logs allow for independent auditing while maintaining the secrecy of individual ballots.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white pt-24 pb-12 border-t border-slate-100">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-1">
                            <Link to="/" className="flex items-center gap-2 mb-6">
                                <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span className="font-bold text-xl text-slate-900 tracking-tight">VoteSecure</span>
                            </Link>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8">
                                Empowering modern democracy with secure, transparent, and accessible e-voting technology.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-black text-slate-900 mb-6 uppercase tracking-wider text-xs">Platform</h4>
                            <ul className="space-y-4 text-sm text-slate-500 font-bold">
                                <li><Link to="/how-it-works" className="hover:text-indigo-600 transition-colors">How it works</Link></li>
                                <li><Link to="/results" className="hover:text-indigo-600 transition-colors">Election Results</Link></li>
                                <li><Link to="/login" className="hover:text-indigo-600 transition-colors">Voting Dashboard</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-black text-slate-900 mb-6 uppercase tracking-wider text-xs">Support</h4>
                            <ul className="space-y-4 text-sm text-slate-500 font-bold">
                                <li><Link to="/help" className="hover:text-indigo-600 transition-colors">Help Center</Link></li>
                                <li><Link to="/faq" className="hover:text-indigo-600 transition-colors">FAQ</Link></li>
                                <li><Link to="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-black text-slate-900 mb-6 uppercase tracking-wider text-xs">Connect</h4>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                                </a>
                                <a href="#" className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.245 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.063 1.366-.333 2.633-1.308 3.608-.975.975-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.063-2.633-.333-3.608-1.308-.975-.975-1.245-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.245 3.608-1.308 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.428.066-2.825.333-3.951 1.458-1.125 1.126-1.393 2.522-1.458 3.951-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.066 1.428.333 2.825 1.458 3.951 1.126 1.125 2.522 1.393 3.951 1.458 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.428-.066 2.825-.333 3.951-1.458 1.125-1.126 1.393-2.522 1.458-3.951.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.066-1.428-.333-2.825-1.458-3.951-1.126-1.125-2.522-1.393-3.951-1.458-1.28-.058-1.688-.072-4.947-.072zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 110 2.88 1.44 1.44 0 010-2.88z" /></svg>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <div className="flex flex-col gap-1">
                            <p>© 2026 VoteSecure Platform. All rights reserved.</p>
                            <p className="text-indigo-400">Developed by Khaista Rehman & Bushra Gul</p>
                        </div>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
                            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
                            <a href="#" className="hover:text-indigo-600 transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slide-up {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 1.2s ease-out forwards; }
            `}} />
        </div>
    );
};

export default Landing;
