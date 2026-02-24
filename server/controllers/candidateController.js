const Candidate = require('../models/Candidate');
const Election = require('../models/Election');

// @desc    Get candidates for an election
// @route   GET /api/candidates/:electionId
// @access  Public
const getCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.find({ electionId: req.params.electionId });
        res.status(200).json(candidates);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add candidate (Admin)
// @route   POST /api/candidates
// @access  Admin
const addCandidate = async (req, res) => {
    const { name, party, electionId } = req.body;

    try {
        // Check if election exists
        const election = await Election.findById(electionId);
        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        const candidate = await Candidate.create({
            name,
            party,
            electionId,
        });
        res.status(201).json(candidate);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

// @desc    Update candidate (Admin)
// @route   PUT /api/candidates/:id
// @access  Admin
const updateCandidate = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id);

        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        const { name, party } = req.body;

        candidate.name = name || candidate.name;
        candidate.party = party || candidate.party;

        const updatedCandidate = await candidate.save();
        res.status(200).json(updatedCandidate);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete candidate (Admin)
// @route   DELETE /api/candidates/:id
// @access  Admin
const deleteCandidate = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id);

        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        await candidate.deleteOne();
        res.status(200).json({ message: 'Candidate removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getCandidates,
    addCandidate,
    updateCandidate,
    deleteCandidate,
};
