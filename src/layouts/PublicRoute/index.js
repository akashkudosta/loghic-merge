import { Navigate } from "react-router-dom";
import MDBox from "components/MDBox";

const PublicRoute = ({ isAuthenticated, isLoading = false, children }) => {
  // If still loading authentication state, show a loading indicator
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

  // If authenticated, redirect to home page
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If not authenticated, render the auth page
  return children;
};

export default PublicRoute; 