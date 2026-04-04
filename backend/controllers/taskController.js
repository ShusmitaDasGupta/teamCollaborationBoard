const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Board = require('../models/Board');

// Helper: check board access
const checkBoardAccess = async (boardId, userId, userRole) => {
  const board = await Board.findById(boardId);
  if (!board) return { error: 'Board not found', status: 404 };

  const isOwner = board.owner.toString() === userId.toString();
  const isMember = board.members.some(m => m.user.toString() === userId.toString());
  const isAdmin = userRole === 'admin';

  if (!isOwner && !isMember && !isAdmin) {
    return { error: 'Access denied to this board', status: 403 };
  }
  return { board };
};

// @desc    Get all tasks for a board
// @route   GET /api/tasks/board/:boardId
exports.getTasksByBoard = async (req, res) => {
  try {
    const access = await checkBoardAccess(req.params.boardId, req.user._id, req.user.role);
    if (access.error) return res.status(access.status).json({ message: access.error });

    const { status, priority, assignee } = req.query;
    const filter = { board: req.params.boardId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .sort({ order: 1, createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tasks (admin)
// @route   GET /api/tasks
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .populate('board', 'title')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .populate('board', 'title');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    const access = await checkBoardAccess(task.board._id, req.user._id, req.user.role);
    if (access.error) return res.status(access.status).json({ message: access.error });

    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create task
// @route   POST /api/tasks
exports.createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  try {
    const { title, description, status, priority, boardId, assignee, dueDate, tags } = req.body;

    const access = await checkBoardAccess(boardId, req.user._id, req.user.role);
    if (access.error) return res.status(access.status).json({ message: access.error });

    // Get max order for this board+status
    const maxOrder = await Task.findOne({ board: boardId, status: status || 'todo' })
      .sort({ order: -1 })
      .select('order');

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      board: boardId,
      assignee: assignee || null,
      createdBy: req.user._id,
      dueDate: dueDate || null,
      tags: tags || [],
      order: maxOrder ? maxOrder.order + 1 : 0
    });

    await task.populate('assignee', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const access = await checkBoardAccess(task.board, req.user._id, req.user.role);
    if (access.error) return res.status(access.status).json({ message: access.error });

    const { title, description, status, priority, assignee, dueDate, tags, order } = req.body;

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, status, priority, assignee, dueDate, tags, order },
      { new: true, runValidators: true }
    )
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');

    res.json({ message: 'Task updated successfully', task: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const access = await checkBoardAccess(task.board, req.user._id, req.user.role);
    if (access.error) return res.status(access.status).json({ message: access.error });

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task status (quick update for kanban drag)
// @route   PATCH /api/tasks/:id/status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const access = await checkBoardAccess(task.board, req.user._id, req.user.role);
    if (access.error) return res.status(access.status).json({ message: access.error });

    task.status = status;
    await task.save();

    res.json({ message: 'Task status updated', task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
