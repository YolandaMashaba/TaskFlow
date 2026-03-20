import React from 'react';
import { useApp } from '../contexts/AppContext';

const ActivityFeed = () => {
  const { activity } = useApp();

  return (
    <div className="activity-feed">
      <h2>Activity Tracking</h2>
      <p>Recent workspace activity</p>
      <ul className="activity-list">
        {activity.map((event) => (
          <li key={event.id} className="activity-item">
            <strong>{event.userName}</strong> {event.action} 
            <span>{event.details && `- ${JSON.stringify(event.details)}`}
            </span>
            <small>{new Date(event.timestamp).toLocaleString()}</small>
          </li>
        ))}
      </ul>
      {activity.length === 0 && <p>No activity yet.</p>}
    </div>
  );
};

export default ActivityFeed;

