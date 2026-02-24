import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import AuthContext from '../context/AuthContext';

const VoterActivity = () => {
    const { user } = useContext(AuthContext);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAuditLogs = async () => {
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            };
            const res = await api.get('/votes', config);
            setAuditLogs(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Navbar />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <header className="mb-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 text-white p-2 rounded-lg">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900">Voter Activity Log</h1>
                            <p className="mt-1 text-slate-600">A verifiable audit trail of participation (Ballot secrecy is maintained).</p>
                        </div>
                    </div>
                </header>

                <div className="flex justify-end mb-6">
                    <button
                        onClick={fetchAuditLogs}
                        disabled={loading}
                        className="btn-secondary flex items-center gap-2"
                    >
                        {loading ? (
                            <svg className="animate-spin h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        )}
                        {loading ? 'Refreshing...' : 'Refresh Log'}
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Voter</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Email</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Election</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Time & Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading && auditLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center text-slate-400">
                                            <div className="flex flex-col items-center">
                                                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                                <p>Loading audit logs...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : auditLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center text-slate-400 italic">
                                            <div className="flex flex-col items-center">
                                                <svg className="w-12 h-12 mb-3 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                No voting activity recorded yet.
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    auditLogs.map((log) => (
                                        <tr key={log._id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                                                        {log.voterId?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <span className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                        {log.voterId?.name || 'Deleted User'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                                {log.voterId?.email || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700 font-bold">
                                                <span className="bg-slate-100 px-3 py-1 rounded-md text-slate-600">
                                                    {log.electionId?.title || 'Deleted Election'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-tight border border-emerald-100 shadow-sm">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Verified
                                                </span>
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

export default VoterActivity;
