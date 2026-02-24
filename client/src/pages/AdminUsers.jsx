import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import AuthContext from '../context/AuthContext';

const AdminUsers = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            };
            const res = await api.get('/auth/users', config);
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            setError('Error fetching users');
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id, userName) => {
        if (id === user._id) {
            alert('You cannot delete your own account');
            return;
        }

        if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                };
                await api.delete(`/auth/users/${id}`, config);
                setUsers(users.filter(u => u._id !== id));
                alert('User deleted successfully');
            } catch (err) {
                alert(err.response?.data?.message || 'Error deleting user');
            }
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Navbar />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">User Management</h1>
                        <p className="mt-2 text-slate-600">View and manage all registered users in the system.</p>
                    </div>
                    <button
                        onClick={fetchUsers}
                        className="btn-secondary flex items-center gap-2"
                        disabled={loading}
                    >
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </header>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-3 border border-red-100">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">User</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Role</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Joined</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading && users.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                                <p className="text-slate-500">Loading users...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center text-slate-400 italic">
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((u) => (
                                        <tr key={u._id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800">{u.name}</div>
                                                        <div className="text-xs text-slate-500">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 text-xs font-bold ${u.isVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                    <div className={`w-2 h-2 rounded-full ${u.isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                                    {u.isVerified ? 'Verified' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteUser(u._id, u.name)}
                                                    disabled={u._id === user._id}
                                                    className={`p-2 rounded-lg transition-colors ${u._id === user._id ? 'text-slate-300 cursor-not-allowed' : 'text-red-400 hover:bg-red-50 hover:text-red-600'}`}
                                                    title={u._id === user._id ? 'You cannot delete yourself' : 'Delete User'}
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
