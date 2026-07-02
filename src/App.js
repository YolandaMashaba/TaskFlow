import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import { AppProvider, useApp } from './contexts/AppContext';
import emailjs from '@emailjs/browser';
import { 
  CheckCircle, 
  Calendar as CalendarIcon, 
  Activity, 
  User,
  Share2,
  LogOut,
  LogOut as LeaveIcon,
  Mail,
  MessageSquare,
  X,
  Menu
} from 'lucide-react';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Workspace from './pages/Workspace';

// Components
import ActivityFeed from './components/ActivityFeed';
import Calendar from './components/Calendar';
import UserList from './components/UserList';
import AlertModal from './components/AlertModal';
import TrelloBoard from './components/TrelloBoard';
import Profile from './components/Profile';
import Messages from './components/Messages';

function Dashboard() {
  const { 
    user, loading, currentTab, setCurrentTab, 
    todos, filter,
    workspaceId, workspaceName, logout, leaveWorkspace
  } = useApp();
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
  
  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

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

  const sendInvite = async () => {
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
    
    try {
      // EmailJS configuration - replace with your actual credentials
      const serviceId = 'YOUR_SERVICE_ID';
      const templateId = 'YOUR_TEMPLATE_ID';
      const publicKey = 'YOUR_PUBLIC_KEY';
      
      const templateParams = {
        to_email: inviteEmail,
        to_name: inviteEmail.split('@')[0],
        from_name: user?.displayName || user?.email?.split('@')[0] || 'A TaskFlow User',
        workspace_name: workspaceName,
        workspace_id: workspaceId,
        invite_link: shareUrl
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      
      setInviteEmail('');
      setShowInviteModal(false);
      
      setAlertModal({
        isOpen: true,
        type: 'success',
        title: 'Invite Sent',
        message: 'Invitation email has been sent successfully!',
        confirmText: 'OK',
        onConfirm: null
      });
    } catch (error) {
      console.error('Error sending email:', error);
      setAlertModal({
        isOpen: true,
        type: 'alert',
        title: 'Email Failed',
        message: 'Failed to send invitation email. Please check your EmailJS configuration or try again.',
        confirmText: 'OK',
        onConfirm: null
      });
    }
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
      {/* Mobile menu button */}
      <button 
        className="mobile-menu-btn" 
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      >
        <Menu size={24} />
      </button>
      
      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      
      <nav className={`sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h2>TaskFlow</h2>
          <span className="workspace-name">{workspaceName || 'Workspace'}</span>
          <button 
            className="mobile-close-btn" 
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        <ul className="nav-links">
          <li className={currentTab === 'todos' ? 'active' : ''} onClick={() => setCurrentTab('todos')}>
            <CheckCircle size={20} /> <span>Tasks</span>
          </li>
          <li className={currentTab === 'calendar' ? 'active' : ''} onClick={() => setCurrentTab('calendar')}>
            <CalendarIcon size={20} /> <span>Calendar</span>
          </li>
          <li className={currentTab === 'messages' ? 'active' : ''} onClick={() => setCurrentTab('messages')}>
            <MessageSquare size={20} /> <span>Messages</span>
          </li>
          <li className={currentTab === 'activity' ? 'active' : ''} onClick={() => setCurrentTab('activity')}>
            <Activity size={20} /> <span>Activity</span>
          </li>
          <li className={currentTab === 'profile' ? 'active' : ''} onClick={() => setCurrentTab('profile')}>
            <User size={20} /> <span>Profile</span>
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
              <TrelloBoard />
            </div>
          )}

          {currentTab === 'calendar' && <Calendar />}
          {currentTab === 'messages' && <Messages />}
          {currentTab === 'activity' && <ActivityFeed />}
          {currentTab === 'profile' && <Profile />}
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