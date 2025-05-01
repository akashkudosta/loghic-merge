import { useState } from "react";
import { Link } from "react-router-dom";
import { Typography, Container, InputBase } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import AuthRightContent from "components/AuthRightContent";
import PageLayout from "examples/LayoutContainers/PageLayout";
import logoWhite from "assets/images/logo-login-white.svg";
import authService from "services/auth-service";

function ForgotPassword() {
  const [input, setInput] = useState({ email: "" });
  const [error, setError] = useState({ err: false, textError: "" });
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const changeHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });

    // Clear error when user starts typing
    if (error.err) {
      setError({ err: false, textError: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");

    const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    
    if (!input.email.trim().match(mailFormat)) {
      setError({ err: true, textError: "The email must be valid" });
      return;
    }

    const myData = {
      data: {
        type: "password-forgot",
        attributes: {
          redirect_url: `${process.env.REACT_APP_URL}/auth/reset-password`,
          ...input,
        },
      },
    };
    
    try {
      setIsSubmitting(true);
      const response = await authService.forgotPassword(myData);
      if (response?.message) {
        setSuccessMsg(response.message);
        setError({ err: false, textError: "" });
      } else {
        throw new Error("Unexpected response from server.");
      }
    } catch (err) {
      setError({ err: true, textError: err.message || "An error occurred." });
      setSuccessMsg("");
      setIsSubmitting(false);
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
          <MDBox mb={4}><Link to="/" style={{ color: "#fff", textDecoration: "none" }}><img src={logoWhite} alt="Loghic" height="40" /></Link></MDBox>
          <MDBox mb={4} color="#7a90dd">
            <MDTypography variant="h4" fontWeight="bold" sx={{ color: "#fff" }}>Welcome Back</MDTypography>
            <Typography variant="body2" color="#fff">Login to your account</Typography>
          </MDBox>
          <MDBox component="form" sx={{ backgroundColor: "#fff", borderRadius: "4px", px: 4, py: 4 }} onSubmit={handleSubmit}>
            <MDBox mb={4} color="#7a90dd">
              <MDTypography variant="h4" fontWeight="bold" sx={{ color: "#000", textAlign: "center" }}>Reset Password</MDTypography>
            </MDBox>
            <MDBox mb={3}>
              <Typography variant="body2" color="#000">Email Address</Typography>
              <InputBase
                type="email"
                name="email"
                value={input.email}
                onChange={changeHandler}
                placeholder="Enter your Email Address"
                fullWidth
                sx={{ backgroundColor: "#fff", border: "1px solid #000", borderRadius: "4px", px: 2, py: 1 }}
                error={error.err}
              />
              {error.err && <Typography variant="caption" color="error">{error.textError}</Typography>}
              {successMsg && <Typography variant="caption" color="success.main">{successMsg}</Typography>}
            </MDBox>
            <MDButton
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{
                backgroundColor: isSubmitting ? "#888" : "#3855b3",
                color: "#fff",
                py: 1.5,
                "&:hover": { backgroundColor: "#2c448f", color: "#fff" },
                "&:active": { backgroundColor: "#1f3571", color: "#fff" },
                "&:focus": { backgroundColor: "#2c448f", color: "#fff" },
                "&:focus:not(:hover)": { backgroundColor: "#2c448f", color: "#fff" },
                "&.Mui-disabled": { backgroundColor: "#cccccc", color: "#ffffff" },
              }}
            >
              Reset
            </MDButton>
            <MDBox mt="auto" textAlign="center" color="rgb(255, 193, 7)" pt={4}>
              <Typography variant="body2" sx={{ color: "#787373", fontWeight: "400" }}>Have an account? <Link to="/auth/login" style={{ color: "#3855b3", textDecoration: "none" }}>Login</Link></Typography>
              <Typography variant="body2" sx={{ color: "#787373", fontWeight: "400" }}>Don't have an account yet? <Link to="/auth/register" style={{ color: "#3855b3", textDecoration: "none" }}>Create an account</Link></Typography>
            </MDBox>
          </MDBox>
          <MDBox mt="auto" textAlign="center" color="rgb(255, 193, 7)" pt={4}>
            <Typography variant="body2">Don't have an account? <Link to="/auth/register" style={{ color: "#fff", textDecoration: "none" }}>Sign up here</Link></Typography>
          </MDBox>
        </MDBox>
        <MDBox flex={{ xs: "0 0 0%", md: "0 0 66.667%" }} display={{ xs: "none", md: "block" }} bgcolor="transparent" overflowY="auto">
          <Container><AuthRightContent /></Container>
        </MDBox>
      </MDBox>
    </PageLayout>
  );
}

export default ForgotPassword;
