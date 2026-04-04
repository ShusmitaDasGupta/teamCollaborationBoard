import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './InvitePage.css';

export default function InvitePage() {
  const { token } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState(false);

  // Fetch invitation details
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const { data } = await api.get(`/invitations/info/${token}`);
        setInfo(data.invitation);
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired invitation');
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [token]);

  const handleAccept = async () => {
    if (!user) {
      // Save token to localStorage so we can redirect back after login
      localStorage.setItem('pendingInviteToken', token);
      navigate(`/login?redirect=/invite/${token}`);
      return;
    }

    setAccepting(true);
    try {
      const { data } = await api.get(`/invitations/accept/${token}`);
      setAccepted(true);
      toast.success(data.message);
      setTimeout(() => navigate(`/boards/${data.boardId}`), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    try {
      await api.get(`/invitations/decline/${token}`);
      toast.info('Invitation declined');
      navigate('/dashboard');
    } catch {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="invite-page">
        <div className="invite-card">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
            <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>Loading invitation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invite-page">
        <div className="invite-card">
          <div className="invite-icon">❌</div>
          <h2>Invitation Invalid</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{error}</p>
          <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="invite-page">
        <div className="invite-card">
          <div className="invite-icon">🎉</div>
          <h2>Welcome aboard!</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            You've joined <strong>{info?.board?.title}</strong>. Redirecting you to the board...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="invite-page">
      <div className="invite-card">
        {/* Brand */}
        <div className="invite-brand">
          <span>🚀</span> CollabBoard
        </div>

        <div className="invite-icon">📋</div>

        <h2>You're Invited!</h2>

        <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 24 }}>
          <strong style={{ color: 'var(--text-primary)' }}>{info?.invitedBy?.name}</strong> has invited you to collaborate on:
        </p>

        {/* Board info box */}
        <div className="invite-board-box" style={{ borderLeftColor: info?.board?.color || '#6366f1' }}>
          <div className="invite-board-label">Board</div>
          <div className="invite-board-title">📋 {info?.board?.title}</div>
          {info?.board?.description && (
            <div className="invite-board-desc">{info?.board?.description}</div>
          )}
          <div className="invite-board-role">Your role: <strong>{info?.role}</strong></div>
        </div>

        {/* Not logged in warning */}
        {!user && (
          <div className="invite-warning">
            ⚠️ You need to <strong>log in</strong> or <strong>register</strong> with the email address <strong>{info?.email}</strong> to accept this invitation.
          </div>
        )}

        {/* Wrong account warning */}
        {user && user.email !== info?.email && (
          <div className="invite-warning" style={{ borderColor: '#ef4444', background: '#fef2f2' }}>
            ⚠️ This invitation was sent to <strong>{info?.email}</strong>, but you're logged in as <strong>{user.email}</strong>. Please log in with the correct account.
          </div>
        )}

        {/* Expiry */}
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>
          Expires: {new Date(info?.expiresAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        {/* Action buttons */}
        <div className="invite-actions">
          <button
            className="btn btn-primary"
            onClick={handleAccept}
            disabled={accepting || (user && user.email !== info?.email)}
          >
            {accepting ? <><span className="spinner" /> Joining...</> : '✅ Accept Invitation'}
          </button>

          <button className="btn btn-secondary" onClick={handleDecline}>
            ❌ Decline
          </button>
        </div>

        {!user && (
          <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
            Don't have an account? <Link to={`/register?redirect=/invite/${token}`}>Register here</Link>
          </p>
        )}
      </div>
    </div>
  );
}