import React from 'react';
import { format } from 'date-fns';
import './TaskCard.css';

const PRIORITY_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  urgent: '#ef4444'
};

export default function TaskCard({ task, onEdit, onDelete, onDragStart }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div
      className="task-card"
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onEdit(task)}
    >
      <div className="task-priority-bar" style={{ background: PRIORITY_COLORS[task.priority] }} />

      <div className="task-content">
        <div className="task-header">
          <h4 className="task-title">{task.title}</h4>
          <button className="btn btn-ghost btn-icon task-delete"
            onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}
            title="Delete">×</button>
        </div>

        {task.description && <p className="task-desc">{task.description}</p>}

        {task.tags?.length > 0 && (
          <div className="task-tags">
            {task.tags.slice(0, 3).map(tag => (
              <span key={tag} className="task-tag">{tag}</span>
            ))}
          </div>
        )}

        <div className="task-footer">
          <span className={`badge badge-${task.priority}`} style={{fontSize:'11px'}}>
            {task.priority}
          </span>
          <div className="task-meta">
            {task.dueDate && (
              <span className={`task-due ${isOverdue ? 'overdue' : ''}`}>
                📅 {format(new Date(task.dueDate), 'MMM d')}
              </span>
            )}
            {task.assignee && (
              <div className="task-assignee" title={task.assignee.name}>
                {task.assignee.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
