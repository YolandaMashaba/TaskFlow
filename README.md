# TaskFlow

TaskFlow is a modern, collaborative workspace application designed to streamline daily productivity and team organization. It combines robust task tracking with essential project management tools in a clean, unified dashboard, eliminating the need to jump between multiple apps.

## Key Features

- **Smart Task Management**: Create, edit, and organize tasks seamlessly. A native filtering and search system allows you to instantly toggle between All, Active, and Completed items.
- **Integrated Calendar**: Visual scheduling to track project deadlines, milestones, and daily agendas.
- **File Sharing**: A dedicated space to manage and share project assets and documentation directly within the platform.
- **Real-Time Collaboration**: Built-in presence tracking and activity feeds keep you connected with teammates, displaying who is online and providing live updates on task progress.
- **Workspace Statistics**: High-level dashboard metrics that track total, active, and completed tasks at a single glance to help measure productivity.
- **Workspace Sharing**: Share your workspace with others via a unique link, allowing team members to register, login, and collaborate in real-time.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Firebase project with Authentication, Firestore, and Storage enabled

### Firebase Setup

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create a Firestore Database
4. Enable Storage
5. Get your Firebase configuration from Project Settings

### Configuration

1. Clone the repository:
```bash
git clone <repository-url>
cd TaskFlow
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
Update `src/firebase.js` with your Firebase configuration:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

4. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Usage

### Authentication

1. **Register**: Create a new account with your email and password
2. **Login**: Sign in with your credentials
3. **Workspace Selection**: Create a new workspace or join an existing one using a workspace ID

### Workspace Sharing

1. Click the "Share Workspace" button in the sidebar
2. Copy the generated link
3. Share the link with team members
4. Team members can register/login and join your workspace automatically

### Task Management

- **Add Tasks**: Use the input field at the top to create new tasks
- **Edit Tasks**: Double-click on a task text or click the edit button
- **Complete Tasks**: Click the checkbox to mark tasks as done
- **Delete Tasks**: Click the delete button to remove tasks
- **Filter Tasks**: Use the filter buttons to view All, Active, or Completed tasks
- **Search Tasks**: Use the search bar to find specific tasks

### Calendar

- View and manage events in the integrated calendar
- Click on dates to add new events
- Drag and drop to reschedule events

### File Sharing

- Upload files directly to your workspace
- Share documents and assets with team members
- All files are stored in Firebase Storage

### Activity Feed

- Track real-time activity from all team members
- See who added, completed, or deleted tasks
- Monitor file uploads and other workspace changes

## Technology Stack

- **Frontend**: React 19
- **Routing**: React Router DOM
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **UI Components**: Lucide React Icons
- **Calendar**: FullCalendar
- **Styling**: Custom CSS with CSS Variables

## Project Structure

```
TaskFlow/
├── public/
├── src/
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React Context providers
│   ├── pages/           # Page components (Login, Register, Workspace)
│   ├── App.js           # Main application component with routing
│   ├── App.css          # Global styles
│   └── firebase.js      # Firebase configuration
├── package.json
└── README.md
```

## Security Notes

- Ensure your Firebase security rules are properly configured
- Enable email verification for user registration
- Use environment variables for sensitive configuration in production
- Regularly update dependencies to address security vulnerabilities

## License

This project is licensed under the MIT License.