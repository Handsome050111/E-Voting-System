import { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="font-bold text-xl text-slate-900 tracking-tight">VoteSecure</span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <>
                                {user.role === 'voter' ? (
                                    <Link
                                        to="/dashboard"
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'}`}
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            to="/admin"
                                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'}`}
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            to="/admin/activity"
                                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin/activity') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'}`}
                                        >
                                            Voter Activity
                                        </Link>
                                        <Link
                                            to="/admin/users"
                                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin/users') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'}`}
                                        >
                                            Manage Users
                                        </Link>
                                    </>
                                )}
                                <Link
                                    to="/results"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/results') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'}`}
                                >
                                    Results
                                </Link>

                                <div className="h-6 w-px bg-slate-200 mx-2"></div>

                                <div className="flex items-center gap-3">
                                    <div className="text-sm text-slate-700">
                                        <span className="text-slate-400 mr-1">Hi,</span>
                                        <span className="font-medium">{user.name}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors">Login</Link>
                                <Link to="/register" className="btn-primary text-sm px-4 py-2">Register</Link>
                            </div>
                        )}
                    </div>

                    <div className="flex w-full md:hidden items-center justify-end">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-500 hover:text-slate-700 focus:outline-none">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-b border-slate-200 shadow-lg absolute w-full left-0">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {user ? (
                            <>
                                {user.role === 'voter' ? (
                                    <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50">Dashboard</Link>
                                ) : (
                                    <>
                                        <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50">Dashboard</Link>
                                        <Link to="/admin/activity" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50">Voter Activity</Link>
                                        <Link to="/admin/users" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50">Manage Users</Link>
                                    </>
                                )}
                                <Link to="/results" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50">Results</Link>
                                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50">Login</Link>
                                <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-50">Register</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
