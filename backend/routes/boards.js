const express = require('express');
const { body } = require('express-validator');
const {
  getBoards, getAllBoards, getBoard,
  createBoard, updateBoard, deleteBoard,
  addMember, removeMember
} = require('../controllers/boardController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getBoards);
router.get('/all', adminOnly, getAllBoards);
router.get('/:id', getBoard);

router.post('/', [
  body('title').trim().notEmpty().withMessage('Board title is required')
], createBoard);

router.put('/:id', updateBoard);
router.delete('/:id', deleteBoard);

router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

module.exports = router;
