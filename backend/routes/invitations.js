const express = require('express');
const {
  sendInvitation,
  acceptInvitation,
  declineInvitation,
  getInvitationInfo,
  getBoardInvitations,
  cancelInvitation
} = require('../controllers/invitationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes (no auth needed — user may not be logged in yet)
router.get('/info/:token', getInvitationInfo);
router.get('/decline/:token', declineInvitation);

// Protected routes (must be logged in)
router.post('/send', protect, sendInvitation);
router.get('/accept/:token', protect, acceptInvitation);
router.get('/board/:boardId', protect, getBoardInvitations);
router.delete('/:id', protect, cancelInvitation);

module.exports = router;