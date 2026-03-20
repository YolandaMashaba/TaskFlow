import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc 
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
  const [workspaceId] = useState('default-workspace'); 
  const [currentTab, setCurrentTab] = useState('todos');
  const [todos, setTodos] = useState([]);
  const [activity, setActivity] = useState([]);
  const [events, setEvents] = useState([]);
  const [files, setFiles] = useState([]);
  const [filter, setFilter] = useState('all');

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

    return () => {
      unsubTodos();
      unsubActivity();
      unsubEvents();
    };
  }, [user, workspaceId]);

  const logActivity = useCallback(async (action, details = {}) => {
    if (!user) return;
    await setDoc(doc(db, `workspaces/${workspaceId}/activity`, Date.now().toString()), {
      action,
      details,
      userName: user.displayName || user.email,
      userId: user.uid,
      timestamp: new Date().toISOString()
    });
  }, [user, workspaceId]);

  const addTodo = async (text) => {
    await setDoc(doc(db, `workspaces/${workspaceId}/todos`, Date.now().toString()), {
      text,
      completed: false,
      createdAt: new Date().toISOString(),
      createdBy: user.uid
    });
    logActivity('added a task', { text });
  };

  const toggleTodo = async (id) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    await updateDoc(doc(db, `workspaces/${workspaceId}/todos`, id), { completed: !todo.completed });
    logActivity(todo.completed ? 'reopened a task' : 'completed a task');
  };

  const deleteTodo = async (id) => {
    await deleteDoc(doc(db, `workspaces/${workspaceId}/todos`, id));
    logActivity('deleted a task');
  };

  const fetchFiles = useCallback(async () => {
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
    await uploadBytes(ref(storage, `workspaces/${workspaceId}/${file.name}`), file);
    fetchFiles();
    logActivity('uploaded a file', { fileName: file.name });
  };

  const value = {
    user, loading, workspaceId, currentTab, setCurrentTab,
    todos, filter, setFilter, activity, events, files,
    addTodo, toggleTodo, deleteTodo, uploadFile, fetchFiles, logActivity
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};