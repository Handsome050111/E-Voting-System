const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const User = require('../models/User');

// @desc    Cast a vote
// @route   POST /api/votes
// @access  Private (Voter)
const castVote = async (req, res) => {
    const { candidateId, electionId } = req.body;
    const voterId = req.user.id;

    try {
        // 1. Check if election is active
        const election = await Election.findById(electionId);
        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }
        if (election.status !== 'active') {
            return res.status(400).json({ message: 'Election is not active' });
        }

        // 2. Check if user has already voted
        const existingVote = await Vote.findOne({ voterId, electionId });
        if (existingVote) {
            return res.status(400).json({ message: 'You have already voted in this election' });
        }

        // 3. Record Vote
        const vote = await Vote.create({
            voterId,
            candidateId,
            electionId,
        });

        // 4. Update Candidate Vote Count
        const candidate = await Candidate.findById(candidateId);
        if (candidate) {
            candidate.voteCount += 1;
            await candidate.save();
        }

        // 5. Emit Socket Event (Real-time updates)
        if (req.io) {
            req.io.emit('voteUpdate', {
                electionId,
                candidateId,
                newCount: candidate ? candidate.voteCount : 0,
            });
        }

        res.status(201).json({ message: 'Vote cast successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user's history
// @route   GET /api/votes/history
// @access  Private
const getVoteHistory = async (req, res) => {
    try {
        const votes = await Vote.find({ voterId: req.user.id }).populate('candidateId', 'name party');
        res.status(200).json(votes);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

// @desc    Get all votes (Admin) - Audit Log
// @route   GET /api/votes
// @access  Private (Admin)
const getAllVotes = async (req, res) => {
    try {
        const votes = await Vote.find()
            .populate('voterId', 'name email')
            .populate('electionId', 'title')
            .select('-candidateId') // Maintain Ballot Secrecy
            .sort({ createdAt: -1 });

        res.status(200).json(votes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    castVote,
    getVoteHistory,
    getAllVotes,
};
