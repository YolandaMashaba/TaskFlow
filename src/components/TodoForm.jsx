import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { User, Calendar, X, AlignLeft } from 'lucide-react';

const TodoForm = () => {
  const { addTodo } = useApp();
  const [text, setText] = useState('');
  const [assignee, setAssignee] = useState('');
  const [assignees, setAssignees] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  const handleAddAssignee = () => {
    if (assignee.trim() && !assignees.includes(assignee.trim())) {
      setAssignees([...assignees, assignee.trim()]);
      setAssignee('');
    }
  };

  const handleRemoveAssignee = (assigneeToRemove) => {
    setAssignees(assignees.filter(a => a !== assigneeToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      addTodo(text.trim(), assignees, dueDate || null, description);
      setText('');
      setAssignee('');
      setAssignees([]);
      setDueDate('');
      setDescription('');
    }
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a new task..."
        className="todo-input"
      />
      
      <div className="todo-form-fields">
        <div className="todo-form-field todo-form-field-assignee">
          <User size={16} className="todo-form-icon" />
          <input
            type="text"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            placeholder="Assign to..."
            className="todo-form-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddAssignee();
              }
            }}
          />
          <button 
            type="button" 
            className="todo-form-add-btn"
            onClick={handleAddAssignee}
          >
            +
          </button>
        </div>
        
        <div className="todo-form-field">
          <Calendar size={16} className="todo-form-icon" />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="todo-form-input"
          />
        </div>
      </div>
      
      {assignees.length > 0 && (
        <div className="todo-assignees-list">
          {assignees.map((a, index) => (
            <div key={index} className="todo-assignee-chip">
              <User size={12} />
              <span>{a}</span>
              <button 
                type="button"
                onClick={() => handleRemoveAssignee(a)}
                className="todo-assignee-remove"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="todo-form-field todo-form-field-description">
        <AlignLeft size={16} className="todo-form-icon" />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description..."
          className="todo-form-textarea"
          rows={2}
        />
      </div>
      
      <button type="submit" className="add-btn">Add</button>
    </form>
  );
};

export default TodoForm;