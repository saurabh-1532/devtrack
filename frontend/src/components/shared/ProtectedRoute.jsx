import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // still checking localStorage — don't render anything yet
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: '#080910' }}>
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent 
          rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;