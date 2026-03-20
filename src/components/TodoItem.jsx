import React, { useState } from 'react';

const TodoItem = ({ todo, toggleTodo, deleteTodo, editTodo, isEditing, setEditingId }) => {
  const [editText, setEditText] = useState(todo.text);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editText.trim()) {
      editTodo(todo.id, editText.trim());
      setEditingId(null);
    }
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-content">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => toggleTodo(todo.id, todo.completed)}
          className="todo-checkbox"
        />
        
        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="edit-form">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="edit-input"
              autoFocus
            />
            <button type="submit" className="save-btn">Save</button>
            <button type="button" onClick={() => setEditingId(null)} className="cancel-btn">Cancel</button>
          </form>
        ) : (
          <>
            <span className="todo-text" onDoubleClick={() => setEditingId(todo.id)}>
              {todo.text}
            </span>
            <div className="todo-actions">
              <button onClick={() => setEditingId(todo.id)} className="edit-btn">✏️</button>
              <button onClick={() => deleteTodo(todo.id)} className="delete-btn">🗑️</button>
            </div>
          </>
        )}
      </div>
      {todo.createdAt && (
        <div className="todo-date">
          {new Date(todo.createdAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default TodoItem;