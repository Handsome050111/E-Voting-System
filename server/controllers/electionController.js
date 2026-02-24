const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Election = require('../models/Election');

// @desc    Get all elections (public/filtered)
// @route   GET /api/elections
// @access  Public (filtered for non-admins)
const getElections = async (req, res) => {
    try {
        let isAdmin = false;

        // Manually check for token to allow public access with admin escalation
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id);
                if (user && user.role === 'admin') {
                    isAdmin = true;
                }
            } catch (err) {
                // Token invalid or expired, treat as public
            }
        }

        let query = {};
        if (!isAdmin) {
            query.status = 'active'; // Strictly show ONLY active for secrecy
        }

        const elections = await Election.find(query);
        res.status(200).json(elections);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get election by ID
// @route   GET /api/elections/:id
// @access  Public
const getElectionById = async (req, res) => {
    try {
        const election = await Election.findById(req.params.id);
        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }
        res.status(200).json(election);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create election (Admin)
// @route   POST /api/elections
// @access  Admin
const createElection = async (req, res) => {
    const { title, description, startDate, endDate } = req.body;

    try {
        const election = await Election.create({
            title,
            description,
            startDate,
            endDate,
        });
        res.status(201).json(election);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

// @desc    Update election (Admin)
// @route   PUT /api/elections/:id
// @access  Admin
const updateElection = async (req, res) => {
    try {
        const election = await Election.findById(req.params.id);

        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        const { title, description, startDate, endDate, status } = req.body;

        election.title = title || election.title;
        election.description = description || election.description;
        election.startDate = startDate || election.startDate;
        election.endDate = endDate || election.endDate;
        election.status = status || election.status;

        const updatedElection = await election.save();
        res.status(200).json(updatedElection);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete election (Admin)
// @route   DELETE /api/elections/:id
// @access  Admin
const deleteElection = async (req, res) => {
    try {
        const election = await Election.findById(req.params.id);

        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        await election.deleteOne();
        res.status(200).json({ message: 'Election removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getElections,
    getElectionById,
    createElection,
    updateElection,
    deleteElection,
};
