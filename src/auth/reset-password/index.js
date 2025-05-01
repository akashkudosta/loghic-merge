import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MDBox from "components/MDBox";
import { Typography, Container } from "@mui/material";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";
import PageLayout from "examples/LayoutContainers/PageLayout";
import AuthRightContent from "components/AuthRightContent";
import AuthService from "services/auth-service";
import logoWhite from "assets/images/logo-login-white.svg";

const PasswordReset = () => {
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState(null);
  const [notification, setNotification] = useState(false);
  const [inputs, setInputs] = useState({
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState({
    passwordError: false,
    confirmationError: false,
    error: false,
    textError: "",
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    setToken(queryParams.get("token"));
    setEmail(queryParams.get("email"));
  }, []);

  const changeHandler = (e) => {
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value,
    });

    // Clear error messages when user starts typing
    if (errors.passwordError || errors.confirmationError) {
      setErrors({ passwordError: false, confirmationError: false, error: false, textError: "" });
    }
  };

  const validatePassword = (password) => {
    const lengthCheck = password.length >= 8 && password.length <= 64;
    const uppercaseCheck = /[A-Z]/.test(password);
    const lowercaseCheck = /[a-z]/.test(password);
    const digitCheck = /\d/.test(password);
    const specialCharCheck = /[!@#$%^&*()]/.test(password);
    const commonSequenceCheck = !/(1234|abcd|password)/.test(password);
    const consecutiveCheck = !/(.)\1{2,}/.test(password); // More than two consecutive repeated characters

    return lengthCheck && uppercaseCheck && lowercaseCheck && digitCheck && specialCharCheck && commonSequenceCheck && consecutiveCheck;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    // Reset error states
    setErrors({ passwordError: false, confirmationError: false, error: false, textError: "" });

    if (!validatePassword(inputs.password)) {
      setErrors({ ...errors, passwordError: true, textError: `Your password must:
        • Be between 8 and 64 characters long.
        • Contain at least one uppercase letter (A-Z).
        • Contain at least one lowercase letter (a-z).
        • Contain at least one digit (0-9).
        • Contain at least one special character (e.g., ! @ # $ % ^ & * ( )).
        • NOT contain common sequences (like "1234", "abcd", or "password").
        • NOT include personal information (like first name, last name, or email address).
        • NOT have more than two consecutive repeated characters (e.g., "aaa").` });
      return;
    }

    if (inputs.password_confirmation.trim() === "") {
      setErrors({
        ...errors,
        confirmationError: true,
        textError: "The password confirmation cannot be empty",
      });
      return;
    }

    if (inputs.password_confirmation.trim() !== inputs.password.trim()) {
      setErrors({
        ...errors,
        confirmationError: true,
        textError: "Passwords do not match",
      });
      return;
    }

    const formData = {
      password: inputs.password,
      password_confirmation: inputs.password_confirmation,
      email: email,
      token: token,
    };

    const myData = {
      data: {
        type: "password-reset",
        attributes: { ...formData },
      },
    };

    try {
      await AuthService.resetPassword(myData);
      setInputs({ password: "", password_confirmation: "" });
      setErrors({ passwordError: false, confirmationError: false, error: false, textError: "" });
      setNotification(true);
      // setTimeout(() => setNotification(false), 5000);
    } catch (err) {
      if (err.errors) {
        const errorMessage =
          err.errors.email?.[0] || // Handle email-related errors
          err.errors.password?.[0] || // Handle password-related errors
          "An unexpected error occurred"; // Default message
    
        setErrors({ ...errors, error: true, textError: errorMessage });
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
            borderRadius: 2,
          }}
        >
          <MDBox mb={4}><img src={logoWhite} alt="Loghic" height="40" /></MDBox>
          <MDBox mb={4} color="#7a90dd">
            <MDTypography variant="h4" fontWeight="bold" sx={{ color: "#fff" }}>Reset Password</MDTypography>
            <MDTypography variant="body2" color="#fff">Enter your new password and its confirmation for update</MDTypography>
          </MDBox>
          <MDBox component="form" role="form" onSubmit={submitHandler}>
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
                onChange={changeHandler}
                error={errors.passwordError}
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
              {errors.passwordError && (
                <MDTypography variant="caption" color="error" sx={{ whiteSpace: "pre-line", fontSize: "14px", fontWeight: "500", lineHeight: "0px" }}>
                  {errors.textError}
                </MDTypography>
              )}
            </MDBox>
            <MDBox mb={2}>
              <Typography variant="body2" sx={{ mb: 1, color: "#fff" }}>
                Password Confirmation
              </Typography>
              <MDInput
                type="password"
                fullWidth
                name="password_confirmation"
                placeholder="Confirm your password"
                value={inputs.password_confirmation}
                onChange={changeHandler}
                error={errors.confirmationError}
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
              {errors.confirmationError && (
                <MDTypography variant="caption" color="error">
                  {errors.textError}
                </MDTypography>
              )}
            </MDBox>
            {errors.error && (
              <MDTypography variant="caption" color="error">
                {errors.textError}
              </MDTypography>
            )}
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" fullWidth type="submit">
                Change Password
              </MDButton>
            </MDBox>
            {notification && (
              <MDAlert color="success" dismissible sx={{ fontSize: "14px", fontWeight: "500", textAlign: "left", paddingLeft: "10px" }}>
                Password reset successful.{" "}
                <Link to="/auth/login" style={{ color: "#fff", fontWeight: "bold", textDecoration: "underline", marginLeft: "5px" }}>
                  Log In
                </Link>
              </MDAlert>
            )}
            <MDBox mt="auto" textAlign="center" color="rgb(255, 193, 7)" pt={4}>
              <Typography variant="body2">Remembered your password? <Link to="/auth/login" style={{ color: "#fff", textDecoration: "none" }}>Sign In</Link></Typography>
            </MDBox>
          </MDBox>
        </MDBox>
        <MDBox flex={{ xs: "0 0 0%", md: "0 0 66.667%" }} display={{ xs: "none", md: "block" }} bgcolor="transparent" overflowY="auto">
          <Container><AuthRightContent /></Container>
        </MDBox>
      </MDBox>
    </PageLayout>
  );
};

export default PasswordReset;