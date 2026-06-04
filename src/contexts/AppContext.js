import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc,
  getDoc,
  arrayUnion
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { auth, db, storage } from '../firebase';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState(null);
  const [currentTab, setCurrentTab] = useState('todos');
  const [todos, setTodos] = useState([]);
  const [activity, setActivity] = useState([]);
  const [events, setEvents] = useState([]);
  const [files, setFiles] = useState([]);
  const [filter, setFilter] = useState('all');
  const [workspaceName, setWorkspaceName] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user || !workspaceId) return;

    const unsubTodos = onSnapshot(query(collection(db, `workspaces/${workspaceId}/todos`), orderBy('createdAt', 'desc')), (snap) => {
      setTodos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubActivity = onSnapshot(query(collection(db, `workspaces/${workspaceId}/activity`), orderBy('timestamp', 'desc')), (snap) => {
      setActivity(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).slice(0, 30));
    });

    const unsubEvents = onSnapshot(collection(db, `workspaces/${workspaceId}/events`), (snap) => {
      setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch workspace info
    const fetchWorkspaceInfo = async () => {
      const workspaceDoc = await getDoc(doc(db, 'workspaces', workspaceId));
      if (workspaceDoc.exists()) {
        setWorkspaceName(workspaceDoc.data().name || 'My Workspace');
      }
    };
    fetchWorkspaceInfo();

    return () => {
      unsubTodos();
      unsubActivity();
      unsubEvents();
    };
  }, [user, workspaceId]);

  const logActivity = useCallback(async (action, details = {}) => {
    if (!user || !workspaceId) return;
    await setDoc(doc(db, `workspaces/${workspaceId}/activity`, Date.now().toString()), {
      action,
      details,
      userName: user.displayName || user.email,
      userId: user.uid,
      timestamp: new Date().toISOString()
    });
  }, [user, workspaceId]);

  const createWorkspace = async (name) => {
    if (!user) return null;
    
    try {
      const newWorkspaceId = Date.now().toString();
      console.log('Creating workspace with ID:', newWorkspaceId);
      
      await setDoc(doc(db, 'workspaces', newWorkspaceId), {
        name: name || 'My Workspace',
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        members: [user.uid]
      });

      setWorkspaceId(newWorkspaceId);
      setWorkspaceName(name || 'My Workspace');
      console.log('Workspace created successfully');
      
      return newWorkspaceId;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  };

  const joinWorkspace = async (workspaceIdToJoin) => {
    if (!user) return false;

    const workspaceDoc = await getDoc(doc(db, 'workspaces', workspaceIdToJoin));
    if (!workspaceDoc.exists()) {
      return false;
    }

    const workspaceData = workspaceDoc.data();
    if (!workspaceData.members.includes(user.uid)) {
      await updateDoc(doc(db, 'workspaces', workspaceIdToJoin), {
        members: arrayUnion(user.uid)
      });
    }

    setWorkspaceId(workspaceIdToJoin);
    setWorkspaceName(workspaceData.name || 'My Workspace');
    logActivity('joined a workspace', { workspaceName: workspaceData.name });
    
    return true;
  };

  const addTodo = async (text) => {
    if (!workspaceId) return;
    await setDoc(doc(db, `workspaces/${workspaceId}/todos`, Date.now().toString()), {
      text,
      completed: false,
      createdAt: new Date().toISOString(),
      createdBy: user.uid
    });
    logActivity('added a task', { text });
  };

  const toggleTodo = async (id) => {
    if (!workspaceId) return;
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    await updateDoc(doc(db, `workspaces/${workspaceId}/todos`, id), { completed: !todo.completed });
    logActivity(todo.completed ? 'reopened a task' : 'completed a task');
  };

  const deleteTodo = async (id) => {
    if (!workspaceId) return;
    await deleteDoc(doc(db, `workspaces/${workspaceId}/todos`, id));
    logActivity('deleted a task');
  };

  const editTodo = async (id, newText) => {
    if (!workspaceId) return;
    await updateDoc(doc(db, `workspaces/${workspaceId}/todos`, id), { text: newText });
    logActivity('edited a task');
  };

  const fetchFiles = useCallback(async () => {
    if (!workspaceId) return;
    const listRef = ref(storage, `workspaces/${workspaceId}`);
    const res = await listAll(listRef);
    const fileData = await Promise.all(res.items.map(async (item) => ({
      name: item.name,
      url: await getDownloadURL(item),
      size: 0 
    })));
    setFiles(fileData);
  }, [workspaceId]);

  const uploadFile = async (file) => {
    if (!workspaceId) return;
    await uploadBytes(ref(storage, `workspaces/${workspaceId}/${file.name}`), file);
    fetchFiles();
    logActivity('uploaded a file', { fileName: file.name });
  };

  const logout = async () => {
    await signOut(auth);
    setWorkspaceId(null);
    setWorkspaceName('');
  };

  const value = {
    user, loading, workspaceId, setWorkspaceId, workspaceName, currentTab, setCurrentTab,
    todos, filter, setFilter, activity, events, files,
    addTodo, toggleTodo, deleteTodo, editTodo, uploadFile, fetchFiles, logActivity,
    createWorkspace, joinWorkspace, logout
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};