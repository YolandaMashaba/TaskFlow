import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Plus, Link2, Users, ArrowRight, LogOut } from 'lucide-react';

const Workspace = () => {
  const { user, workspaceId, workspaceName, createWorkspace, joinWorkspace, logout } = useApp();
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [joinWorkspaceId, setJoinWorkspaceId] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [autoJoinLoading, setAutoJoinLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Check if user is coming from a shared link
  const sharedWorkspaceId = searchParams.get('workspace');

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    setError('');
    setCreateLoading(true);

    try {
      console.log('Starting workspace creation...');
      const id = await createWorkspace(newWorkspaceName);
      console.log('Workspace creation returned ID:', id);
      if (id) {
        navigate('/dashboard');
      } else {
        setError('Failed to create workspace - no ID returned');
        setCreateLoading(false);
      }
    } catch (err) {
      console.error('Workspace creation error:', err);
      setError(err.message || 'Failed to create workspace');
      setCreateLoading(false);
    }
  };

  const handleJoinWorkspace = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setJoinLoading(true);

    try {
      const success = await joinWorkspace(joinWorkspaceId || sharedWorkspaceId);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid workspace ID or workspace does not exist');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setJoinLoading(false);
      setAutoJoinLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Auto-join if workspace ID is in URL
  React.useEffect(() => {
    if (sharedWorkspaceId && user && !workspaceId && !autoJoinLoading) {
      setAutoJoinLoading(true);
      handleJoinWorkspace(null);
    }
  }, [sharedWorkspaceId, user, workspaceId]);

  if (!user) {
    navigate('/login');
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
              {error && <div className="workspace-error">{error}</div>}
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
            <p>Enter a workspace ID to join an existing team</p>
            
            <form onSubmit={handleJoinWorkspace} className="workspace-form">
              <input
                type="text"
                value={joinWorkspaceId}
                onChange={(e) => setJoinWorkspaceId(e.target.value)}
                placeholder="Enter workspace ID"
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
      </div>
    </div>
  );
};

export default Workspace;
