import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Plus, Link2, Users, ArrowRight, LogOut, FolderOpen, Trash2 } from 'lucide-react';
import AlertModal from '../components/AlertModal';

const Workspace = () => {
  const { user, workspaceId, createWorkspace, joinWorkspace, logout, fetchUserWorkspaces, userWorkspaces, deleteWorkspace } = useApp();
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [joinWorkspaceId, setJoinWorkspaceId] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [autoJoinLoading, setAutoJoinLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [joinError, setJoinError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Alert modal state
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    type: 'confirm',
    title: '',
    message: '',
    onConfirm: null
  });

  // Check if user is coming from a shared link
  const sharedWorkspaceId = searchParams.get('workspace');

  // Fetch user's workspaces on mount
  useEffect(() => {
    if (user) {
      fetchUserWorkspaces();
    }
  }, [user, fetchUserWorkspaces]);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);

    try {
      console.log('Starting workspace creation...');
      const id = await createWorkspace(newWorkspaceName);
      console.log('Workspace creation returned ID:', id);
      if (id) {
        navigate('/dashboard');
      } else {
        setCreateError('Failed to create workspace - no ID returned');
        setCreateLoading(false);
      }
    } catch (err) {
      console.error('Workspace creation error:', err);
      setCreateError(err.message || 'Failed to create workspace');
      setCreateLoading(false);
    }
  };

  const handleJoinWorkspace = async (e) => {
    if (e) e.preventDefault();
    setJoinError('');
    setJoinLoading(true);

    try {
      const workspaceId = joinWorkspaceId || sharedWorkspaceId;
      console.log('Joining workspace with ID:', workspaceId);
      const success = await joinWorkspace(workspaceId);
      if (success) {
        navigate('/dashboard');
      } else {
        setJoinError('Invalid workspace ID or workspace does not exist. Please check the ID and try again.');
      }
    } catch (err) {
      console.error('Join workspace error:', err);
      setJoinError(err.message || 'Invalid workspace ID or workspace does not exist');
    } finally {
      setJoinLoading(false);
      setAutoJoinLoading(false);
    }
  };

  const handleSelectWorkspace = async (workspace) => {
    const success = await joinWorkspace(workspace.id);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleDeleteWorkspace = async (e, workspaceIdToDelete) => {
    e.stopPropagation();
    setAlertModal({
      isOpen: true,
      type: 'confirm',
      title: 'Delete Workspace',
      message: 'Are you sure you want to delete this workspace? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        const success = await deleteWorkspace(workspaceIdToDelete);
        if (!success) {
          setAlertModal({
            isOpen: true,
            type: 'alert',
            title: 'Delete Failed',
            message: 'Failed to delete workspace. Only the workspace creator can delete it.',
            confirmText: 'OK',
            onConfirm: null
          });
        }
        setAlertModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Auto-join if workspace ID is in URL
  useEffect(() => {
    if (sharedWorkspaceId && user && !workspaceId && !autoJoinLoading) {
      setAutoJoinLoading(true);
      handleJoinWorkspace(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedWorkspaceId, user, workspaceId]);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="workspace-container">
      <div className="workspace-header">
        <h1>Welcome, {user.displayName || user.email?.split('@')[0]}!</h1>
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      <div className="workspace-content">
        {sharedWorkspaceId && !workspaceId && (
          <div className="shared-workspace-banner">
            <Link2 size={24} />
            <div>
              <h3>You've been invited to join a workspace!</h3>
              <p>Click below to join the collaborative workspace</p>
            </div>
            <button onClick={() => handleJoinWorkspace(null)} className="join-shared-btn" disabled={joinLoading || autoJoinLoading}>
              {joinLoading || autoJoinLoading ? 'Joining...' : 'Join Workspace'}
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        <div className="workspace-options">
          <div className="workspace-option">
            <div className="option-icon">
              <Plus size={32} />
            </div>
            <h2>Create New Workspace</h2>
            <p>Start a new collaborative workspace for your team</p>
            
            <form onSubmit={handleCreateWorkspace} className="workspace-form">
              {createError && <div className="workspace-error">{createError}</div>}
              <input
                type="text"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="Workspace name (optional)"
                className="workspace-input"
              />
              <button type="submit" className="workspace-submit-btn" disabled={createLoading}>
                {createLoading ? 'Creating...' : 'Create Workspace'}
                <ArrowRight size={20} />
              </button>
            </form>
          </div>

          <div className="workspace-divider">OR</div>

          <div className="workspace-option">
            <div className="option-icon">
              <Users size={32} />
            </div>
            <h2>Join Existing Workspace</h2>
            <p>Enter a workspace name or ID to join an existing team</p>
            
            <form onSubmit={handleJoinWorkspace} className="workspace-form">
              {joinError && <div className="workspace-error">{joinError}</div>}
              <input
                type="text"
                value={joinWorkspaceId}
                onChange={(e) => setJoinWorkspaceId(e.target.value)}
                placeholder="Enter workspace name or ID"
                className="workspace-input"
                required
              />
              <button type="submit" className="workspace-submit-btn" disabled={joinLoading}>
                {joinLoading ? 'Joining...' : 'Join Workspace'}
                <ArrowRight size={20} />
              </button>
            </form>
          </div>
        </div>

        <div className="existing-workspaces">
          <h2>Your Workspaces</h2>
          {userWorkspaces.length > 0 ? (
            <div className="workspaces-grid">
              {userWorkspaces.map(workspace => (
                <div key={workspace.id} className="workspace-card" onClick={() => handleSelectWorkspace(workspace)}>
                  <button 
                    className="delete-workspace-btn" 
                    onClick={(e) => handleDeleteWorkspace(e, workspace.id)}
                    title="Delete workspace"
                  >
                    <Trash2 size={16} />
                  </button>
                  <FolderOpen size={32} className="workspace-card-icon" />
                  <h3>{workspace.name}</h3>
                  <p>ID: {workspace.id}</p>
                  <div className="workspace-members">
                    <Users size={14} />
                    <span>{workspace.members?.length || 0} members</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-workspaces">No workspaces yet. Create one or join an existing workspace to get started.</p>
          )}
        </div>
      </div>
      
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
    </div>
  );
};

export default Workspace;
