import React, { useState } from 'react';
import TodoItem from './TodoItem';

const TodoList = ({ todos, toggleTodo, deleteTodo, editTodo }) => {
  const [editingId, setEditingId] = useState(null);

  if (todos.length === 0) {
    return (
      <div className="todo-list empty">
        <p>No tasks found for this filter.</p>
      </div>
    );
  }

  return (
    <div className="todo-list">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          toggleTodo={toggleTodo}
          deleteTodo={deleteTodo}
          editTodo={editTodo}
          isEditing={editingId === todo.id}
          setEditingId={setEditingId}
        />
      ))}
    </div>
  );
};

export default TodoList;