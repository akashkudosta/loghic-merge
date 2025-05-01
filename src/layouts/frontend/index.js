import React from "react";
import { Container } from "@mui/material";
import MDBox from "components/MDBox";
import Header from "./components/Header";
import Footer from "./components/Footer";

const FrontendLayout = ({ children }) => {
  return (
    <MDBox sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}> 
      <Header />  
      <Container sx={{ flex: 1, py: 4 }}>
        {children}
      </Container>  
      <Footer />
    </MDBox>
  );
};

export default FrontendLayout;
