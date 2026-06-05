import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import { AppProvider, useApp } from './contexts/AppContext';
import { 
  CheckCircle, 
  Calendar as CalendarIcon, 
  FileText, 
  Activity, 
  User,
  Share2,
  LogOut,
  LogOut as LeaveIcon,
  Mail
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
import AlertModal from './components/AlertModal';
import TrelloBoard from './components/TrelloBoard';
import { X } from 'lucide-react';

function Dashboard() {
  const { 
    user, loading, currentTab, setCurrentTab, 
    todos, filter, setFilter, 
    toggleTodo, deleteTodo, editTodo, addTodo,
    workspaceId, workspaceName, logout, leaveWorkspace
  } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Alert modal state
  const [alertModal, setAlertModal] = React.useState({
    isOpen: false,
    type: 'confirm',
    title: '',
    message: '',
    onConfirm: null
  });
  
  // Email invitation state
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [showInviteModal, setShowInviteModal] = React.useState(false);

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
    setAlertModal({
      isOpen: true,
      type: 'success',
      title: 'Link Copied!',
      message: 'Workspace link has been copied to your clipboard.',
      confirmText: 'OK',
      onConfirm: null
    });
  };

  const handleInviteByEmail = () => {
    setShowInviteModal(true);
  };

  const sendInvite = () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      setAlertModal({
        isOpen: true,
        type: 'alert',
        title: 'Invalid Email',
        message: 'Please enter a valid email address.',
        confirmText: 'OK',
        onConfirm: null
      });
      return;
    }

    const shareUrl = `${window.location.origin}/workspace?workspace=${workspaceId}`;
    const emailSubject = encodeURIComponent(`You're invited to join ${workspaceName} on TaskFlow`);
    const emailBody = encodeURIComponent(`You've been invited to join the "${workspaceName}" workspace on TaskFlow!\n\nClick the link below to join:\n${shareUrl}\n\nIf you don't have an account yet, you'll be able to create one when you click the link.`);
    
    window.location.href = `mailto:${inviteEmail}?subject=${emailSubject}&body=${emailBody}`;
    
    setInviteEmail('');
    setShowInviteModal(false);
    
    setAlertModal({
      isOpen: true,
      type: 'success',
      title: 'Email Client Opened',
      message: 'Your email client has been opened with the invitation. Just send the email to invite them!',
      confirmText: 'OK',
      onConfirm: null
    });
  };

  const handleLeaveWorkspace = async () => {
    const success = await leaveWorkspace();
    if (success) {
      navigate('/workspace');
    } else {
      setAlertModal({
        isOpen: true,
        type: 'alert',
        title: 'Leave Failed',
        message: 'Failed to leave workspace. Workspace creators must delete the workspace instead of leaving it.',
        confirmText: 'OK',
        onConfirm: null
      });
    }
  };

  const handleLeaveWorkspaceConfirm = () => {
    setAlertModal({
      isOpen: true,
      type: 'confirm',
      title: 'Leave Workspace',
      message: 'Are you sure you want to leave this workspace? You can always join again later.',
      confirmText: 'Leave',
      cancelText: 'Cancel',
      onConfirm: handleLeaveWorkspace
    });
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
          <button onClick={handleInviteByEmail} className="sidebar-action-btn">
            <Mail size={16} />
            <span>Invite by Email</span>
          </button>
          <button onClick={handleLeaveWorkspaceConfirm} className="sidebar-action-btn">
            <LeaveIcon size={16} />
            <span>Leave Workspace</span>
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
              <TodoForm />
              <TrelloBoard />
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
      
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={alertModal.onConfirm}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        confirmText={alertModal.confirmText}
        cancelText={alertModal.cancelText}
      />
      
      {showInviteModal && (
        <div className="modal-backdrop" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowInviteModal(false)}>
              <X size={20} />
            </button>
            
            <div className="modal-body">
              <Mail size={48} className="modal-icon" />
              
              <h2 className="modal-title">Invite by Email</h2>
              
              <p className="modal-message">
                Enter the email address of the person you want to invite to this workspace.
              </p>
              
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address"
                className="invite-email-input"
              />
              
              <div className="modal-actions">
                <button className="modal-btn modal-btn-cancel" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </button>
                <button className="modal-btn modal-btn-confirm" onClick={sendInvite}>
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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