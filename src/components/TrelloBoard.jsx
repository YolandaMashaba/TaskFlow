import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useApp } from '../contexts/AppContext';
import { Trash2, User, Calendar, GripVertical, X, AlignLeft } from 'lucide-react';

function SortableItem({ id, children, isDragging }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

function TodoCard({ todo, onDelete, onEdit, isDragging }) {
  const assignees = Array.isArray(todo.assignees) ? todo.assignees : (todo.assignee ? [todo.assignee] : []);
  
  return (
    <div 
      className="trello-card" 
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onClick={() => onEdit(todo.id)}
    >
      <div className="trello-card-drag-handle">
        <GripVertical size={16} />
      </div>
      <div className="trello-card-content">
        <p className="trello-card-text">{todo.text}</p>
        
        {assignees.length > 0 && (
          <div className="trello-card-assignees">
            {assignees.slice(0, 3).map((assignee, index) => (
              <div key={index} className="trello-card-assignee">
                <User size={14} />
                <span>{assignee}</span>
              </div>
            ))}
            {assignees.length > 3 && (
              <span className="trello-card-more">+{assignees.length - 3}</span>
            )}
          </div>
        )}
        
        {todo.dueDate && (
          <div className="trello-card-due-date">
            <Calendar size={14} />
            <span>{new Date(todo.dueDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>
      
      <button 
        className="trello-card-delete" 
        onClick={(e) => {
          e.stopPropagation();
          onDelete(todo.id);
        }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function DroppableColumn({ id, title, todos, onDeleteTodo, onEditTodo, activeId }) {
  const { setNodeRef } = useDroppable({ id });
  
  return (
    <div ref={setNodeRef} className="trello-column" data-column-id={id}>
      <div className="trello-column-header">
        <h3>{title}</h3>
        <span className="trello-column-count">{todos.length}</span>
      </div>
      
      <SortableContext items={todos.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="trello-column-content">
          {todos.map((todo) => (
            <SortableItem key={todo.id} id={todo.id} isDragging={activeId === todo.id}>
              <TodoCard 
                todo={todo} 
                onDelete={onDeleteTodo}
                onEdit={onEditTodo}
                isDragging={activeId === todo.id}
              />
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default function TrelloBoard() {
  const { todos, updateTodoStatus, deleteTodo, editTodo, addTodo } = useApp();
  const [activeId, setActiveId] = React.useState(null);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [editingTodo, setEditingTodo] = React.useState(null);
  const [editText, setEditText] = React.useState('');
  const [editAssignee, setEditAssignee] = React.useState('');
  const [editAssignees, setEditAssignees] = React.useState([]);
  const [editDueDate, setEditDueDate] = React.useState('');
  const [editDescription, setEditDescription] = React.useState('');
  const [addText, setAddText] = React.useState('');
  const [addAssignee, setAddAssignee] = React.useState('');
  const [addAssignees, setAddAssignees] = React.useState([]);
  const [addDueDate, setAddDueDate] = React.useState('');
  const [addDescription, setAddDescription] = React.useState('');
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const todosByStatus = {
    todo: todos.filter(t => t.status === 'todo' || !t.status),
    'in-progress': todos.filter(t => t.status === 'in-progress'),
    done: todos.filter(t => t.status === 'done' || t.completed),
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (over) {
      const todo = todos.find(t => t.id === active.id);
      if (todo) {
        const overId = over.id?.toString();
        let newStatus = todo.status || 'todo';
        
        // Check if dropped directly on a column
        if (overId === 'in-progress-column') {
          newStatus = 'in-progress';
        } else if (overId === 'done-column') {
          newStatus = 'done';
        } else if (overId === 'todo-column') {
          newStatus = 'todo';
        } else {
          // If dropped on a card, find which column that card belongs to
          const overTodo = todos.find(t => t.id === overId);
          if (overTodo) {
            newStatus = overTodo.status || 'todo';
          }
        }
        
        // Only update if status changed
        if (newStatus !== todo.status) {
          await updateTodoStatus(active.id, newStatus);
        }
      }
    }
  };

  const handleDeleteTodo = async (id) => {
    await deleteTodo(id);
  };

  const handleEditTodo = async (id) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      setEditingTodo(todo);
      setEditText(todo.text);
      const assignees = Array.isArray(todo.assignees) ? todo.assignees : (todo.assignee ? [todo.assignee] : []);
      setEditAssignees(assignees);
      setEditDueDate(todo.dueDate || '');
      setEditDescription(todo.description || '');
      setShowEditModal(true);
    }
  };

  const handleEditAssigneeAdd = () => {
    if (editAssignee.trim() && !editAssignees.includes(editAssignee.trim())) {
      setEditAssignees([...editAssignees, editAssignee.trim()]);
      setEditAssignee('');
    }
  };

  const handleEditAssigneeRemove = (assigneeToRemove) => {
    setEditAssignees(editAssignees.filter(a => a !== assigneeToRemove));
  };

  const handleSaveEdit = async () => {
    if (editingTodo && editText.trim()) {
      await editTodo(editingTodo.id, editText.trim(), editAssignees, editDueDate || null, editDescription);
      setShowEditModal(false);
      setEditingTodo(null);
      setEditText('');
      setEditAssignee('');
      setEditAssignees([]);
      setEditDueDate('');
      setEditDescription('');
    }
  };

  const handleAddAssigneeAdd = () => {
    if (addAssignee.trim() && !addAssignees.includes(addAssignee.trim())) {
      setAddAssignees([...addAssignees, addAssignee.trim()]);
      setAddAssignee('');
    }
  };

  const handleAddAssigneeRemove = (assigneeToRemove) => {
    setAddAssignees(addAssignees.filter(a => a !== assigneeToRemove));
  };

  const handleSaveAdd = async () => {
    if (addText.trim()) {
      await addTodo(addText.trim(), addAssignees, addDueDate || null, addDescription);
      setShowAddModal(false);
      setAddText('');
      setAddAssignee('');
      setAddAssignees([]);
      setAddDueDate('');
      setAddDescription('');
    }
  };

  const activeTodo = todos.find(t => t.id === activeId);

  return (
    <div className="trello-board">
      <div className="trello-board-header">
        <button className="trello-add-task-btn" onClick={() => setShowAddModal(true)}>
          + Add Task
        </button>
      </div>
      
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="trello-board-content">
          <DroppableColumn 
            id="todo-column"
            title="To Do" 
            todos={todosByStatus.todo} 
            onDeleteTodo={handleDeleteTodo}
            onEditTodo={handleEditTodo}
            activeId={activeId}
          />
          <DroppableColumn 
            id="in-progress-column"
            title="In Progress" 
            todos={todosByStatus['in-progress']} 
            onDeleteTodo={handleDeleteTodo}
            onEditTodo={handleEditTodo}
            activeId={activeId}
          />
          <DroppableColumn 
            id="done-column"
            title="Done" 
            todos={todosByStatus.done} 
            onDeleteTodo={handleDeleteTodo}
            onEditTodo={handleEditTodo}
            activeId={activeId}
          />
        </div>
        
        <DragOverlay>
          {activeTodo && (
            <div className="trello-card trello-card-dragging">
              <div className="trello-card-content">
                <p className="trello-card-text">{activeTodo.text}</p>
                {activeTodo.assignee && (
                  <div className="trello-card-assignee">
                    <User size={14} />
                    <span>{activeTodo.assignee}</span>
                  </div>
                )}
                {activeTodo.dueDate && (
                  <div className="trello-card-due-date">
                    <Calendar size={14} />
                    <span>{new Date(activeTodo.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DragOverlay>
        
        {/* Edit Modal */}
        {showEditModal && editingTodo && (
          <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                ✕
              </button>
              
              <div className="modal-body">
                <h2 className="modal-title">Edit Task</h2>
                
                <p className="modal-message">
                  Edit the task details.
                </p>
                
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Task title"
                  className="invite-email-input"
                  autoFocus
                />
                
                <div className="todo-form-fields" style={{ marginTop: '12px' }}>
                  <div className="todo-form-field todo-form-field-assignee">
                    <User size={16} className="todo-form-icon" />
                    <input
                      type="text"
                      value={editAssignee}
                      onChange={(e) => setEditAssignee(e.target.value)}
                      placeholder="Assign to..."
                      className="todo-form-input"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleEditAssigneeAdd();
                        }
                      }}
                    />
                    <button 
                      type="button" 
                      className="todo-form-add-btn"
                      onClick={handleEditAssigneeAdd}
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="todo-form-field">
                    <Calendar size={16} className="todo-form-icon" />
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="todo-form-input"
                    />
                  </div>
                </div>
                
                <div className="todo-form-field todo-form-field-description" style={{ marginTop: '12px' }}>
                  <AlignLeft size={16} className="todo-form-icon" />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Add a description..."
                    className="todo-form-textarea"
                    rows={3}
                  />
                </div>
                
                {editAssignees.length > 0 && (
                  <div className="todo-assignees-list">
                    {editAssignees.map((a, index) => (
                      <div key={index} className="todo-assignee-chip">
                        <User size={12} />
                        <span>{a}</span>
                        <button 
                          type="button"
                          onClick={() => handleEditAssigneeRemove(a)}
                          className="todo-assignee-remove"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="modal-actions" style={{ marginTop: '16px' }}>
                  <button className="modal-btn modal-btn-cancel" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button className="modal-btn modal-btn-confirm" onClick={handleSaveEdit}>
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Add Task Modal */}
        {showAddModal && (
          <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
              
              <div className="modal-body">
                <h2 className="modal-title">Add New Task</h2>
                
                <p className="modal-message">
                  Create a new task for your board.
                </p>
                
                <input
                  type="text"
                  value={addText}
                  onChange={(e) => setAddText(e.target.value)}
                  placeholder="Task title"
                  className="invite-email-input"
                  autoFocus
                />
                
                <div className="todo-form-fields" style={{ marginTop: '12px' }}>
                  <div className="todo-form-field todo-form-field-assignee">
                    <User size={16} className="todo-form-icon" />
                    <input
                      type="text"
                      value={addAssignee}
                      onChange={(e) => setAddAssignee(e.target.value)}
                      placeholder="Assign to..."
                      className="todo-form-input"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddAssigneeAdd();
                        }
                      }}
                    />
                    <button 
                      type="button" 
                      className="todo-form-add-btn"
                      onClick={handleAddAssigneeAdd}
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="todo-form-field">
                    <Calendar size={16} className="todo-form-icon" />
                    <input
                      type="date"
                      value={addDueDate}
                      onChange={(e) => setAddDueDate(e.target.value)}
                      className="todo-form-input"
                    />
                  </div>
                </div>
                
                <div className="todo-form-field todo-form-field-description" style={{ marginTop: '12px' }}>
                  <AlignLeft size={16} className="todo-form-icon" />
                  <textarea
                    value={addDescription}
                    onChange={(e) => setAddDescription(e.target.value)}
                    placeholder="Add a description..."
                    className="todo-form-textarea"
                    rows={3}
                  />
                </div>
                
                {addAssignees.length > 0 && (
                  <div className="todo-assignees-list">
                    {addAssignees.map((a, index) => (
                      <div key={index} className="todo-assignee-chip">
                        <User size={12} />
                        <span>{a}</span>
                        <button 
                          type="button"
                          onClick={() => handleAddAssigneeRemove(a)}
                          className="todo-assignee-remove"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="modal-actions" style={{ marginTop: '16px' }}>
                  <button className="modal-btn modal-btn-cancel" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button className="modal-btn modal-btn-confirm" onClick={handleSaveAdd}>
                    Add Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DndContext>
    </div>
  );
}
