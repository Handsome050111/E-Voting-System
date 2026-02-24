import { useState, useEffect, useContext } from 'react';
import api, { getBaseURL } from '../utils/api';
import { Bar } from 'react-chartjs-2';
import AuthContext from '../context/AuthContext';
// ... rest of imports
import Navbar from '../components/Navbar';
import io from 'socket.io-client';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Results = () => {
    const [elections, setElections] = useState([]);
    const [selectedElection, setSelectedElection] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [chartData, setChartData] = useState(null);
    const { user } = useContext(AuthContext);
    const [userVotes, setUserVotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserVotes = async () => {
            if (user && user.role === 'voter') {
                try {
                    const config = {
                        headers: {
                            Authorization: `Bearer ${user.token || localStorage.getItem('token')}`,
                        },
                    };
                    const res = await api.get('/votes/history', config);
                    setUserVotes(res.data);
                } catch (error) {
                    console.error('Error fetching vote history:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        fetchUserVotes();
    }, [user]);

    useEffect(() => {
        const fetchElections = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                };
                const res = await api.get('/elections', config);
                // Backend now handles filtering for non-admins
                setElections(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchElections();
    }, []);

    const fetchCandidates = async (electionId) => {
        try {
            const res = await api.get(`/candidates/${electionId}`);
            setCandidates(res.data);
            updateChart(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const updateChart = (candidateData) => {
        const labels = candidateData.map(c => c.name);
        const data = candidateData.map(c => c.voteCount);

        setChartData({
            labels,
            datasets: [
                {
                    label: 'Total Votes',
                    data,
                    backgroundColor: [
                        'rgba(79, 70, 229, 0.7)', // Indigo
                        'rgba(16, 185, 129, 0.7)', // Emerald
                        'rgba(245, 158, 11, 0.7)', // Amber
                        'rgba(239, 68, 68, 0.7)',  // Red
                        'rgba(59, 130, 246, 0.7)', // Blue
                    ],
                    borderColor: [
                        'rgb(79, 70, 229)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 158, 11)',
                        'rgb(239, 68, 68)',
                        'rgb(59, 130, 246)',
                    ],
                    borderWidth: 1,
                    borderRadius: 8,
                    hoverBackgroundColor: 'rgba(79, 70, 229, 1)',
                },
            ],
        });
    };

    useEffect(() => {
        if (selectedElection) {
            const socket = io(getBaseURL());

            socket.on('voteUpdate', (data) => {
                if (data.electionId === selectedElection) {
                    setCandidates(prev => {
                        const newCandidates = prev.map(c =>
                            c._id === data.candidateId ? { ...c, voteCount: data.newCount } : c
                        );
                        updateChart(newCandidates);
                        return newCandidates;
                    });
                }
            });

            return () => socket.disconnect();
        }
    }, [selectedElection]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    font: { family: "'Inter', sans-serif" }
                },
                grid: {
                    color: 'rgba(0,0,0,0.05)'
                }
            },
            x: {
                grid: { display: false },
                ticks: { font: { family: "'Inter', sans-serif", weight: '600' } }
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Navbar />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <header className="mb-8 text-center max-w-2xl mx-auto">
                    <h1 className="text-3xl font-extrabold text-slate-900">Live Results</h1>
                    <p className="mt-2 text-slate-600">Real-time election statistics and vote counts.</p>
                </header>

                <div className="max-w-4xl mx-auto">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8">
                        <div className="text-center">
                            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Select Election</label>
                            <div className="relative inline-block w-full max-w-md">
                                <select
                                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none text-slate-900 font-medium"
                                    onChange={(e) => {
                                        setSelectedElection(e.target.value);
                                        if (e.target.value) fetchCandidates(e.target.value);
                                        else setChartData(null);
                                    }}
                                >
                                    <option value="">-- Choose an Election --</option>
                                    {elections.map(e => (
                                        <option key={e._id} value={e._id}>{e.title}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {selectedElection && chartData ? (
                        user && (user.role === 'admin' || userVotes.some(v => v.electionId === selectedElection)) ? (
                            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-slate-100 animate-slide-up">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-slate-800">Vote Distribution</h2>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        Live Updates Active
                                    </div>
                                </div>
                                <div className="h-[400px] w-full">
                                    <Bar options={options} data={chartData} />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-12 rounded-xl shadow-lg border border-slate-100 text-center animate-fade-in">
                                <div className="inline-block p-4 rounded-full bg-indigo-50 mb-6">
                                    <svg className="w-12 h-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">Results are Locked</h2>
                                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                                    To maintain the integrity of the election, you must cast your vote before viewing the current standings.
                                </p>
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="btn-primary px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
                                >
                                    Go to Vote Now
                                </button>
                            </div>
                        )
                    ) : (
                        <div className="text-center py-20 opacity-50">
                            <div className="inline-block p-6 rounded-full bg-slate-100 mb-4">
                                <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>
                            </div>
                            <p className="text-lg font-medium text-slate-500">Select an election to view results</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Results;
