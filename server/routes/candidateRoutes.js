const express = require('express');
const router = express.Router();
const {
    getCandidates,
    addCandidate,
    updateCandidate,
    deleteCandidate,
} = require('../controllers/candidateController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, admin, addCandidate);
router.route('/:electionId').get(getCandidates);
router
    .route('/:id')
    .put(protect, admin, updateCandidate)
    .delete(protect, admin, deleteCandidate);

module.exports = router;
