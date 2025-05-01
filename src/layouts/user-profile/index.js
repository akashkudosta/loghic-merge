import { useState, useEffect } from "react";
import { Tabs, Tab, Box, Card, Grid, Checkbox, FormControlLabel } from "@mui/material"; 
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";
import MDAvatar from "components/MDAvatar"; 
import DashboardLayout from "examples/LayoutContainers/DashboardLayout"; 
import userPlaceholderImage from "assets/images/user-placehoder.png"; 
import AuthService from "../../services/auth-service";

// TabPanel component to handle tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
      style={{ padding: '24px 0' }}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const UserProfile = () => {
  const [tabValue, setTabValue] = useState(0);
  const [notification, setNotification] = useState(false);
  const [user, setUser] = useState({
    User_Name: "",
    User_Fname: "",
    User_Lname: "",
    User_Email: "",
    User_Phone: "",
    User_Address: "",
    User_About: "",
    User_HeroLine: "",
    User_ImageURL: userPlaceholderImage,
    User_CurrentPassword: "",
    User_NewPassword: "",
    User_ConfirmPassword: ""
  });

  const [settings, setSettings] = useState({
    User_IsAdminTF: false,
    User_IsCompaniesAdminTF: false,
    User_IsEventsAdminTF: false,
    User_IsAllowedPostTF: false,
    User_IsAllowedPersonalPageTF: false,
    User_IsAllowedSubscribersTF: false
  });

  const [errors, setErrors] = useState({
    User_NameError: false,
    User_EmailError: false,
    User_CurrentPasswordError: false,
    User_NewPasswordError: false,
    User_ConfirmPasswordError: false,
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const fetchUserData = async () => {
    try {
      const response = await AuthService.getUserProfile("123"); // Replace with actual user ID
      if (response && response.data) {
        setUser(response.data);
        setSettings({
          User_IsAdminTF: response.data.User_IsAdminTF || false,
          User_IsCompaniesAdminTF: response.data.User_IsCompaniesAdminTF || false,
          User_IsEventsAdminTF: response.data.User_IsEventsAdminTF || false,
          User_IsAllowedPostTF: response.data.User_IsAllowedPostTF || false,
          User_IsAllowedPersonalPageTF: response.data.User_IsAllowedPersonalPageTF || false,
          User_IsAllowedSubscribersTF: response.data.User_IsAllowedSubscribersTF || false
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (notification) {
      setTimeout(() => {
        setNotification(false);
      }, 5000);
    }
  }, [notification]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  const handleSettingsChange = (e) => {
    const { name, checked } = e.target;
    setSettings({
      ...settings,
      [name]: checked,
    });
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Handle file upload logic here
      // console.log("File to upload:", file);
      
      // For preview
      const reader = new FileReader();
      reader.onload = () => {
        setUser({
          ...user,
          profileImage: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateEditProfile = () => {
    const errors = {};
    
    if (!user.User_Fname.trim()) {
      errors.User_FnameError = true;
    }
    
    if (!user.User_Lname.trim()) {
      errors.User_LnameError = true;
    }
    
    if (!user.User_Email.trim() || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(user.User_Email)) {
      errors.User_EmailError = true;
    }
    
    return errors;
  };

  const validateChangePassword = () => {
    const errors = {};
    
    if (!user.User_CurrentPassword.trim()) {
      errors.User_CurrentPasswordError = true;
    }
    
    if (!user.User_NewPassword.trim() || user.User_NewPassword.length < 8) {
      errors.User_NewPasswordError = true;
    }
    
    if (!user.User_ConfirmPassword.trim() || user.User_ConfirmPassword !== user.User_NewPassword) {
      errors.User_ConfirmPasswordError = true;
    }
    
    return errors;
  };

  const saveProfileChanges = async () => {
    const validationErrors = validateEditProfile();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      // Combine first and last name
      const fullName = `${user.User_Fname} ${user.User_Lname}`.trim();
      
      const userData = {
        data: {
          type: "profile",
          attributes: { 
            User_Name: fullName,
            User_Fname: user.User_Fname,
            User_Lname: user.User_Lname,
            User_Email: user.User_Email,
            User_Phone: user.User_Phone,
            User_Address: user.User_Address,
            User_About: user.User_About,
            User_HeroLine: user.User_HeroLine,
            User_ImageURL: user.User_ImageURL
          }
        }
      };
      
      await AuthService.updateProfile(userData);
      setNotification(true);
      
      // Reset errors
      setErrors({});
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const saveSettings = async () => {
    try {
      const settingsData = {
        data: {
          type: "settings",
          attributes: { 
              ...settings 
          }
        }
      };
      
      // API call to save settings
      await AuthService.updateUserSettings(settingsData); 
      
      setNotification(true);
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const changePassword = async () => {
    const validationErrors = validateChangePassword();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      const passwordData = {
        data: {
          type: "password",
          attributes: {
            User_CurrentPassword: user.User_CurrentPassword,
            User_NewPassword: user.User_NewPassword,
            User_ConfirmPassword: user.User_ConfirmPassword
          }
        }
      };
      
      // API call to change password
      await AuthService.changePassword(passwordData); 
      // Reset password fields
      setUser({
        ...user,
        User_CurrentPassword: "",
        User_NewPassword: "",
        User_ConfirmPassword: ""
      });
      
      setNotification(true);
      setErrors({});
    } catch (error) {
      console.error("Error changing password:", error);
    }
  };

  return (
    <DashboardLayout> 
      <MDBox pt={6} pb={3}>
        {/* Page title */}
        <MDTypography variant="h2" fontWeight="medium" color="info" mb={3}>
          Profile
        </MDTypography>
        
        <Card>
          {/* Tabs */}
          <MDBox p={0}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: '#1976d2',
                  height: '3px'
                },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 400,
                  fontSize: '1rem',
                  color: 'rgba(0, 0, 0, 0.6)',
                  '&.Mui-selected': {
                    color: '#1976d2',
                    fontWeight: 500
                  }
                },
                borderBottom: '1px solid #e0e0e0'
              }}
            >
              <Tab label="Overview" />
              <Tab label="Edit Profile" />
              <Tab label="Settings" />
              <Tab label="Change Password" />
            </Tabs>
          </MDBox> 
          {/* Tab content */}
          <MDBox px={3}>
            {/* Overview Tab */}
            <TabPanel value={tabValue} index={0}>
              <MDBox>
                <MDTypography variant="h5" fontWeight="medium" color="info" mb={2}>
                  About
                </MDTypography>
                <MDTypography variant="body2" color="text" fontStyle="italic" mb={2}>
                  {user.User_About}
                </MDTypography>
                
                <MDTypography variant="h5" fontWeight="medium" color="info" mb={2}>
                  Hero Line
                </MDTypography>
                <MDTypography variant="body2" color="text" fontStyle="italic" mb={2}>
                  {user.User_HeroLine}
                </MDTypography>
                
                <MDTypography variant="h5" fontWeight="medium" color="info" mb={4}>
                  Profile Details
                </MDTypography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <MDTypography variant="h6" fontWeight="medium" color="info">
                      Full Name
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <MDTypography variant="body2" color="text">
                      {user.User_Name || 'N/A'}
                    </MDTypography>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <MDTypography variant="h6" fontWeight="medium" color="info">
                      Gender
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <MDTypography variant="body2" color="text">
                      {user.User_Gender || 'N/A'}
                    </MDTypography>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <MDTypography variant="h6" fontWeight="medium" color="info">
                      Email
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <MDTypography variant="body2" color="text">
                      {user.User_Email || 'N/A'}
                    </MDTypography>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <MDTypography variant="h6" fontWeight="medium" color="info">
                      Phone Number
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <MDTypography variant="body2" color="text">
                      {user.User_Phone || 'N/A'}
                    </MDTypography>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <MDTypography variant="h6" fontWeight="medium" color="info">
                      Role
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <MDTypography variant="body2" color="text">
                      {user.User_Role || 'N/A'}
                    </MDTypography>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <MDTypography variant="h6" fontWeight="medium" color="info">
                      Address
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <MDTypography variant="body2" color="text">
                      {user.User_Address || 'N/A'}
                    </MDTypography>
                  </Grid>
                </Grid>
              </MDBox>
            </TabPanel>
            
            {/* Edit Profile Tab */}
            <TabPanel value={tabValue} index={1}>
              <MDBox>
                <MDTypography variant="h6" fontWeight="medium" color="info" mb={2}>
                  Profile Image
                </MDTypography>
                
                <MDBox mb={4} display="flex" flexDirection="column" alignItems="flex-start">
                  <MDAvatar 
                    src={user.User_ImageURL || userPlaceholderImage} 
                    alt="Profile Image" 
                    size="xl" 
                    shadow="sm"
                    sx={{ mb: 2 }}
                  />
                  
                  <MDButton
                    variant="contained"
                    component="label"
                    color="info"
                    size="small"
                  >
                    Upload
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                    />
                  </MDButton>
                </MDBox>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <MDBox mb={2}>
                      <MDTypography variant="h6" fontWeight="medium" color="info" mb={1}>
                        First Name
                      </MDTypography>
                      <MDInput
                        fullWidth
                        name="User_Fname"
                        value={user.User_Fname}
                        onChange={handleInputChange}
                        error={errors.User_FnameError}
                      />
                      {errors.User_FnameError && (
                        <MDTypography variant="caption" color="error">
                          First name is required
                        </MDTypography>
                      )}
                    </MDBox>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <MDBox mb={2}>
                      <MDTypography variant="h6" fontWeight="medium" color="info" mb={1}>
                        Last Name
                      </MDTypography>
                      <MDInput
                        fullWidth
                        name="User_Lname"
                        value={user.User_Lname}
                        onChange={handleInputChange}
                        error={errors.User_LnameError}
                      />
                      {errors.User_LnameError && (
                        <MDTypography variant="caption" color="error">
                          Last name is required
                        </MDTypography>
                      )}
                    </MDBox>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <MDBox mb={2}>
                      <MDTypography variant="h6" fontWeight="medium" color="info" mb={1}>
                        Email
                      </MDTypography>
                      <MDInput
                        fullWidth
                        type="email"
                        name="User_Email"
                        value={user.User_Email}
                        onChange={handleInputChange}
                        error={errors.User_EmailError}
                      />
                      {errors.User_EmailError && (
                        <MDTypography variant="caption" color="error">
                          Valid email is required
                        </MDTypography>
                      )}
                    </MDBox>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <MDBox mb={2}>
                      <MDTypography variant="h6" fontWeight="medium" color="info" mb={1}>
                        Phone Number
                      </MDTypography>
                      <MDInput
                        fullWidth
                        name="User_Phone"
                        value={user.User_Phone}
                        onChange={handleInputChange}
                      />
                    </MDBox>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <MDBox mb={2}>
                      <MDTypography variant="h6" fontWeight="medium" color="info" mb={1}>
                        Address
                      </MDTypography>
                      <MDInput
                        fullWidth
                        name="User_Address"
                        value={user.User_Address}
                        onChange={handleInputChange}
                      />
                    </MDBox>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <MDBox mb={2}>
                      <MDTypography variant="h6" fontWeight="medium" color="info" mb={1}>
                        About
                      </MDTypography>
                      <MDInput
                        fullWidth
                        multiline
                        rows={3}
                        name="User_About"
                        value={user.User_About}
                        onChange={handleInputChange}
                      />
                    </MDBox>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <MDBox mb={2}>
                      <MDTypography variant="h6" fontWeight="medium" color="info" mb={1}>
                        Hero Line
                      </MDTypography>
                      <MDInput
                        fullWidth
                        multiline
                        rows={3}
                        name="User_HeroLine"
                        value={user.User_HeroLine}
                        onChange={handleInputChange}
                      />
                    </MDBox>
                  </Grid>
                </Grid>
                
                <MDBox mt={4} display="flex" justifyContent="flex-end">
                  <MDButton
                    variant="contained"
                    color="info"
                    onClick={saveProfileChanges}
                  >
                    Save Changes
                  </MDButton>
                </MDBox>
              </MDBox>
            </TabPanel>
            
            {/* Settings Tab */}
            <TabPanel value={tabValue} index={2}>
              <MDBox>
                <MDBox mb={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={settings.User_IsAdminTF}
                        onChange={handleSettingsChange}
                        name="User_IsAdminTF"
                        color="primary"
                      />
                    }
                    label="Is Master Admin"
                  />
                </MDBox>
                
                <MDBox mb={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={settings.User_IsCompaniesAdminTF}
                        onChange={handleSettingsChange}
                        name="User_IsCompaniesAdminTF"
                        color="primary"
                      />
                    }
                    label="Allow user to manage companies"
                  />
                </MDBox>
                
                <MDBox mb={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={settings.User_IsEventsAdminTF}
                        onChange={handleSettingsChange}
                        name="User_IsEventsAdminTF"
                        color="primary"
                      />
                    }
                    label="Allow user to manage events"
                  />
                </MDBox>
                
                <MDBox mb={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={settings.User_IsAllowedPostTF}
                        onChange={handleSettingsChange}
                        name="User_IsAllowedPostTF"
                        color="primary"
                      />
                    }
                    label="Allow user to post posts"
                  />
                </MDBox>
                
                <MDBox mb={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={settings.User_IsAllowedPersonalPageTF}
                        onChange={handleSettingsChange}
                        name="User_IsAllowedPersonalPageTF"
                        color="primary"
                      />
                    }
                    label="User has personal page"
                  />
                </MDBox>
                
                <MDBox mb={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={settings.User_IsAllowedSubscribersTF}
                        onChange={handleSettingsChange}
                        name="User_IsAllowedSubscribersTF"
                        color="primary"
                      />
                    }
                    label="User allowed to have subscribers"
                  />
                </MDBox>
                
                <MDBox mt={4} display="flex" justifyContent="flex-end">
                  <MDButton
                    variant="contained"
                    color="info"
                    onClick={saveSettings}
                  >
                    Save Changes
                  </MDButton>
                </MDBox>
              </MDBox>
            </TabPanel>
            
            {/* Change Password Tab */}
            <TabPanel value={tabValue} index={3}>
              <MDBox>
                <MDBox mb={3}>
                  <MDTypography variant="h6" fontWeight="medium" color="info" mb={1}>
                    Current Password
                  </MDTypography>
                  <MDInput
                    fullWidth
                    type="password"
                    name="User_CurrentPassword"
                    value={user.User_CurrentPassword}
                    onChange={handleInputChange}
                    error={errors.User_CurrentPasswordError}
                  />
                  {errors.User_CurrentPasswordError && (
                    <MDTypography variant="caption" color="error">
                      Current password is required
                    </MDTypography>
                  )}
                </MDBox>
                
                <MDBox mb={3}>
                  <MDTypography variant="h6" fontWeight="medium" color="info" mb={1}>
                    New Password
                  </MDTypography>
                  <MDInput
                    fullWidth
                    type="password"
                    name="User_NewPassword"
                    value={user.User_NewPassword}
                    onChange={handleInputChange}
                    error={errors.User_NewPasswordError}
                  />
                  {errors.User_NewPasswordError && (
                    <MDTypography variant="caption" color="error">
                      New password must be at least 8 characters
                    </MDTypography>
                  )}
                </MDBox>
                
                <MDBox mb={3}>
                  <MDTypography variant="h6" fontWeight="medium" color="info" mb={1}>
                    Confirm Password
                  </MDTypography>
                  <MDInput
                    fullWidth
                    type="password"
                    name="User_ConfirmPassword"
                    value={user.User_ConfirmPassword}
                    onChange={handleInputChange}
                    error={errors.User_ConfirmPasswordError}
                  />
                  {errors.User_ConfirmPasswordError && (
                    <MDTypography variant="caption" color="error">
                      Passwords do not match
                    </MDTypography>
                  )}
                </MDBox>
                
                <MDBox mt={4} display="flex" justifyContent="flex-end">
                  <MDButton
                    variant="contained"
                    color="info"
                    onClick={changePassword}
                  >
                    Change Password
                  </MDButton>
                </MDBox>
              </MDBox>
            </TabPanel>
          </MDBox>
          {notification && (
            <MDAlert color="success" mt={2} mx={2}>
              <MDTypography variant="body2" color="white">
                Your changes have been saved successfully!
              </MDTypography>
            </MDAlert>
          )}
        </Card>
      </MDBox> 
    </DashboardLayout>
  );
};

export default UserProfile;
