import React from 'react';
import './App.css';
import { useApp } from './contexts/AppContext';
import { 
  CheckCircle, 
  Calendar as CalendarIcon, 
  FileText, 
  Activity, 
  User 
} from 'lucide-react';

// Components
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import FilterButtons from './components/FilterButtons';
import Stats from './components/Stats';
import ActivityFeed from './components/ActivityFeed';
import Calendar from './components/Calendar';
import FileShare from './components/FileShare';
import UserList from './components/UserList';

function App() {
  const { 
    user, loading, currentTab, setCurrentTab, 
    todos, filter, setFilter, 
    toggleTodo, deleteTodo, editTodo, addTodo 
  } = useApp();

  if (loading) return (
    <div className="loading-screen">
      <div className="loader"></div>
      <h2>Initializing Workspace...</h2>
    </div>
  );

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>TaskFlow</h2>
        </div>
        
        <ul className="nav-links">
          <li className={currentTab === 'todos' ? 'active' : ''} onClick={() => setCurrentTab('todos')}>
            <CheckCircle size={20} /> <span>Tasks</span>
          </li>
          <li className={currentTab === 'calendar' ? 'active' : ''} onClick={() => setCurrentTab('calendar')}>
            <CalendarIcon size={20} /> <span>Calendar</span>
          </li>
          <li className={currentTab === 'files' ? 'active' : ''} onClick={() => setCurrentTab('files')}>
            <FileText size={20} /> <span>Files</span>
          </li>
          <li className={currentTab === 'activity' ? 'active' : ''} onClick={() => setCurrentTab('activity')}>
            <Activity size={20} /> <span>Activity</span>
          </li>
        </ul>

        <div className="user-profile">
          <User size={18} />
          <span>{user ? (user.displayName || user.email) : "Guest User"}</span>
        </div>
      </nav>

      <main className="main-content">
        <header className="content-header">
          <h1>{currentTab.toUpperCase()}</h1>
          <button className="btn-primary" onClick={() => window.location.reload()}>Refresh Sync</button>
        </header>

        <section className="content-body">
          {currentTab === 'todos' && (
            <div className="todo-view">
              <TodoForm addTodo={addTodo} />
              <Stats todos={todos} />
              <FilterButtons filter={filter} setFilter={setFilter} />
              <TodoList todos={filteredTodos} toggleTodo={toggleTodo} deleteTodo={deleteTodo} editTodo={editTodo} />
            </div>
          )}

          {currentTab === 'calendar' && <Calendar />}
          {currentTab === 'files' && <FileShare />}
          {currentTab === 'activity' && <ActivityFeed />}
        </section>
      </main>

      <aside className="presence-panel">
        <UserList />
      </aside>
    </div>
  );
}

export default App;