const express = require('express');
const router = express.Router();
const {
    getElections,
    getElectionById,
    createElection,
    updateElection,
    deleteElection,
} = require('../controllers/electionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getElections).post(protect, admin, createElection);
router
    .route('/:id')
    .get(getElectionById)
    .put(protect, admin, updateElection)
    .delete(protect, admin, deleteElection);

module.exports = router;
