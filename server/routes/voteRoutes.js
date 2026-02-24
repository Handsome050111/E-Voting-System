const express = require('express');
const router = express.Router();
const { castVote, getVoteHistory, getAllVotes } = require('../controllers/voteController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, castVote);
router.get('/', protect, admin, getAllVotes);
router.get('/history', protect, getVoteHistory);

module.exports = router;
