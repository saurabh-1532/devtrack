import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import GoalDetail from './pages/GoalDetail';
import AddResource from './pages/AddResource';
import ResourceDetail from './pages/ResourceDetail';
import ProgressPage from './pages/ProgressPage';
import ResourcesPage from './pages/ResourcesPage';
import GoalForm from './pages/GoalForm';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';


const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },

  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { path: '', element: <Navigate to="/app/dashboard" /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'goals/new', element: <GoalForm /> },
      { path: 'resources', element: <ResourcesPage /> },
      { path: 'goals/:id', element: <GoalDetail /> },
      { path: 'goals/:id/add-resource', element: <AddResource /> },
      { path: 'resources/:id', element: <ResourceDetail /> },
      { path: 'progress', element: <ProgressPage /> },
      { path: 'profile', element: <ProfilePage /> },
            { path: 'settings',                   element: <SettingsPage />},
    ],
  },
]);

export default router;