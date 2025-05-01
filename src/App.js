import { useState, useEffect, useMemo, useContext } from "react"; 
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline"; 
import MDBox from "components/MDBox"; 
import Sidenav from "components/Sidenav";
import Configurator from "components/Configurator"; 
import theme from "assets/theme";  
import themeDark from "assets/theme-dark";  
import routes from "routes"; 
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context"; 
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png"; 
import { setupAxiosInterceptors } from "./services/interceptor";
import ProtectedRoute from "layouts/ProtectedRoute";
import PublicRoute from "layouts/PublicRoute";
import { AuthContext } from "context";
import { NotificationProvider } from "context/NotificationContext";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Messages from "frontend/pages/Messages";

export default function App() {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, isLoading } = authContext;
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, layout, openConfigurator, sidenavColor, transparentSidenav, whiteSidenav, darkMode } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false); 
  const { pathname } = useLocation();
 
  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // don't need to remove bellow comment code because it was used in future
  // useEffect(() => {
  //   const interval = setInterval(async () => {
  //     const token = localStorage.getItem("token");
  
  //     if (!token) {
  //       authContext.logout(false); // Just logout, no redirect
  //       return;
  //     }
  
  //     try {
  //       const decoded = jwtDecode(token);
  //       if (decoded.exp && decoded.exp * 1000 < Date.now()) {
  //         authContext.logout();
  //         return;
  //       }
  
  //       try {
  //         await axios.get(`${process.env.REACT_APP_API_URL}/me`, {
  //           headers: { Authorization: `Bearer ${token}` }
  //         });
  //       } catch (error) {
  //         authContext.logout(false); // Still no redirect
  //       }
  
  //     } catch (decodeError) {
  //       authContext.logout(false); // Invalid token
  //     }
  //   }, 1000);
  
  //   return () => clearInterval(interval);
  // }, []);

  // if the token expired or other errors it logs out and goes to the login page
  const navigate = useNavigate();
  useEffect(() => {
    setupAxiosInterceptors(() => {
      // This is called on 401/403 responses
      authContext.logout();
    });
  }, []);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);
  
  const getRoutes = (allRoutes) => 
    allRoutes.map((route) => { 
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        // For frontend routes, don't wrap them in ProtectedRoute
        if (route.type === "frontend") {
          return (
            <Route exact path={route.route} element={route.component} key={route.key} />
          );
        }
        
        // For auth routes, wrap in PublicRoute to prevent authenticated access
        if (route.type === "auth") {
          return (
            <Route
              exact
              path={route.route}
              element={
                <PublicRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
                  {route.component}
                </PublicRoute>
              }
              key={route.key}
            />
          );
        }
        
        // For all other routes (admin/dashboard routes), wrap in ProtectedRoute
        return (
          <Route
            exact
            path={route.route}
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
                {route.component}
              </ProtectedRoute>
            }
            key={route.key}
          />
        );
      }
      return null;
    });
 

  // Add a loading state display
  if (isLoading && pathname.includes('/admin') && !pathname.includes('/admin/auth/')) {
    return (
      <ThemeProvider theme={darkMode ? themeDark : theme}>
        <CssBaseline />
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <p>Loading...</p>
        </MDBox>
      </ThemeProvider>
    );
  }

  return (
    <NotificationProvider>
      <ThemeProvider theme={darkMode ? themeDark : theme}>
        <CssBaseline />
        {/* Only render Sidenav and other dashboard components if it's an admin route and authenticated */}
        {layout === "dashboard" && pathname.includes("/admin") && isAuthenticated && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
              brandName="Loghic Dashboard"
              routes={routes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
            <Configurator /> 
          </>
        )}
        
        <Routes> 
          {getRoutes(routes)} 
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </ThemeProvider>
    </NotificationProvider>
  );
}
