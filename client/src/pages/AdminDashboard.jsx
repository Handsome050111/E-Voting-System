import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import AuthContext from '../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [elections, setElections] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
    });
    const [selectedElectionId, setSelectedElectionId] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [candidateForm, setCandidateForm] = useState({ name: '', party: '' });

    const fetchElections = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            };
            const res = await api.get('/elections', config);
            setElections(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchCandidates = async (electionId) => {
        try {
            const res = await api.get(`/candidates/${electionId}`);
            setCandidates(res.data);
            setSelectedElectionId(electionId);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchAuditLogs = async () => {
        // Removed: Logic moved to dedicated /admin/activity page
    };

    useEffect(() => {
        fetchElections();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const now = new Date();

        // Allow a 5-minute buffer to account for form-filling time
        if (start < new Date(now.getTime() - 5 * 60000)) {
            alert('Start date cannot be in the past.');
            return;
        }

        if (end <= start) {
            alert('End date must be after start date.');
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            };
            await api.post('/elections', formData, config);
            fetchElections();
            setFormData({ title: '', description: '', startDate: '', endDate: '' });
            alert('Election Created Successfully');
        } catch (error) {
            alert('Error creating election');
        }
    };

    const deleteElection = async (id) => {
        if (window.confirm('Are you sure you want to delete this election? This action cannot be undone.')) {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                };
                await api.delete(`/elections/${id}`, config);
                fetchElections();
            } catch (error) {
                alert('Error deleting election');
            }
        }
    };

    const handleAddCandidate = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            };
            await api.post('/candidates', {
                ...candidateForm,
                electionId: selectedElectionId,
            }, config);
            setCandidateForm({ name: '', party: '' });
            fetchCandidates(selectedElectionId);
        } catch (error) {
            alert('Error adding candidate');
        }
    };

    const handleDeleteCandidate = async (candidateId) => {
        if (window.confirm('Delete candidate?')) {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                };
                await api.delete(`/candidates/${candidateId}`, config);
                fetchCandidates(selectedElectionId);
            } catch (error) {
                alert('Error deleting candidate');
            }
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            };
            await api.put(`/elections/${id}`, { status: newStatus }, config);
            fetchElections();
        } catch (error) {
            alert('Error updating status');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Navbar />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900">Admin Dashboard</h1>
                    <p className="mt-2 text-slate-600">Manage elections, candidates, and oversee the voting process.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Create Election Section */}
                    <div className="lg:col-span-1">
                        <section className="card sticky top-24">
                            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">New Election</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="label">Election Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="e.g. Annual Board Meeting"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Description</label>
                                    <textarea
                                        name="description"
                                        placeholder="Brief description..."
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="input-field h-24 resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="label">Start Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            className="input-field"
                                            required
                                            min={new Date().toISOString().slice(0, 16)}
                                        />
                                    </div>
                                    <div>
                                        <label className="label">End Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            className="input-field"
                                            required
                                            min={formData.startDate || new Date().toISOString().slice(0, 16)}
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="w-full btn-primary py-2.5 mt-2 flex justify-center items-center gap-2">
                                    <span>Create Election</span>
                                </button>
                            </form>
                        </section>
                    </div>

                    {/* Manage Elections Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded text-sm">{elections.length}</span>
                                Existing Elections
                            </h2>

                            {elections.length === 0 ? (
                                <div className="bg-white rounded-xl p-12 text-center border border-dashed border-slate-300">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900">No elections yet</h3>
                                    <p className="text-slate-500 mt-1">Create your first election to get started.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {elections.map((election) => (
                                        <div key={election._id} className="card group hover:border-indigo-200 transition-all">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="font-bold text-lg text-slate-900">{election.title}</h3>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${election.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                            {election.status === 'active' ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-600 mt-1 text-sm">{election.description}</p>
                                                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 font-medium">
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                            {new Date(election.startDate).toLocaleDateString()}
                                                        </span>
                                                        <span>&rarr;</span>
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                            {new Date(election.endDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                                                    <button
                                                        onClick={() => toggleStatus(election._id, election.status)}
                                                        className={`text-sm px-3 py-1 rounded transition-colors border ${election.status === 'active' ? 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100' : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'}`}
                                                    >
                                                        {election.status === 'active' ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button
                                                        onClick={() => fetchCandidates(election._id)}
                                                        className="btn-secondary text-sm flex-1 sm:flex-none"
                                                    >
                                                        Candidates
                                                    </button>
                                                    <button
                                                        onClick={() => deleteElection(election._id)}
                                                        className="btn-danger text-sm flex-1 sm:flex-none bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>

                {/* Candidate Modal Overlay */}
                {selectedElectionId && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Manage Candidates</h2>
                                    <p className="text-sm text-slate-500">Add or remove candidates for the selected election.</p>
                                </div>
                                <button onClick={() => setSelectedElectionId(null)} className="text-slate-400 hover:text-slate-600 p-1">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                <form onSubmit={handleAddCandidate} className="flex gap-3 mb-8 items-end bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <div className="flex-grow">
                                        <label className="label text-xs uppercase tracking-wide">Name</label>
                                        <input
                                            type="text"
                                            placeholder="Candidate Name"
                                            className="input-field"
                                            value={candidateForm.name}
                                            onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <label className="label text-xs uppercase tracking-wide">Party / Affiliation</label>
                                        <input
                                            type="text"
                                            placeholder="Party Name"
                                            className="input-field"
                                            value={candidateForm.party}
                                            onChange={(e) => setCandidateForm({ ...candidateForm, party: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn-primary h-[42px] px-6">
                                        Add
                                    </button>
                                </form>

                                <div>
                                    <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">Current Candidates</h3>
                                    {candidates.length === 0 ? (
                                        <p className="text-slate-500 text-center py-8">No candidates added yet.</p>
                                    ) : (
                                        <ul className="divide-y divide-slate-100 border border-slate-100 rounded-lg">
                                            {candidates.map((candidate) => (
                                                <li key={candidate._id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                                                            {candidate.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800">{candidate.name}</p>
                                                            <p className="text-sm text-slate-500">{candidate.party}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right mr-4">
                                                            <span className="block text-lg font-bold text-slate-700">{candidate.voteCount}</span>
                                                            <span className="text-xs text-slate-400 uppercase">Votes</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteCandidate(candidate._id)}
                                                            className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                                                            title="Delete Candidate"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                                <button onClick={() => setSelectedElectionId(null)} className="btn-secondary">Done</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
