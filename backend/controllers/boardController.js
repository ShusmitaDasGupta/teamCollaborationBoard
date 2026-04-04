const { validationResult } = require('express-validator');
const Board = require('../models/Board');
const Task = require('../models/Task');

// @desc    Get all boards for current user
// @route   GET /api/boards
exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ],
      isArchived: false
    })
      .populate('owner', 'name email')
      .populate('members.user', 'name email')
      .populate('taskCount')
      .sort({ updatedAt: -1 });

    res.json({ boards });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all boards (admin)
// @route   GET /api/boards/all
exports.getAllBoards = async (req, res) => {
  try {
    const boards = await Board.find()
      .populate('owner', 'name email')
      .populate('members.user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ boards });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single board
// @route   GET /api/boards/:id
exports.getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    if (!board) return res.status(404).json({ message: 'Board not found' });

    const isOwner = board.owner._id.toString() === req.user._id.toString();
    const isMember = board.members.some(m => m.user._id.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isMember && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ board });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create board
// @route   POST /api/boards
exports.createBoard = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  try {
    const { title, description, color } = req.body;
    const board = await Board.create({
      title,
      description,
      color: color || '#6366f1',
      owner: req.user._id
    });

    await board.populate('owner', 'name email');
    res.status(201).json({ message: 'Board created successfully', board });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update board
// @route   PUT /api/boards/:id
exports.updateBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const isOwner = board.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Only board owner can update' });
    }

    const { title, description, color, isArchived } = req.body;
    const updated = await Board.findByIdAndUpdate(
      req.params.id,
      { title, description, color, isArchived },
      { new: true, runValidators: true }
    ).populate('owner', 'name email').populate('members.user', 'name email');

    res.json({ message: 'Board updated successfully', board: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete board
// @route   DELETE /api/boards/:id
exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const isOwner = board.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Only board owner or admin can delete' });
    }

    await Task.deleteMany({ board: req.params.id });
    await Board.findByIdAndDelete(req.params.id);

    res.json({ message: 'Board and all its tasks deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add member to board
// @route   POST /api/boards/:id/members
exports.addMember = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const isOwner = board.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only board owner can add members' });
    }

    const { userId, role } = req.body;
    const alreadyMember = board.members.some(m => m.user.toString() === userId);
    if (alreadyMember) return res.status(400).json({ message: 'User is already a member' });

    board.members.push({ user: userId, role: role || 'editor' });
    await board.save();
    await board.populate('members.user', 'name email');

    res.json({ message: 'Member added successfully', board });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove member from board
// @route   DELETE /api/boards/:id/members/:userId
exports.removeMember = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const isOwner = board.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only board owner can remove members' });
    }

    board.members = board.members.filter(m => m.user.toString() !== req.params.userId);
    await board.save();

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
