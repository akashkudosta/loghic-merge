/** 
  All of the routes for the Loghic React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that has other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/
// Backend pages
// React layouts
import AdminDashboard from "layouts/dashboard";  
import AdminUserProfile from "layouts/user-profile";
import UserManagement from "layouts/user-management";
import CompanyManagement from "layouts/company-management";
import PostManagement from "layouts/post-management";
import Login from "auth/login";
import Register from "auth/register";
import ForgotPassword from "auth/forgot-password";
import ResetPassword from "auth/reset-password"; 
// @mui icons
import Icon from "@mui/material/Icon";
// Frontend pages
import Home from "frontend/pages/Home";
import Contact from "frontend/pages/Contact";
import Tokens from "frontend/pages/Tokens";
import CoinProfile from "frontend/pages/CoinProfile";
import CalendarPage from "frontend/pages/CalendarPage";
import AdvisorPage from "frontend/pages/Advisor";
import AdvisorProfile from "frontend/pages/AdvisorProfile";
import UserProfile from "frontend/pages/UserProfile";
import Messages from "frontend/pages/Messages";
import Notifications from "frontend/pages/Notifications";
import ProtectedRoute from "components/ProtectedRoute";
import Dashboard from "frontend/dashboard/DashBoard";
import Contacts from "frontend/dashboard/Contacts";
import Overview from "frontend/dashboard/Overview";
import Followers from "frontend/dashboard/Followers";
import MyCards from "frontend/dashboard/MyCards";
import Subscriptions from "frontend/dashboard/Subscriptions";
import Password from "frontend/dashboard/Password";
import FlaggedComments from "frontend/dashboard/FlaggedComments";
import Security from "frontend/dashboard/Security";
import PrivacyPolicy from "frontend/dashboard/PrivacyPolicy";
import DashboardNotifications from "frontend/dashboard/Notifications";
import HelpSupport from "frontend/dashboard/HelpSupport";
import DeleteAccount from "frontend/dashboard/DeleteAccount";
import MyPosts from "frontend/dashboard/MyPosts";
import AddPost from "frontend/dashboard/AddPost";
import SearchPage from "frontend/pages/SearchPage";


const routes = [
  {
    type: "admin",
    name: "Dashboard",
    key: "admin",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/admin",
    component: <ProtectedRoute><AdminDashboard /></ProtectedRoute>,
  }, 
  {
    type: "admin",
    name: "User Profile",
    key: "user-profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/admin/user-profile",
    component: <ProtectedRoute><AdminUserProfile /></ProtectedRoute>,
  },
  {
    type: "admin",
    name: "Users",
    key: "user-management",
    icon: <Icon fontSize="small">list</Icon>,
    route: "/admin/user-management",
    component: <ProtectedRoute><UserManagement /></ProtectedRoute>,
  },
  {
    type: "admin",
    name: "Companies",
    key: "company-management",
    icon: <Icon fontSize="small">business</Icon>,
    route: "/admin/company-management",
    component: <ProtectedRoute><CompanyManagement /></ProtectedRoute>,
  }, 
  {
    type: "admin",
    name: "Posts",
    key: "post-management",
    icon: <Icon fontSize="small">pages</Icon>,
    route: "/admin/post-management",
    component: <ProtectedRoute><PostManagement /></ProtectedRoute>,
  }, 
  {
    type: "collapse",
    name: "Logout",
    key: "logout",
    icon: <Icon fontSize="small">logout</Icon>,
    route: "#",
    component: null,
  },
  {
    type: "auth",
    name: "Login",
    key: "login",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/auth/login",
    component: <Login />,
  },
  {
    type: "auth",
    name: "Register",
    key: "register",
    icon: <Icon fontSize="small">reigster</Icon>,
    route: "/auth/register",
    component: <Register />,
  },
  {
    type: "auth",
    name: "Forgot Password",
    key: "forgot-password",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/auth/forgot-password",
    component: <ForgotPassword />,
  },
  {
    type: "auth",
    name: "Reset Password",
    key: "reset-password",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/auth/reset-password",
    component: <ResetPassword />,
  },
  {
    type: "frontend",
    name: "main",
    key: "main",
    icon: <Icon fontSize="small">home</Icon>,
    route: "/",
    component: <Home />,
  },
  {
    type: "frontend",
    name: "Tokens",
    key: "tokens",
    icon: <Icon fontSize="small">tokens</Icon>,
    route: "/tokens",
    component: <Tokens />,
  },
  {
    type: "frontend",
    name: "Contact",
    key: "contact",
    icon: <Icon fontSize="small">contact</Icon>,
    route: "/contact",
    component: <Contact />,
  },
  {
    type: "frontend",
    name: "Coin Profile",
    key: "coin-profile",
    icon: <Icon fontSize="small">currency_bitcoin</Icon>,
    route: "/coin-profile/:symbol",
    component: <CoinProfile />,
  },
  {
    type: "frontend",
    name: "Calendar",
    key: "calendar",
    icon: <Icon fontSize="small">calendar</Icon>,
    route: "/calendar",
    component: <CalendarPage />,
  },
  {
    type: "frontend",
    name: "Advice",
    key: "advisor",
    icon: <Icon fontSize="small">advisor</Icon>,
    route: "/advice",
    component: <AdvisorPage />,
  },
  {
    type: "frontend",
    name: "Advisor Profile",
    key: "advisor-profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/advisor-profile/:id",
    component: <AdvisorProfile />,
  },
  {
    type: "frontend",
    name: "User Profile",
    key: "user-profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/user-profile/:id",
    component: <UserProfile />,
  },
  {
    type: "frontend",
    name: "Messages",
    key: "messages",
    icon: <Icon fontSize="small">messages</Icon>,
    route: "/messages",
    component: <ProtectedRoute><Messages /></ProtectedRoute>,
  },
  {
    type: "frontend",
    name: "Notifications",
    key: "notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notifications",
    component: <ProtectedRoute><Notifications /></ProtectedRoute>,
  },
  {
    type: "frontend",
    name: "User Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    type: "frontend",
    name: "Contacts",
    key: "dashboard-contacts",
    icon: <Icon fontSize="small">contacts</Icon>,
    route: "/dashboard/contacts",
    component: <ProtectedRoute><Contacts /></ProtectedRoute>,
  },
  {
    type: "frontend",
    name: "Overview",
    key: "dashboard-overview",
    icon: <Icon fontSize="small">assessment</Icon>,
    route: "/dashboard/overview",
    component: <ProtectedRoute><Overview /></ProtectedRoute>,
  },
  {
    type: "frontend",
    name: "Followers",
    key: "dashboard-followers",
    icon: <Icon fontSize="small">people</Icon>,
    route: "/dashboard/followers",
    component: <ProtectedRoute><Followers /></ProtectedRoute>,
  },
  {
    type: "frontend",
    name: "My Posts",
    key: "dashboard-my-posts",
    icon: <Icon fontSize="small">post_add</Icon>,
    route: "/dashboard/my-posts",
    component: <ProtectedRoute><MyPosts /></ProtectedRoute>,
  },
  {
    type: "frontend",
    name: "Add Post",
    key: "dashboard-add-post",
    icon: <Icon fontSize="small">add_circle</Icon>,
    route: "/dashboard/add-post",
    component: <ProtectedRoute><AddPost /></ProtectedRoute>,
  },
  {
    type: "frontend",
    name: "My Cards",
    key: "dashboard-my-cards",
    icon: <Icon fontSize="small">dashboard-my-cards</Icon>,
    route: "/dashboard/my-cards",
    component: <ProtectedRoute><MyCards /></ProtectedRoute>,
  },
  {
    type: "frontend",
    name: "Subscriptions",
    key: "dashboard-subscriptions",
    icon: <Icon fontSize="small">subscriptions</Icon>,
    route: "/dashboard/subscriptions",
    component: <ProtectedRoute><Subscriptions /></ProtectedRoute>,
  },
  {
    type: "frontend",
    name: "Password",
    key: "dashboard-password",
    icon: <Icon fontSize="small">lock</Icon>,
    route: "/dashboard/password",
    component: <ProtectedRoute><Password /></ProtectedRoute>,
  },
  {
    type: "frontend",
    name: "Flagged Comments",
    key: "dashboard-flagged-comments",
    icon: <Icon fontSize="small">flag</Icon>,
    route: "/dashboard/flagged-comments",
    component: <ProtectedRoute><FlaggedComments /></ProtectedRoute>,
  },
  {
    type: "frontend",
    name: "Security",
    key: "dashboard-security",
    icon: <Icon fontSize="small">security</Icon>,
    route: "/dashboard/security",
    component: <ProtectedRoute><Security /></ProtectedRoute>,
  },
  {
    type: "frontend",
    name: "Privacy Policy",
    key: "dashboard-privacy",
    icon: <Icon fontSize="small">policy</Icon>,
    route: "/dashboard/privacy-policy",
    component: <ProtectedRoute><PrivacyPolicy /></ProtectedRoute>,
  },
  {
    type: "frontend",
    name: "Notification",
    key: "dashboard-notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/dashboard/notifications",
    component: <ProtectedRoute><DashboardNotifications /></ProtectedRoute>,
  },
  {
    type: "frontend",
    name: "Help & Support",
    key: "dashboard-help",
    icon: <Icon fontSize="small">help</Icon>,
    route: "/dashboard/help-support",
    component: <ProtectedRoute><HelpSupport /></ProtectedRoute>,
  },
  {
    type: "frontend",
    name: "Delete Account",
    key: "dashboard-delete-account",
    icon: <Icon fontSize="small">delete_forever</Icon>,
    route: "/dashboard/delete-account",
    component: <ProtectedRoute><DeleteAccount /></ProtectedRoute>,
  },
  {
    type: "frontend",
    name: "Search",
    key: "search",
    icon: <Icon fontSize="small">search</Icon>,
    route: "/search", // Keep this as /search
    component: <SearchPage />, // Link to the SearchPage component
  },
];
 
export default [...routes];