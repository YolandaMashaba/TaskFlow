import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Clock, Plus, Edit, Trash, Upload, User, Calendar, CheckCircle } from 'lucide-react';

const ActivityFeed = () => {
  const { activity } = useApp();

  const getActivityIcon = (action) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('created') || actionLower.includes('added')) return <Plus size={16} />;
    if (actionLower.includes('edited') || actionLower.includes('updated')) return <Edit size={16} />;
    if (actionLower.includes('deleted') || actionLower.includes('removed')) return <Trash size={16} />;
    if (actionLower.includes('uploaded')) return <Upload size={16} />;
    if (actionLower.includes('completed')) return <CheckCircle size={16} />;
    return <Clock size={16} />;
  };

  const getActivityColor = (action) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('created') || actionLower.includes('added')) return 'var(--accent-green)';
    if (actionLower.includes('edited') || actionLower.includes('updated')) return 'var(--accent-blue)';
    if (actionLower.includes('deleted') || actionLower.includes('removed')) return 'var(--accent-red)';
    if (actionLower.includes('uploaded')) return 'var(--accent-purple)';
    if (actionLower.includes('completed')) return 'var(--accent-green)';
    return 'var(--text-muted)';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="activity-feed">
      <div className="activity-header">
        <div className="activity-header-icon">
          <Clock size={20} />
        </div>
        <div>
          <h2>Activity</h2>
          <p>Recent workspace activity</p>
        </div>
      </div>
      
      <div className="activity-list">
        {activity.map((event) => (
          <div key={event.id} className="activity-item">
            <div 
              className="activity-icon"
              style={{ color: getActivityColor(event.action) }}
            >
              {getActivityIcon(event.action)}
            </div>
            <div className="activity-content">
              <div className="activity-user">
                <User size={14} />
                <strong>{event.userName}</strong>
              </div>
              <p className="activity-action">{event.action}</p>
              {event.details && (
                <p className="activity-details">
                  {Object.entries(event.details).map(([key, value]) => (
                    <span key={key} className="activity-detail-tag">
                      {key}: {value}
                    </span>
                  ))}
                </p>
              )}
              <span className="activity-time">{formatTimeAgo(event.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
      
      {activity.length === 0 && (
        <div className="activity-empty">
          <Clock size={48} />
          <p>No activity yet</p>
          <small>Start working to see your activity here</small>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;

