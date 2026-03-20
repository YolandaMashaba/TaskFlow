# TaskFlow Collaborative Features Implementation Plan

Current working directory: /Users/damacm175/Desktop/TaskFlow

## Approved Plan Summary
Transform single-user Todo app into collaborative workspace with Firebase (Auth, Firestore realtime todos/activity/events, Storage files).
- Auth & Users
- Shared Realtime Todos (doc collab via Firestore)
- File Sharing (Firebase Storage)
- Activity Tracking (Firestore logs)
- Shared Calendars (Firestore events)

## TODO Steps (Mark as [x] when complete)

### Phase 1: Dependencies & Firebase Setup [ ]
1. [x] Update `package.json`: Add firebase@^10.14.1, react-router-dom@^6.26.2, @fullcalendar/react@^6.1.17, @fullcalendar/daygrid@^6.1.17, @fullcalendar/interaction@^6.1.17 (for calendar)
2. [x] Run `npm install`
3. [x] Create `src/firebase.js` with config (placeholder → user provides real keys)
4. [x] Test: Verified deps import ok (full test after App.js)

### Phase 2: Auth & Context [ ]
5. [x] Create `src/contexts/AppContext.js` (user, workspaceId, todos state)
6. [x] Update `src/App.js`: Wrap in Router/Context, Auth flow, Firebase init
7. [ ] Create `src/components/Auth.jsx` (login/register UI)
8. [ ] Test: Login/logout, user state persists

### Phase 3: Shared Todos Realtime [ ]
9. [x] Update Todo components to use Context/Firestore (App.js queries/subs, pass callbacks)
10. [x] Replace localStorage with Firestore `workspaces/{workspaceId}/todos`
11. [x] Add workspace create/join (randomId or named)
12. [ ] Test: Multi-tab/browser realtime sync, CRUD

### Phase 4: New Features [ ]
13. [x] Create `src/components/Navigation.jsx` (tabs: Todos/Files/Activity/Calendar/Users)
14. [x] `src/components/UserList.jsx` (list online users via presence)
15. [x] `src/components/FileShare.jsx` (upload/list/download Storage files)
16. [x] `src/components/ActivityFeed.jsx` (Firestore activity logs)
17. [x] `src/components/Calendar.jsx` (FullCalendar + todo-linked events)
18. [x] Update `src/App.css` for new layouts

### Phase 5: Polish & Test [ ]
19. [ ] Realtime presence/cursors in TodoItem for collab feel
20. [ ] Stats: Include per-user/collaborative metrics
21. [ ] Error handling, loading states
22. [ ] Test full flow: Share workspace link, collab in realtime
23. [ ] `npm start` demo

## Next Step
Phase 1. Commands ready after files updated.

Track progress by updating this file after each phase/step.

