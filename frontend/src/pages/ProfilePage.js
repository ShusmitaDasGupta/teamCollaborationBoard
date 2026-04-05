import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your account settings</p>
      </div>

      <div className="profile-grid">
        {/* Avatar card */}
        <div className="card profile-avatar-card">
          <div className="avatar-large">{initials}</div>
          <h2 className="profile-name">{user?.name}</h2>
          <p className="profile-email">{user?.email}</p>
          <span className={`badge ${user?.role === 'admin' ? 'badge-urgent' : 'badge-in-progress'}`} style={{ marginTop: 8 }}>
            {user?.role}
          </span>
          <div className="profile-joined">Joined {new Date(user?.createdAt).toLocaleDateString('en-AU', { year: 'numeric', month: 'long' })}</div>
        </div>

        {/* Edit form */}
        <div className="card profile-form-card">
          <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 600 }}>Edit Profile</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-control" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input className="form-control" value={user?.email} disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              <small style={{ color: 'var(--text-muted)', fontSize: 12 }}>Email cannot be changed</small>
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" /> Saving...</> : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
