import { useContext, useState } from "react"; 
import { Link } from "react-router-dom"; 
import { Box, Typography, Grid, Container, InputBase, Checkbox, FormControlLabel, InputLabel, RadioGroup, Radio } from "@mui/material";
import Card from "@mui/material/Card"; 
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import CoverLayout from "layouts/authentication/components/CoverLayout";
import AuthRightContent from "components/AuthRightContent";
import PageLayout from "examples/LayoutContainers/PageLayout";
import logoWhite from "assets/images/logo-login-white.svg";
import AuthService from "services/auth-service";
import { AuthContext } from "context";
// Background Image
import bgImage from "assets/images/bg-sign-up-cover.jpeg";

function Register() {
  const authContext = useContext(AuthContext);

  const [inputs, setInputs] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "male",  
  });

  const [errors, setErrors] = useState({
    firstNameError: false,
    lastNameError: false,
    emailError: false,
    phoneError: false,
    passwordError: false,
    confirmPasswordError: false,
    error: false,
    errorText: "",
  });

  const changeHandler = (e) => {
    const { name, value, type, checked } = e.target;
    setInputs((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear the corresponding error when the user starts typing
    if (name === "firstName") setErrors((prev) => ({ ...prev, firstNameError: false }));
    if (name === "lastName") setErrors((prev) => ({ ...prev, lastNameError: false }));
    if (name === "email") setErrors((prev) => ({ ...prev, emailError: false }));
    if (name === "phone") setErrors((prev) => ({ ...prev, phoneError: false }));
    if (name === "password") setErrors((prev) => ({ ...prev, passwordError: false }));
    if (name === "confirmPassword") setErrors((prev) => ({ ...prev, confirmPasswordError: false }));
  };  

  const validatePassword = (password) => {
    const lengthCheck = password.length >= 8 && password.length <= 64;
    const uppercaseCheck = /[A-Z]/.test(password);
    const lowercaseCheck = /[a-z]/.test(password);
    const digitCheck = /\d/.test(password);
    const specialCharCheck = /[!@#$%^&*()]/.test(password);
    const commonSequenceCheck = !/(1234|abcd|password)/.test(password);
    const personalInfoCheck = !(password.includes(inputs.firstName) || password.includes(inputs.lastName) || password.includes(inputs.email));
    const consecutiveCheck = !/(.)\1{2,}/.test(password); // More than two consecutive repeated characters

    return lengthCheck && uppercaseCheck && lowercaseCheck && digitCheck && specialCharCheck && commonSequenceCheck && personalInfoCheck && consecutiveCheck;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const mailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!inputs.firstName.trim()) {
      setErrors((prev) => ({ ...prev, firstNameError: true }));
      return;
    }

    if (!inputs.lastName.trim()) {
      setErrors((prev) => ({ ...prev, lastNameError: true }));
      return;
    }

    if (!inputs.email.trim() || !inputs.email.match(mailFormat)) {
      setErrors((prev) => ({ ...prev, emailError: true }));
      return;
    }

    if (!inputs.phone.trim()) {
      setErrors((prev) => ({ ...prev, phoneError: true }));
      return;
    }

    if (!validatePassword(inputs.password)) {
      setErrors((prev) => ({ ...prev, passwordError: true }));
      setErrors((prev) => ({
        ...prev,
        passwordError: true,
        errorText: `Your password must:
        • Be between 8 and 64 characters long.
        • Contain at least one uppercase letter (A-Z).
        • Contain at least one lowercase letter (a-z).
        • Contain at least one digit (0-9).
        • Contain at least one special character (e.g., ! @ # $ % ^ & * ( )).
        • NOT contain common sequences (like "1234", "abcd", or "password").
        • NOT include personal information (like first name, last name, or email address).
        • NOT have more than two consecutive repeated characters (e.g., "aaa").`
      }));
      return;
    }

    if (inputs.password !== inputs.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPasswordError: true }));
      return;
    }

    const newUser = {
      firstName: inputs.firstName,
      lastName: inputs.lastName,
      email: inputs.email,
      phone: inputs.phone,
      password: inputs.password,
      gender: inputs.gender,
    };

    const myData = {
      data: {
        type: "users",
        attributes: { ...newUser, password_confirmation: newUser.password },
        relationships: {
          roles: {
            data: [
              {
                type: "roles",
                id: "1",
              },
            ],
          },
        },
      },
    };

    try {
      const response = await AuthService.register(myData);
      authContext.login(response.access_token, response.refresh_token, response.role);

      setInputs({ firstName: "", lastName: "", email: "", phone: "", password: "", 
        confirmPassword: "", gender: "male" });

      setErrors({ firstNameError: false, lastNameError: false, emailError: false, 
        phoneError: false, passwordError: false, confirmPasswordError: false, 
        error: false, errorText: "" });

    } catch (err) {
      setErrors((prev) => ({ ...prev, error: true, errorText: err.message }));
      console.error(err);
    }
  };

  return (
    <PageLayout>
        <MDBox display="flex" minHeight="100vh" width="100%" maxWidth="1440px" mx="auto" px={3} mt={4}>
        {/* Left column - Login form */}
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
              <MDTypography variant="h4" fontWeight="bold" sx={{ color: "#fff" }} mb={1}>Sign Up</MDTypography>
              <Typography variant="body2" color="#fff">It's quick and easy</Typography>
            </MDBox>
            <MDBox component="form" role="form" method="POST" onSubmit={submitHandler}>
              <MDBox mb={2}>
                <Typography variant="body2" sx={{ mb: 1, color: "#fff" }}>
                  First Name
                </Typography>
                <MDInput
                  type="text"
                  fullWidth
                  name="firstName"
                  placeholder="Enter your first name"
                  value={inputs.firstName}
                  onChange={changeHandler}
                  error={errors.firstNameError}
                  variant="standard"
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: "4px",
                    px: 2,
                    py: 1,
                    "& .MuiInput-underline:before": {
                      borderBottom: "none !important",
                    },
                    "& .MuiInput-underline:after": {
                      borderBottom: "none !important",
                    },
                    '&.Mui-error': {
                      border: '1px solid red',
                    }
                  }}
                />
                {errors.firstNameError && (
                  <MDTypography variant="caption" color="error">
                    The first name cannot be empty
                  </MDTypography>
                )}
              </MDBox>
              <MDBox mb={2}>
                <Typography variant="body2" sx={{ mb: 1, color: "#fff" }}>
                  Last Name
                </Typography>
                <MDInput
                  type="text"
                  fullWidth
                  name="lastName"
                  placeholder="Enter your last name"
                  value={inputs.lastName}
                  onChange={changeHandler}
                  error={errors.lastNameError}
                  variant="standard"
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: "4px",
                    px: 2,
                    py: 1,
                    "& .MuiInput-underline:before": {
                      borderBottom: "none !important",
                    },
                    "& .MuiInput-underline:after": {
                      borderBottom: "none !important",
                    },
                  }}
                />
                {errors.lastNameError && (
                  <MDTypography variant="caption" color="error">
                    The last name cannot be empty
                  </MDTypography>
                )}
              </MDBox>
              <MDBox mb={2}>
                <Typography variant="body2" sx={{ mb: 1, color: "#fff" }}>
                  Email Address
                </Typography>
                <MDInput
                  type="email"
                  fullWidth
                  name="email"
                  placeholder="Enter your email address"
                  value={inputs.email}
                  onChange={changeHandler}
                  error={errors.emailError}
                  variant="standard"
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: "4px",
                    px: 2,
                    py: 1,
                    "& .MuiInput-underline:before": {
                      borderBottom: "none !important",
                    },
                    "& .MuiInput-underline:after": {
                      borderBottom: "none !important",
                    },
                  }}
                />
                {errors.emailError && (
                  <MDTypography variant="caption" color="error">
                    The email must be valid
                  </MDTypography>
                )}
              </MDBox>
              <MDBox mb={2}>
                <Typography variant="body2" sx={{ mb: 1, color: "#fff" }}>
                  Phone Number
                </Typography>
                <MDInput
                  type="text"
                  fullWidth
                  name="phone"
                  placeholder="Enter your phone number"
                  value={inputs.phone}
                  onChange={changeHandler}
                  error={errors.phoneError}
                  variant="standard"
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: "4px",
                    px: 2,
                    py: 1,
                    "& .MuiInput-underline:before": {
                      borderBottom: "none !important",
                    },
                    "& .MuiInput-underline:after": {
                      borderBottom: "none !important",
                    },
                  }}
                />
                {errors.phoneError && (
                  <MDTypography variant="caption" color="error">
                    The phone number cannot be empty
                  </MDTypography>
                )}
              </MDBox>
              <MDBox mb={2}>
                <Typography variant="body2" sx={{ mb: 1, color: "#fff" }}>
                  Password
                </Typography>
                <MDInput
                  type="password"
                  fullWidth
                  name="password"
                  placeholder="Enter your password"
                  value={inputs.password}
                  variant="standard"
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: "4px",
                    px: 2,
                    py: 1,
                    "& .MuiInput-underline:before": {
                      borderBottom: "none !important",
                    },
                    "& .MuiInput-underline:after": {
                      borderBottom: "none !important",
                    },
                  }}
                  onChange={changeHandler}
                  error={errors.passwordError}
                />
                {errors.passwordError && (
                  <MDTypography variant="caption" color="error" sx={{ whiteSpace: "pre-line", fontSize: "14px", fontWeight: "500", lineHeight: "0px" }}>
                    {errors.errorText}
                  </MDTypography>
                )}
              </MDBox>
              <MDBox mb={2}>
                <Typography variant="body2" sx={{ mb: 1, color: "#fff" }}>
                  Confirm Password
                </Typography>
                <MDInput
                  type="password"
                  fullWidth
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={inputs.confirmPassword}
                  variant="standard"
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: "4px",
                    px: 2,
                    py: 1,
                    "& .MuiInput-underline:before": {
                      borderBottom: "none !important",
                    },
                    "& .MuiInput-underline:after": {
                      borderBottom: "none !important",
                    },
                  }}
                  onChange={changeHandler}
                  error={errors.confirmPasswordError}
                />
                {errors.confirmPasswordError && (
                  <MDTypography variant="caption" color="error">
                    Passwords do not match
                  </MDTypography>
                )}
              </MDBox>
              <MDBox mb={2}>
                <Typography variant="body2" sx={{ mb: 1, color: "#fff" }}>
                  Gender
                </Typography>
                <RadioGroup name="gender" value={inputs.gender} onChange={changeHandler} row>
                  {["male", "female", "custom"].map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={
                        <Radio
                          sx={{
                            color: "#fff", // Default circle border color
                            "&.Mui-checked": {
                              color: "#f1c40f", // Fill color when selected
                            },
                          }}
                        />
                      }
                      label={option.charAt(0).toUpperCase() + option.slice(1)} // Capitalize label text
                      sx={{
                        color: "#fff", // Label text color
                        "& .MuiFormControlLabel-label": { color: "#fff" }, // Ensures label text is white
                      }}
                    />
                  ))}
                </RadioGroup>
              </MDBox>
              {errors.error && (
                <MDTypography variant="caption" color="error">
                  {errors.errorText}
                </MDTypography>
              )}
              <MDBox mt={4} mb={1}>
                <MDButton fullWidth type="submit"
                  sx={{ 
                    backgroundColor: "#ffc107", 
                    color: "#fff",
                    textTransform: "none",
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: "#e5ac00"
                    }
                  }}
                >
                  Register
                </MDButton>
              </MDBox>
              <MDBox sx={{ textAlign: "center", my: 3, position: "relative" }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: "#fff",
                    fontWeight: "bold",
                    position: "relative",
                    display: "inline-block",
                    px: 2,
                    backgroundColor: "#0e47a1",
                    zIndex: 1
                  }}
                >
                  Or
                </Typography>
                <MDBox 
                  sx={{ 
                    position: "absolute", 
                    top: "50%", 
                    left: 0, 
                    right: 0, 
                    height: "1px", 
                    backgroundColor: "rgba(255,255,255,0.3)",
                    zIndex: 0
                  }} 
                />
              </MDBox>

              <MDButton
                fullWidth
                variant="outlined"
                startIcon={<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" height="18" />}
                sx={{ 
                  backgroundColor: "#fff",
                  color: "#000",
                  borderColor: "white",
                  textTransform: "none",
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: "#f5f5f5",
                    borderColor: "#f5f5f5"
                  }
                }}
              >
                Sign in with Google
              </MDButton>
              <MDBox sx={{ textAlign: "center", mt: 2, color: "#fff", fontSize: "14px" }}>
                By clicking on the register button, you agree to our{" "}
                <Typography
                  component="a"
                  href="#"
                  sx={{
                    cursor: "pointer",
                    color: "rgb(255, 193, 7)",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "14px",
                    "&:hover": { textDecoration: "underline" } // Optional hover effect
                  }}
                >
                  Terms
                </Typography>,{" "}
                <Typography
                  component="a"
                  href="#"
                  sx={{
                    cursor: "pointer",
                    color: "rgb(255, 193, 7)",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "14px",
                    "&:hover": { textDecoration: "underline" }
                  }}
                >
                  Privacy Policy
                </Typography>{" "}
                and{" "}
                <Typography
                  component="a"
                  href="#"
                  sx={{
                    cursor: "pointer",
                    color: "rgb(255, 193, 7)",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "14px",
                    "&:hover": { textDecoration: "underline" }
                  }}
                >
                  Cookies Policy
                </Typography>.
              </MDBox>
              <MDBox sx={{ mt: "auto", textAlign: "center", pt: 4 }}>
                <MDTypography variant="button" color="text" sx={{ color: "rgb(255, 193, 7)" }}>
                  Already have an account?{" "}
                  <MDTypography component={Link} to="/auth/login" variant="button" color="info" style={{ color: "#fff", textDecoration: "none" }}>
                    Sign In
                  </MDTypography>
                </MDTypography>
              </MDBox>
            </MDBox>
          </MDBox>

          {/* Right column - Feed preview */}
          <MDBox flex={{ xs: "0 0 0%", md: "0 0 66.667%" }} display={{ xs: "none", md: "block" }} bgcolor="transparent" overflowY="auto">
            <Container><AuthRightContent /></Container>
          </MDBox>
        </MDBox>
    </PageLayout>
  );
}

export default Register;
