const crypto = require('crypto');
const Invitation = require('../models/Invitation');
const Board = require('../models/Board');
const User = require('../models/User');
const { sendInvitationEmail } = require('../services/emailService');

// @desc    Send invitation email
// @route   POST /api/invitations/send
exports.sendInvitation = async (req, res) => {
  try {
    const { email, boardId, role } = req.body;

    if (!email || !boardId) {
      return res.status(400).json({ message: 'Email and boardId are required' });
    }

    // Check board exists and user has access
    const board = await Board.findById(boardId).populate('owner', 'name email');
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const isOwner = board.owner._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Only board owner can send invitations' });
    }

    // Check if already a member
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const isOwnerAlready = board.owner._id.toString() === existingUser._id.toString();
      const isMemberAlready = board.members.some(m => m.user.toString() === existingUser._id.toString());
      if (isOwnerAlready || isMemberAlready) {
        return res.status(400).json({ message: 'This user is already a board member' });
      }
    }

    // Check for existing pending invitation
    const existingInvite = await Invitation.findOne({
      email: email.toLowerCase(),
      board: boardId,
      status: 'pending'
    });
    if (existingInvite) {
      return res.status(400).json({ message: 'An invitation has already been sent to this email' });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Save invitation
    const invitation = await Invitation.create({
      board: boardId,
      invitedBy: req.user._id,
      email: email.toLowerCase(),
      token,
      role: role || 'editor',
      expiresAt
    });

    // Build invite link
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${token}`;

    // Send email
    await sendInvitationEmail({
      toEmail: email,
      inviterName: req.user.name,
      boardTitle: board.title,
      inviteLink
    });

    res.status(201).json({
      message: `Invitation sent to ${email}`,
      invitation: {
        _id: invitation._id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept invitation via token
// @route   GET /api/invitations/accept/:token
exports.acceptInvitation = async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await Invitation.findOne({ token }).populate('board');
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found or already used' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: `Invitation has already been ${invitation.status}` });
    }

    if (new Date() > invitation.expiresAt) {
      invitation.status = 'expired';
      await invitation.save();
      return res.status(400).json({ message: 'Invitation has expired. Please ask for a new one.' });
    }

    const board = await Board.findById(invitation.board._id);
    if (!board) return res.status(404).json({ message: 'Board no longer exists' });

    // Check if the logged-in user's email matches the invitation
    if (req.user.email !== invitation.email) {
      return res.status(403).json({
        message: `This invitation was sent to ${invitation.email}. Please log in with that account.`
      });
    }

    // Check if already a member
    const alreadyMember = board.members.some(m => m.user.toString() === req.user._id.toString());
    const isOwner = board.owner.toString() === req.user._id.toString();

    if (!alreadyMember && !isOwner) {
      board.members.push({ user: req.user._id, role: invitation.role });
      await board.save();
    }

    // Mark invitation as accepted
    invitation.status = 'accepted';
    await invitation.save();

    res.json({
      message: `You have successfully joined "${board.title}"!`,
      boardId: board._id,
      boardTitle: board.title
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Decline invitation via token
// @route   GET /api/invitations/decline/:token
exports.declineInvitation = async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await Invitation.findOne({ token });
    if (!invitation) return res.status(404).json({ message: 'Invitation not found' });

    invitation.status = 'declined';
    await invitation.save();

    res.json({ message: 'Invitation declined' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get invitation details (to show on invite page)
// @route   GET /api/invitations/info/:token
exports.getInvitationInfo = async (req, res) => {
  try {
    const invitation = await Invitation.findOne({ token: req.params.token })
      .populate('board', 'title color description')
      .populate('invitedBy', 'name email');

    if (!invitation) return res.status(404).json({ message: 'Invitation not found' });

    if (invitation.status !== 'pending' || new Date() > invitation.expiresAt) {
      return res.status(400).json({
        message: invitation.status === 'accepted'
          ? 'This invitation has already been accepted'
          : invitation.status === 'declined'
          ? 'This invitation was declined'
          : 'This invitation has expired'
      });
    }

    res.json({
      invitation: {
        email: invitation.email,
        role: invitation.role,
        board: invitation.board,
        invitedBy: invitation.invitedBy,
        expiresAt: invitation.expiresAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all invitations for a board
// @route   GET /api/invitations/board/:boardId
exports.getBoardInvitations = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const isOwner = board.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const invitations = await Invitation.find({ board: req.params.boardId })
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ invitations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel a pending invitation
// @route   DELETE /api/invitations/:id
exports.cancelInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id).populate('board');
    if (!invitation) return res.status(404).json({ message: 'Invitation not found' });

    const isOwner = invitation.board.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only board owner can cancel invitations' });
    }

    await Invitation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Invitation cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};