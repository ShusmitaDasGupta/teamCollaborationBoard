import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import TaskModal from '../components/tasks/TaskModal';
import TaskCard from '../components/tasks/TaskCard';
import BoardMembersModal from '../components/boards/BoardMembersModal';
import './BoardPage.css';

const COLUMNS = [
  { key: 'todo', label: 'To Do', emoji: '📋' },
  { key: 'in-progress', label: 'In Progress', emoji: '⚡' },
  { key: 'review', label: 'Review', emoji: '👀' },
  { key: 'done', label: 'Done', emoji: '✅' }
];

export default function BoardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState('todo');
  const [dragging, setDragging] = useState(null);
  const [showMembers, setShowMembers] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [boardRes, tasksRes] = await Promise.all([
        api.get(`/boards/${id}`),
        api.get(`/tasks/board/${id}`)
      ]);
      setBoard(boardRes.data.board);
      setTasks(tasksRes.data.tasks);
    } catch (err) {
      toast.error('Failed to load board');
      if (err.response?.status === 403 || err.response?.status === 404) navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getColumnTasks = (status) => tasks.filter(t => t.status === status);

  const handleAddTask = (status) => {
    setDefaultStatus(status);
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleTaskSaved = (task) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => t._id === task._id ? task : t));
    } else {
      setTasks(prev => [...prev, task]);
    }
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  // Drag and drop
  const handleDragStart = (e, task) => {
    setDragging(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, status) => {
    e.preventDefault();
    if (!dragging || dragging.status === status) return;
    const updatedTask = { ...dragging, status };
    setTasks(prev => prev.map(t => t._id === dragging._id ? updatedTask : t));
    try {
      await api.patch(`/tasks/${dragging._id}/status`, { status });
    } catch {
      toast.error('Failed to update task');
      fetchData();
    }
    setDragging(null);
  };

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'60px'}}><div className="spinner spinner-dark" /></div>;
  if (!board) return null;

  return (
    <div className="board-page">
      <div className="board-header">
        <div className="board-header-left">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>← Back</button>
          <div className="board-color-dot" style={{ background: board.color }} />
          <div>
            <h1 className="board-title">{board.title}</h1>
            {board.description && <p className="board-desc">{board.description}</p>}
          </div>
        </div>
        <div className="board-header-right">
          <div className="members-avatars">
            {[board.owner, ...(board.members?.map(m => m.user) || [])].slice(0, 4).map((u, i) => (
              <div key={u?._id || i} className="member-avatar" title={u?.name} style={{zIndex: 10 - i}}>
                {u?.name?.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowMembers(true)}>
              👥 Members
            </button>
          <button className="btn btn-primary btn-sm" onClick={() => handleAddTask('todo')}>+ Add Task</button>
        </div>
      </div>

      <div className="kanban-board">
        {COLUMNS.map(col => {
          const colTasks = getColumnTasks(col.key);
          return (
            <div key={col.key} className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.key)}>
              <div className="column-header">
                <div className="column-title">
                  <span>{col.emoji}</span>
                  <span>{col.label}</span>
                  <span className="column-count">{colTasks.length}</span>
                </div>
                <button className="btn btn-ghost btn-icon add-task-btn" onClick={() => handleAddTask(col.key)} title="Add task">+</button>
              </div>

              <div className="column-tasks">
                {colTasks.length === 0 && (
                  <div className="column-empty">Drop tasks here</div>
                )}
                {colTasks.map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onDragStart={handleDragStart}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showMembers && (
        <BoardMembersModal
          board={board}
          onClose={() => setShowMembers(false)}
          onUpdated={(updatedBoard) => setBoard(updatedBoard)}
        />
      )}

      {showTaskModal && (
        <TaskModal
          task={editingTask}
          boardId={id}
          defaultStatus={defaultStatus}
          boardMembers={[board.owner, ...(board.members?.map(m => m.user) || [])]}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
          onSaved={handleTaskSaved}
        />
      )}
    </div>
  );
}
