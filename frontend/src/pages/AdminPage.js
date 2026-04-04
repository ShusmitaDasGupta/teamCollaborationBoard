import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import './AdminPage.css';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [boards, setBoards] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, usersRes, boardsRes, tasksRes] = await Promise.all([
        api.get('/users/stats'),
        api.get('/users'),
        api.get('/boards/all'),
        api.get('/tasks')
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setBoards(boardsRes.data.boards);
      setTasks(tasksRes.data.tasks);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleToggleRole = async (user) => {
    try {
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      const { data } = await api.put(`/users/${user._id}`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === user._id ? data.user : u));
      toast.success(`User role updated to ${newRole}`);
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const { data } = await api.put(`/users/${user._id}`, { isActive: !user.isActive });
      setUsers(prev => prev.map(u => u._id === user._id ? data.user : u));
      toast.success(`User ${data.user.isActive ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteBoard = async (boardId) => {
    if (!window.confirm('Delete this board and all its tasks?')) return;
    try {
      await api.delete(`/boards/${boardId}`);
      setBoards(prev => prev.filter(b => b._id !== boardId));
      toast.success('Board deleted');
    } catch {
      toast.error('Failed to delete board');
    }
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

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner spinner-dark" /></div>;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: '#6366f1' },
    { label: 'Active Boards', value: stats?.totalBoards || 0, icon: '📋', color: '#10b981' },
    { label: 'Total Tasks', value: stats?.totalTasks || 0, icon: '✅', color: '#f59e0b' },
    { label: 'In Progress', value: stats?.tasksByStatus?.['in-progress'] || 0, icon: '⚡', color: '#3b82f6' }
  ];

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="page-title">Admin Panel</h1>
        <p className="page-subtitle">Manage users, boards, and tasks</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {statCards.map(card => (
          <div key={card.label} className="stat-card">
            <div className="stat-icon" style={{ background: card.color + '20', color: card.color }}>{card.icon}</div>
            <div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {['overview', 'users', 'boards', 'tasks'].map(tab => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span className="tab-count">
              {tab === 'users' ? users.length : tab === 'boards' ? boards.length : tab === 'tasks' ? tasks.length : ''}
            </span>
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="overview-grid">
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ marginBottom: 14, fontSize: 15 }}>Tasks by Status</h3>
            {['todo', 'in-progress', 'review', 'done'].map(s => {
              const count = stats?.tasksByStatus?.[s] || 0;
              const pct = stats?.totalTasks ? Math.round((count / stats.totalTasks) * 100) : 0;
              return (
                <div key={s} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ textTransform: 'capitalize' }}>{s.replace('-', ' ')}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: 100, height: 6 }}>
                    <div style={{ width: `${pct}%`, background: 'var(--primary)', borderRadius: 100, height: 6, transition: 'width 0.5s' }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ marginBottom: 14, fontSize: 15 }}>Recent Users</h3>
            {users.slice(0, 5).map(u => (
              <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div>
                </div>
                <span className={`badge ${u.role === 'admin' ? 'badge-urgent' : 'badge-todo'}`} style={{ marginLeft: 'auto' }}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Table */}
      {activeTab === 'users' && (
        <div className="admin-table-wrap card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      {u.name}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{u.email}</td>
                  <td><span className={`badge ${u.role === 'admin' ? 'badge-urgent' : 'badge-todo'}`}>{u.role}</span></td>
                  <td><span className={`badge ${u.isActive ? 'badge-done' : 'badge-high'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleToggleRole(u)}>
                        {u.role === 'admin' ? '→ User' : '→ Admin'}
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleToggleActive(u)}>
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Boards Table */}
      {activeTab === 'boards' && (
        <div className="admin-table-wrap card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Owner</th>
                <th>Members</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {boards.map(b => (
                <tr key={b._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: b.color }} />
                      {b.title}
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{b.owner?.name}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{(b.members?.length || 0) + 1}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteBoard(b._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tasks Table */}
      {activeTab === 'tasks' && (
        <div className="admin-table-wrap card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Board</th>
                <th>Assignee</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t._id}>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.board?.title}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.assignee?.name || '—'}</td>
                  <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                  <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTask(t._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
