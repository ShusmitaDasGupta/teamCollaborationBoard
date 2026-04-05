import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import './BoardMembersModal.css';

export default function BoardMembersModal({ board, onClose, onUpdated }) {
  const [members, setMembers] = useState(board.members || []);
  const [invitations, setInvitations] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('members');

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const { data } = await api.get(`/invitations/board/${board._id}`);
        setInvitations(data.invitations);
      } catch {}
    };
    fetchInvitations();
  }, [board._id]);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    try {
      await api.post('/invitations/send', { email: email.trim(), boardId: board._id, role });
      toast.success(`Invitation sent to ${email}!`);
      setEmail('');
      const { data } = await api.get(`/invitations/board/${board._id}`);
      setInvitations(data.invitations);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  const handleCancelInvite = async (inviteId) => {
    try {
      await api.delete(`/invitations/${inviteId}`);
      setInvitations(prev => prev.filter(i => i._id !== inviteId));
      toast.success('Invitation cancelled');
    } catch {
      toast.error('Failed to cancel invitation');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the board?')) return;
    try {
      await api.delete(`/boards/${board._id}/members/${userId}`);
      const updated = members.filter(m => m.user._id !== userId);
      setMembers(updated);
      onUpdated({ ...board, members: updated });
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const pendingInvites = invitations.filter(i => i.status === 'pending');
  const allMembers = [{ user: board.owner, role: 'owner' }, ...members];
  const statusColor = { pending: '#f59e0b', accepted: '#10b981', declined: '#ef4444', expired: '#94a3b8' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal members-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👥 Board Members</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="members-tabs">
          {['members', 'invite', 'pending'].map(tab => (
            <button key={tab} className={`members-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab === 'members' && `Members (${allMembers.length})`}
              {tab === 'invite' && 'Invite by Email'}
              {tab === 'pending' && <>Pending {pendingInvites.length > 0 && <span className="pending-badge">{pendingInvites.length}</span>}</>}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {activeTab === 'members' && (
            <div>
              {allMembers.map((m, i) => (
                <div key={m.user?._id || i} className="member-row">
                  <div className="member-avatar-sm" style={{ background: m.role === 'owner' ? '#f59e0b' : 'var(--primary)' }}>
                    {m.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="member-info">
                    <div className="member-name">{m.user?.name}</div>
                    <div className="member-email">{m.user?.email}</div>
                  </div>
                  <span className={`badge ${m.role === 'owner' ? 'badge-review' : 'badge-in-progress'}`}>{m.role}</span>
                  {m.role !== 'owner' && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleRemoveMember(m.user._id)} style={{ fontSize: 12 }}>Remove</button>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'invite' && (
            <div>
              <p className="invite-hint">Enter the email address of the person you want to invite. They will receive an email with a link to join this board.</p>
              <form onSubmit={handleSendInvite}>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input type="email" className="form-control" placeholder="colleague@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select className="form-control" value={role} onChange={e => setRole(e.target.value)}>
                    <option value="viewer">Viewer — can only view tasks</option>
                    <option value="editor">Editor — can create and edit tasks</option>
                    <option value="admin">Admin — full board access</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" disabled={sending} style={{ width: '100%', justifyContent: 'center' }}>
                  {sending ? <><span className="spinner" /> Sending...</> : '📧 Send Invitation Email'}
                </button>
              </form>
              <div className="dev-tip">
                💡 <strong>Development tip:</strong> Check your backend terminal for the email preview link — no real email is sent in dev mode.
              </div>
            </div>
          )}

          {activeTab === 'pending' && (
            <div>
              {invitations.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px 0' }}>
                  <div className="icon">📭</div>
                  <h3>No invitations yet</h3>
                  <p>Go to the "Invite by Email" tab to send one</p>
                </div>
              ) : (
                invitations.map(inv => (
                  <div key={inv._id} className="invite-row">
                    <div className="invite-row-email">
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{inv.email}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Sent {new Date(inv.createdAt).toLocaleDateString()} · Role: {inv.role}
                      </div>
                    </div>
                    <span className="badge" style={{ background: statusColor[inv.status] + '20', color: statusColor[inv.status], fontSize: 12 }}>
                      {inv.status}
                    </span>
                    {inv.status === 'pending' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => handleCancelInvite(inv._id)} style={{ fontSize: 12 }}>Cancel</button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
