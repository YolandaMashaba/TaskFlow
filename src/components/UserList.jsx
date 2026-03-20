import React, { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const UserList = () => {
  const { workspaceId } = useApp();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!workspaceId) return;
    const unsubscribe = onSnapshot(doc(db, `workspaces/${workspaceId}/presence`, 'users'), (snap) => {
      const data = snap.data();
      if (data) setUsers(Object.values(data));
    });
    return unsubscribe;
  }, [workspaceId]);

  return (
    <div className="user-list">
      <h3>👥 Online Now</h3>
      <ul>
        {users.map((u) => (
          <li key={u.uid}>
            <span className="user-dot"></span>
            {u.displayName || u.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;