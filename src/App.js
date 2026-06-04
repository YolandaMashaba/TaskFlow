import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import { AppProvider, useApp } from './contexts/AppContext';
import { 
  CheckCircle, 
  Calendar as CalendarIcon, 
  FileText, 
  Activity, 
  User,
  Share2,
  LogOut
} from 'lucide-react';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Workspace from './pages/Workspace';

// Components
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import FilterButtons from './components/FilterButtons';
import Stats from './components/Stats';
import ActivityFeed from './components/ActivityFeed';
import Calendar from './components/Calendar';
import FileShare from './components/FileShare';
import UserList from './components/UserList';

function Dashboard() {
  const { 
    user, loading, currentTab, setCurrentTab, 
    todos, filter, setFilter, 
    toggleTodo, deleteTodo, editTodo, addTodo,
    workspaceId, workspaceName, logout
  } = useApp();
  const location = useLocation();

  if (loading) return (
    <div className="loading-screen">
      <div className="loader"></div>
      <h2>Initializing Workspace...</h2>
    </div>
  );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!workspaceId) {
    return <Navigate to="/workspace" replace />;
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const shareWorkspaceLink = () => {
    const shareUrl = `${window.location.origin}/workspace?workspace=${workspaceId}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Workspace link copied to clipboard!');
  };

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>TaskFlow</h2>
          <span className="workspace-name">{workspaceName}</span>
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

        <div className="sidebar-actions">
          <button onClick={shareWorkspaceLink} className="sidebar-action-btn">
            <Share2 size={16} />
            <span>Share Workspace</span>
          </button>
          <button onClick={logout} className="sidebar-action-btn logout-action">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="user-profile">
          <User size={18} />
          <span>{user.displayName || user.email?.split('@')[0]}</span>
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
              <div className="todo-controls-row">
                <Stats todos={todos} />
                <FilterButtons filter={filter} setFilter={setFilter} />
              </div>
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

function App() {
  return (
    <Router>
      <AppProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/workspace" replace />} />
        </Routes>
      </AppProvider>
    </Router>
  );
}

export default App;