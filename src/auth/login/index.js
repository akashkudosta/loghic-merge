import { useContext, useState } from "react"; 
import { Link } from "react-router-dom";
import { Typography, Container, InputBase, Checkbox, FormControlLabel } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography"; 
import MDButton from "components/MDButton";

import AuthRightContent from 'components/AuthRightContent';
import PageLayout from "examples/LayoutContainers/PageLayout";
import logoWhite from "assets/images/logo-login-white.svg";

import AuthService from "services/auth-service";
import { AuthContext } from "context";

function Login() 
{
  const authContext = useContext(AuthContext);

  const [user, setUser] = useState({});
  const [credentialsErros, setCredentialsError] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);

  const [inputs, setInputs] = useState({ email: "", password: "" });

  const [errors, setErrors] = useState({ emailError: false, passwordError: false });

  const addUserHandler = (newUser) => setUser(newUser);

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const changeHandler = (e) => setInputs({ ...inputs, [e.target.name]: e.target.value });

  const submitHandler = async (e) => {
    e.preventDefault();
    setCredentialsError(null);

    const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (inputs.email.trim().length === 0 || !inputs.email.trim().match(mailFormat)) {
      setErrors({ ...errors, emailError: true });
      return;
    }

    if (inputs.password.trim().length < 6) {
      setErrors({ ...errors, passwordError: true });
      return;
    }

    const newUser = { email: inputs.email, password: inputs.password };
    addUserHandler(newUser);

    const myData = { data: { type: "token", attributes: { ...newUser } } };

    try {
      const response = await AuthService.login(myData);
      
      // Check if response has the expected structure
      if (!response || !response.data) {
        throw new Error('Invalid response format from server');
      }

      const { access_token, role } = response.data;
      
      if (!access_token) {
        throw new Error('No access token received');
      }

      authContext.login(access_token, role);
    } catch (error) {
      console.error('Login error:', error);
      if (error.errors && error.errors.length > 0) {
        setCredentialsError(error.errors[0].detail);
      } else if (error.message) {
        setCredentialsError(error.message);
      } else {
        setCredentialsError('An error occurred during login. Please try again.');
      }
    }
  };

  return (
    <PageLayout>
      <MDBox display="flex" minHeight="100vh" width="100%" maxWidth="1440px" mx="auto" px={3} mt={4}>
        <MDBox 
            sx={{ 
              flex: { xs: 1, md: "0 0 33.333%" }, 
              bgcolor: "#0D49C5", 
              display: "flex", 
              flexDirection: "column", 
              p: 4, 
              borderRadius: 2 
            }}
          >
          <MDBox mb={4}><Link to="/" style={{ color: "#fff", textDecoration: "none" }}><img src={logoWhite} alt="Loghic" height="40" /></Link></MDBox>
          <MDBox mb={4} color="#7a90dd">
            <MDTypography variant="h4" fontWeight="bold" sx={{ color: "#fff" }}>Welcome Back</MDTypography>
            <Typography variant="body2" color="#fff">Login to your account</Typography>
          </MDBox>
          <MDBox component="form" onSubmit={submitHandler}>
            <MDBox mb={3}>
              <Typography variant="body2" color="#fff">Email Address</Typography>
              <InputBase name="email" value={inputs.email} onChange={changeHandler} placeholder="Enter your Email Address" fullWidth sx={{ backgroundColor: "#fff", borderRadius: "4px", px: 2, py: 1 }} error={errors.emailError} />
              {errors.emailError && <Typography variant="caption" color="error">Please enter a valid email address</Typography>}
            </MDBox>
            <MDBox mb={3}>
              <Typography variant="body2" color="#fff">Password</Typography>
              <InputBase type="password" name="password" value={inputs.password} onChange={changeHandler} placeholder="Enter Password" fullWidth sx={{ backgroundColor: "#fff", borderRadius: "4px", px: 2, py: 1 }} error={errors.passwordError} />
              {errors.passwordError && <Typography variant="caption" color="error">Password must be at least 6 characters</Typography>}
            </MDBox>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3} color="#fff">
              <FormControlLabel control={<Checkbox checked={rememberMe} onChange={handleSetRememberMe} sx={{ color: "#fff", '&.Mui-checked': { color: "white" } }} />} label="Remember me" sx={{ color: "#fff", "& .MuiTypography-root": { color: "#fff" } }} />
              <Link to="/auth/forgot-password" style={{ color: "#ffc107", textDecoration: "none", fontSize: "14px", fontWeight: "500", lineHeight: "0px" }}>Forgot your password?</Link>
            </MDBox>
            <MDButton type="submit" fullWidth variant="contained" sx={{ backgroundColor: "#ffc107", color: "#fff", py: 1.5, '&:hover': { backgroundColor: "#e5ac00" } }}>Login</MDButton>
            {credentialsErros && <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>{credentialsErros}</Typography>}
          </MDBox>
          <MDBox mt="auto" textAlign="center" color="rgb(255, 193, 7)" pt={4}>
            <Typography variant="body2">Don't have an account? <Link to="/auth/register" style={{ color: "#fff", textDecoration: "none" }}>Sign up here</Link></Typography>
          </MDBox>
        </MDBox>
        <MDBox flex={{ xs: "0 0 0%", md: "0 0 66.667%" }} display={{ xs: "none", md: "block" }} bgcolor="transparent" sx={{ overflow: "auto" }}>
          <Container><AuthRightContent /></Container>
        </MDBox>
      </MDBox>
    </PageLayout>
  );
}

export default Login;
