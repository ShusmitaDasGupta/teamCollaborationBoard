import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import BoardModal from '../components/boards/BoardModal';
import './DashboardPage.css';

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6'];

export default function DashboardPage() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const navigate = useNavigate();

  const fetchBoards = useCallback(async () => {
    try {
      const { data } = await api.get('/boards');
      setBoards(data.boards);
    } catch {
      toast.error('Failed to load boards');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBoards(); }, [fetchBoards]);

  const handleDelete = async (boardId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this board and all its tasks?')) return;
    try {
      await api.delete(`/boards/${boardId}`);
      setBoards(prev => prev.filter(b => b._id !== boardId));
      toast.success('Board deleted');
    } catch {
      toast.error('Failed to delete board');
    }
  };

  const handleEdit = (board, e) => {
    e.stopPropagation();
    setEditingBoard(board);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingBoard(null);
  };

  const handleSaved = (board) => {
    if (editingBoard) {
      setBoards(prev => prev.map(b => b._id === board._id ? board : b));
    } else {
      setBoards(prev => [board, ...prev]);
    }
    handleModalClose();
  };

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'60px'}}><div className="spinner spinner-dark" /></div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">My Boards</h1>
          <p className="page-subtitle">{boards.length} board{boards.length !== 1 ? 's' : ''} in your workspace</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Board
        </button>
      </div>

      {boards.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📋</div>
          <h3>No boards yet</h3>
          <p>Create your first board to start collaborating</p>
          <button className="btn btn-primary" style={{marginTop:'16px'}} onClick={() => setShowModal(true)}>Create Board</button>
        </div>
      ) : (
        <div className="boards-grid">
          {boards.map(board => (
            <div key={board._id} className="board-card" onClick={() => navigate(`/boards/${board._id}`)}>
              <div className="board-card-header" style={{ background: board.color || '#6366f1' }}>
                <div className="board-card-actions">
                  <button className="btn btn-icon board-action-btn" onClick={(e) => handleEdit(board, e)} title="Edit">✏️</button>
                  <button className="btn btn-icon board-action-btn" onClick={(e) => handleDelete(board._id, e)} title="Delete">🗑️</button>
                </div>
                <div className="board-card-title">{board.title}</div>
              </div>
              <div className="board-card-body">
                {board.description && <p className="board-description">{board.description}</p>}
                <div className="board-meta">
                  <span className="board-tasks">📝 {board.taskCount || 0} tasks</span>
                  <span className="board-members">👥 {(board.members?.length || 0) + 1}</span>
                </div>
                <div className="board-owner">by {board.owner?.name}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <BoardModal
          board={editingBoard}
          colors={COLORS}
          onClose={handleModalClose}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
