import React from 'react';

const Stats = ({ todos }) => {
  const total = todos.length;
  const completed = todos.filter(todo => todo.completed).length;
  const remaining = total - completed;

  return (
    <div className="stats">
      <div className="stat-item">
        <span className="stat-label">Total:</span>
        <span className="stat-value">{total}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Completed:</span>
        <span className="stat-value">{completed}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Remaining:</span>
        <span className="stat-value">{remaining}</span>
      </div>
    </div>
  );
};

export default Stats;