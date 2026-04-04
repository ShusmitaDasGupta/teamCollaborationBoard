const express = require('express');
const { body } = require('express-validator');
const {
  getTasksByBoard, getAllTasks, getTask,
  createTask, updateTask, deleteTask, updateTaskStatus
} = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', adminOnly, getAllTasks);
router.get('/board/:boardId', getTasksByBoard);
router.get('/:id', getTask);

router.post('/', [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('boardId').notEmpty().withMessage('Board ID is required')
], createTask);

router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/status', updateTaskStatus);

module.exports = router;
