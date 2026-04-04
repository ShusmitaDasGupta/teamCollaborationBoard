import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';

export default function BoardModal({ board, colors, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: board?.title || '',
    description: board?.description || '',
    color: board?.color || colors[0]
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let data;
      if (board) {
        const res = await api.put(`/boards/${board._id}`, form);
        data = res.data.board;
      } else {
        const res = await api.post('/boards', form);
        data = res.data.board;
      }
      toast.success(board ? 'Board updated!' : 'Board created!');
      onSaved(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save board');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{board ? 'Edit Board' : 'Create Board'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Board Title *</label>
              <input className="form-control" placeholder="e.g. Product Roadmap" value={form.title}
                onChange={e => setForm({...form, title: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="form-control" placeholder="What is this board about?" value={form.description}
                onChange={e => setForm({...form, description: e.target.value})} rows={3} />
            </div>
            <div className="form-group">
              <label>Board Color</label>
              <div style={{display:'flex', gap:'8px', flexWrap:'wrap', marginTop:'4px'}}>
                {colors.map(c => (
                  <button key={c} type="button"
                    onClick={() => setForm({...form, color: c})}
                    style={{
                      width: 28, height: 28, borderRadius: '50%', background: c, border: 'none',
                      cursor: 'pointer', outline: form.color === c ? `3px solid ${c}` : 'none',
                      outlineOffset: '2px', transition: 'outline 0.1s'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" /> : (board ? 'Save Changes' : 'Create Board')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
