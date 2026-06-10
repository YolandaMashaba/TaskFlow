import React, { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Users, Mail } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const UserList = () => {
  const { user, workspaceId } = useApp();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);

  useEffect(() => {
    if (!workspaceId) return;

    // Simple presence tracking using localStorage
    const updatePresence = () => {
      if (!user) return;

      // Get current workspace presence
      const presenceKey = `presence_${workspaceId}`;
      const currentPresence = JSON.parse(localStorage.getItem(presenceKey) || '{}');

      // Add/update current user
      currentPresence[user.uid] = {
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0],
        email: user.email,
        lastSeen: Date.now()
      };

      // Remove users who haven't been seen in 5 minutes
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      Object.keys(currentPresence).forEach(uid => {
        if (currentPresence[uid].lastSeen < fiveMinutesAgo) {
          delete currentPresence[uid];
        }
      });

      localStorage.setItem(presenceKey, JSON.stringify(currentPresence));
      setOnlineUsers(Object.values(currentPresence));
    };

    // Update presence on mount and every 30 seconds
    updatePresence();
    const interval = setInterval(updatePresence, 30000);

    // Listen for storage changes (for multi-tab sync)
    const handleStorageChange = (e) => {
      if (e.key === `presence_${workspaceId}`) {
        const presence = JSON.parse(e.newValue || '{}');
        setOnlineUsers(Object.values(presence));
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [workspaceId, user]);

  // Fetch workspace members
  useEffect(() => {
    if (!workspaceId) return;

    const fetchWorkspaceMembers = async () => {
      try {
        const workspaceDoc = await getDoc(doc(db, 'workspaces', workspaceId));
        if (workspaceDoc.exists()) {
          const workspaceData = workspaceDoc.data();
          const memberIds = workspaceData.members || [];
          
          console.log('Fetching data for member IDs:', memberIds);
          
          // Fetch user data for each member from Firestore users collection
          const membersData = await Promise.all(
            memberIds.map(async (memberId) => {
              try {
                // Try to get user data from Firestore users collection
                const userDoc = await getDoc(doc(db, 'users', memberId));
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  console.log('Found user data for', memberId, userData);
                  return {
                    uid: memberId,
                    email: userData.email || 'Unknown',
                    displayName: userData.displayName || userData.email?.split('@')[0] || 'Unknown User'
                  };
                }
                
                // If no user doc exists, try to get from Firebase Auth (limited - only works for current user)
                console.log('No user doc found for', memberId);
                return {
                  uid: memberId,
                  email: 'Email not available',
                  displayName: 'Unknown User'
                };
              } catch (error) {
                console.error('Error fetching user data for', memberId, error);
                return {
                  uid: memberId,
                  email: 'Error fetching',
                  displayName: 'Unknown User'
                };
              }
            })
          );
          
          console.log('Final members data:', membersData);
          setWorkspaceMembers(membersData);
        }
      } catch (error) {
        console.error('Error fetching workspace members:', error);
      }
    };

    fetchWorkspaceMembers();
  }, [workspaceId]);

  return (
    <div className="user-list">
      <div className="user-list-header">
        <Users size={18} />
        <h3>Online Now</h3>
      </div>
      <ul>
        {onlineUsers.length === 0 ? (
          <li className="no-users">No one online</li>
        ) : (
          onlineUsers.map((u) => (
            <li key={u.uid}>
              <span className="user-dot"></span>
              {u.displayName || u.email?.split('@')[0]}
            </li>
          ))
        )}
      </ul>

      {workspaceMembers.length > 0 && (
        <div className="workspace-members-section">
          <div className="user-list-header">
            <Mail size={18} />
            <h3>Workspace Members</h3>
          </div>
          <ul className="members-list">
            {workspaceMembers.map((member) => (
              <li key={member.uid} className="member-item">
                <div className="member-info">
                  <span className="member-name">{member.displayName || member.email?.split('@')[0]}</span>
                  <span className="member-email">{member.email}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserList;