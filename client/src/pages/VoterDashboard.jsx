import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import AuthContext from '../context/AuthContext';

const VoterDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [elections, setElections] = useState([]);
    const [votedElections, setVotedElections] = useState({}); // Stores { electionId: candidateName }
    const [candidates, setCandidates] = useState({});
    const [selectedElection, setSelectedElection] = useState(null);

    // Account Deletion State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteEmail, setDeleteEmail] = useState('');
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchElections = async () => {
        try {
            const res = await api.get('/elections');
            setElections(res.data.filter(e => e.status === 'active'));
        } catch (error) {
            console.error(error);
        }
    };

    const fetchVotes = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            };
            const res = await api.get('/votes/history', config);
            const mapping = {};
            res.data.forEach(v => {
                mapping[v.electionId] = v.candidateId?.name || 'Unknown';
            });
            setVotedElections(mapping);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchCandidates = async (electionId) => {
        if (candidates[electionId]) return;
        try {
            const res = await api.get(`/candidates/${electionId}`);
            setCandidates(prev => ({ ...prev, [electionId]: res.data }));
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchElections();
        if (user) fetchVotes();
    }, [user]);

    const handleVote = async (electionId, candidateId) => {
        // Optimistic visual update could happen here, but simplest is to just wait for server
        if (window.confirm('Confirm your vote? This cannot be changed.')) {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                };
                await api.post('/votes', { electionId, candidateId }, config);
                alert('Vote Cast Successfully!');
                fetchVotes();
            } catch (error) {
                alert(error.response?.data?.message || 'Error casting vote');
            }
        }
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        setDeleteError('');
        setIsDeleting(true);

        try {
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                data: { email: deleteEmail, password: deletePassword }
            };
            const res = await api.delete('/auth/me', config);

            alert(res.data.message || 'Account successfully deleted.');
            setShowDeleteModal(false);
            logout();
        } catch (error) {
            setDeleteError(error.response?.data?.message || 'Error deleting account');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Navbar />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <header className="mb-8 text-center max-w-2xl mx-auto">
                    <h1 className="text-3xl font-extrabold text-slate-900">Active Elections</h1>
                    <p className="mt-2 text-slate-600">Cast your vote securely in the ongoing elections below.</p>
                </header>

                {elections.length === 0 ? (
                    <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-12 text-center border border-dashed border-slate-300">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 text-indigo-300 mb-6">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No active elections</h3>
                        <p className="text-slate-500 mt-2">Check back later for upcoming voting events.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {elections.map((election) => {
                            const hasVoted = !!votedElections[election._id];
                            const votedFor = votedElections[election._id];

                            return (
                                <div key={election._id} className={`bg-white rounded-xl shadow-sm border transition-shadow duration-300 hover:shadow-lg flex flex-col ${hasVoted ? 'border-green-200' : 'border-slate-200'}`}>
                                    <div className={`h-2 rounded-t-xl w-full ${hasVoted ? 'bg-green-500' : 'bg-indigo-600'}`}></div>
                                    <div className="p-6 flex-grow">
                                        <div className="flex justify-between items-start mb-4">
                                            <h2 className="text-xl font-bold text-slate-900 line-clamp-1">{election.title}</h2>
                                            {hasVoted && (
                                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                                                    Voted
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-slate-600 text-sm mb-6 min-h-[40px] line-clamp-2">{election.description}</p>

                                        <div className="flex items-center text-xs text-slate-400 font-medium mb-6">
                                            <span>Ends {new Date(election.endDate).toLocaleString()}</span>
                                        </div>

                                        {!hasVoted ? (
                                            <button
                                                onClick={() => {
                                                    if (selectedElection === election._id) {
                                                        setSelectedElection(null);
                                                    } else {
                                                        setSelectedElection(election._id);
                                                        fetchCandidates(election._id);
                                                    }
                                                }}
                                                className={`w-full py-3 rounded-lg font-bold transition-all ${selectedElection === election._id
                                                    ? 'bg-slate-100 text-slate-700'
                                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                                                    }`}
                                            >
                                                {selectedElection === election._id ? 'Close Ballot' : 'View Candidates'}
                                            </button>
                                        ) : (
                                            <div className="w-full py-3 bg-green-50 text-green-700 font-black rounded-xl border border-green-100 flex flex-col items-center justify-center gap-1 shadow-inner">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                    <span>Vote Submitted</span>
                                                </div>
                                                <span className="text-xs uppercase tracking-widest opacity-60">
                                                    Voted for {votedFor}
                                                </span>
                                            </div>
                                        )}

                                        {selectedElection === election._id && !hasVoted && (
                                            <div className="mt-6 pt-6 border-t border-slate-100 animate-fade-in">
                                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Select a Candidate</h3>
                                                {candidates[election._id] ? (
                                                    <div className="space-y-3">
                                                        {candidates[election._id].map(candidate => (
                                                            <div key={candidate._id} className="group flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer" onClick={() => handleVote(election._id, candidate._id)}>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs group-hover:bg-indigo-200 group-hover:text-indigo-700">
                                                                        {candidate.name.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-slate-900 group-hover:text-indigo-900">{candidate.name}</p>
                                                                        <p className="text-xs text-slate-500 group-hover:text-indigo-600">{candidate.party}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="w-6 h-6 rounded-full border-2 border-slate-300 group-hover:border-indigo-500 flex items-center justify-center">
                                                                    <div className="w-3 h-3 rounded-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-center py-4">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Danger Zone */}
                <div className="mt-16 pt-8 border-t border-slate-200 max-w-2xl mx-auto text-center flex flex-col items-center">
                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100 w-full">
                        <h3 className="text-xl font-bold text-red-600 mb-2">Danger Zone</h3>
                        <p className="text-slate-600 mb-6 text-sm">Permanently delete your account and all associated personal data from VoteSecure.</p>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm"
                        >
                            Delete My Account
                        </button>
                    </div>
                </div>

                {/* Delete Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-slate-100">
                            <div className="p-6 bg-red-50 border-b border-red-100 flex items-center gap-3 text-red-700">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                <h3 className="text-xl font-bold">Delete Account</h3>
                            </div>

                            <form onSubmit={handleDeleteAccount} className="p-6">
                                <p className="text-slate-600 text-sm mb-6">
                                    This action is <strong className="text-red-600">permanent</strong> and cannot be undone. Please confirm your identity to proceed.
                                </p>

                                {deleteError && (
                                    <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm mb-4 font-medium border border-red-200">
                                        {deleteError}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                            value={deleteEmail}
                                            onChange={(e) => setDeleteEmail(e.target.value)}
                                            placeholder="Verify your email"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                        <input
                                            type="password"
                                            required
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                            value={deletePassword}
                                            onChange={(e) => setDeletePassword(e.target.value)}
                                            placeholder="Enter your password"
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setDeleteError('');
                                            setDeleteEmail('');
                                            setDeletePassword('');
                                        }}
                                        className="flex-1 py-2 px-4 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                                        disabled={isDeleting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isDeleting}
                                        className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete Account'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoterDashboard;
