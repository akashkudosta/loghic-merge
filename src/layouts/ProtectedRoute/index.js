import { Navigate } from "react-router-dom";
import MDBox from "components/MDBox";

const ProtectedRoute = ({ isAuthenticated, isLoading = false, redirectPath = "/auth/login", children }) => {
  // If still loading authentication state, show a loading indicator instead of redirecting
  if (isLoading) {
    return (
      <MDBox 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <p>Loading...</p>
      </MDBox>
    );
  }

  // Once loaded, if not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // If authenticated, render the protected route
  return children;
};

export default ProtectedRoute;
