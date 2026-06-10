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
  getDocs,
  arrayUnion,
  where
} from 'firebase/firestore';
import { auth, db } from '../firebase';

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
  const [filter, setFilter] = useState('all');
  const [workspaceName, setWorkspaceName] = useState('');
  const [userWorkspaces, setUserWorkspaces] = useState([]);

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
      
      // Store user data in Firestore users collection
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0],
        photoURL: user.photoURL
      }, { merge: true });
      
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

  const joinWorkspace = async (workspaceIdentifier) => {
    if (!user) return false;

    console.log('Attempting to join workspace:', workspaceIdentifier);
    
    // First try as ID
    let workspaceDoc = await getDoc(doc(db, 'workspaces', workspaceIdentifier));
    let workspaceId = workspaceIdentifier;
    
    // If not found by ID, try by name
    if (!workspaceDoc.exists()) {
      console.log('Workspace not found by ID, searching by name...');
      const q = query(collection(db, 'workspaces'), where('name', '==', workspaceIdentifier));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.error('Workspace not found by ID or name:', workspaceIdentifier);
        return false;
      }
      
      workspaceDoc = querySnapshot.docs[0];
      workspaceId = workspaceDoc.id;
    }
    
    if (!workspaceDoc.exists()) {
      console.error('Workspace does not exist:', workspaceIdentifier);
      return false;
    }

    const workspaceData = workspaceDoc.data();
    console.log('Workspace found:', workspaceData);
    console.log('Current members:', workspaceData.members);
    
    if (!workspaceData.members.includes(user.uid)) {
      console.log('Adding user to workspace members:', user.uid);
      
      // Store user data in Firestore users collection
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0],
        photoURL: user.photoURL
      }, { merge: true });
      
      await updateDoc(doc(db, 'workspaces', workspaceId), {
        members: arrayUnion(user.uid)
      });
      console.log('User added to workspace members');
    } else {
      console.log('User already a member of workspace');
    }

    setWorkspaceId(workspaceId);
    setWorkspaceName(workspaceData.name || 'My Workspace');
    logActivity('joined a workspace', { workspaceName: workspaceData.name });
    
    return true;
  };

  const addTodo = async (text, assignees = [], dueDate = null, description = '') => {
    if (!workspaceId) return;
    const todoId = Date.now().toString();
    const todoData = {
      text,
      completed: false,
      createdAt: new Date().toISOString(),
      createdBy: user.uid,
      status: 'todo', // todo, in-progress, done
      assignees: Array.isArray(assignees) ? assignees : [],
      dueDate: dueDate,
      description: description
    };
    
    await setDoc(doc(db, `workspaces/${workspaceId}/todos`, todoId), todoData);
    logActivity('added a task', { text });
    
    // Create calendar event if due date is set
    if (dueDate) {
      const assigneeNames = Array.isArray(assignees) ? assignees.join(', ') : '';
      await setDoc(doc(db, `workspaces/${workspaceId}/events`, `todo-${todoId}`), {
        title: text,
        start: dueDate,
        end: dueDate,
        allDay: true,
        createdBy: user.uid,
        assignee: assigneeNames,
        todoId: todoId,
        isTodoEvent: true,
        description: description
      });
    }
  };

  const toggleTodo = async (id) => {
    if (!workspaceId) return;
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    await updateDoc(doc(db, `workspaces/${workspaceId}/todos`, id), { completed: !todo.completed });
    logActivity(todo.completed ? 'reopened a task' : 'completed a task');
  };

  const updateTodoStatus = async (id, status) => {
    if (!workspaceId) return;
    await updateDoc(doc(db, `workspaces/${workspaceId}/todos`, id), { status });
    logActivity(`moved a task to ${status}`);
  };

  const deleteTodo = async (id) => {
    if (!workspaceId) return;
    await deleteDoc(doc(db, `workspaces/${workspaceId}/todos`, id));
    logActivity('deleted a task');
  };

  const editTodo = async (id, newText, assignees = [], dueDate = null, description = '') => {
    if (!workspaceId) return;
    const updateData = { text: newText };
    if (assignees !== undefined) updateData.assignees = Array.isArray(assignees) ? assignees : (assignees ? [assignees] : []);
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (description !== undefined) updateData.description = description;
    
    await updateDoc(doc(db, `workspaces/${workspaceId}/todos`, id), updateData);
    logActivity('edited a task');
    
    // Update or create calendar event
    const todo = todos.find(t => t.id === id);
    if (dueDate) {
      const assigneeNames = Array.isArray(assignees) ? assignees.join(', ') : (assignees || '');
      await setDoc(doc(db, `workspaces/${workspaceId}/events`, `todo-${id}`), {
        title: newText || todo?.text,
        start: dueDate,
        end: dueDate,
        allDay: true,
        createdBy: user.uid,
        assignee: assigneeNames,
        todoId: id,
        isTodoEvent: true,
        description: description
      }, { merge: true });
    } else if (todo?.dueDate && !dueDate) {
      // Remove calendar event if due date is removed
      await deleteDoc(doc(db, `workspaces/${workspaceId}/events`, `todo-${id}`));
    }
  };


  const logout = async () => {
    await signOut(auth);
    setWorkspaceId(null);
    setWorkspaceName('');
    setUserWorkspaces([]);
  };

  const fetchUserWorkspaces = useCallback(async () => {
    if (!user) return [];
    
    try {
      console.log('Fetching workspaces for user:', user.uid);
      
      // Fetch workspaces where user is a member
      const memberQuery = query(collection(db, 'workspaces'), where('members', 'array-contains', user.uid));
      const memberSnapshot = await getDocs(memberQuery);
      
      // Fetch workspaces where user is the creator
      const creatorQuery = query(collection(db, 'workspaces'), where('createdBy', '==', user.uid));
      const creatorSnapshot = await getDocs(creatorQuery);
      
      // Combine both sets of workspaces, removing duplicates
      const allWorkspaces = new Map();
      
      memberSnapshot.docs.forEach(doc => {
        allWorkspaces.set(doc.id, { id: doc.id, ...doc.data() });
      });
      
      creatorSnapshot.docs.forEach(doc => {
        allWorkspaces.set(doc.id, { id: doc.id, ...doc.data() });
      });
      
      const workspaces = Array.from(allWorkspaces.values());
      console.log('Found workspaces:', workspaces);
      setUserWorkspaces(workspaces);
      return workspaces;
    } catch (error) {
      console.error('Error fetching user workspaces:', error);
      return [];
    }
  }, [user]);

  const deleteWorkspace = async (workspaceIdToDelete) => {
    if (!user) return false;
    
    try {
      // Check if user is the creator
      const workspaceDoc = await getDoc(doc(db, 'workspaces', workspaceIdToDelete));
      if (!workspaceDoc.exists()) return false;
      
      const workspaceData = workspaceDoc.data();
      if (workspaceData.createdBy !== user.uid) {
        console.error('Only workspace creator can delete workspace');
        return false;
      }

      await deleteDoc(doc(db, 'workspaces', workspaceIdToDelete));
      
      // Refresh the workspaces list
      await fetchUserWorkspaces();
      
      // If the deleted workspace was the current one, clear it
      if (workspaceId === workspaceIdToDelete) {
        setWorkspaceId(null);
        setWorkspaceName('');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting workspace:', error);
      return false;
    }
  };

  const leaveWorkspace = async () => {
    if (!user || !workspaceId) return false;
    
    try {
      const workspaceDoc = await getDoc(doc(db, 'workspaces', workspaceId));
      if (!workspaceDoc.exists()) return false;
      
      const workspaceData = workspaceDoc.data();
      
      // Remove user from members array (even if they're the creator)
      const updatedMembers = workspaceData.members.filter(memberId => memberId !== user.uid);
      await updateDoc(doc(db, 'workspaces', workspaceId), {
        members: updatedMembers
      });

      setWorkspaceId(null);
      setWorkspaceName('');
      
      return true;
    } catch (error) {
      console.error('Error leaving workspace:', error);
      return false;
    }
  };

  const value = {
    user, loading, workspaceId, setWorkspaceId, workspaceName, currentTab, setCurrentTab,
    todos, filter, setFilter, activity, events, userWorkspaces,
    addTodo, toggleTodo, deleteTodo, editTodo, logActivity,
    createWorkspace, joinWorkspace, logout, fetchUserWorkspaces, deleteWorkspace, leaveWorkspace, updateTodoStatus
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};