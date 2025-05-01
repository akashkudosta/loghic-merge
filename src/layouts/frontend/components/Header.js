import React from "react";
import { AppBar, Toolbar, Container } from "@mui/material";
import HeaderLogo from "./HeaderLogo";
import Navigation from "./Navigation";
import HeaderRight from "./HeaderRight";

const Header = () => {
  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ background: "#fff", borderBottom: "1px solid #eee" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: "space-between" }}> 
          <HeaderLogo /> 
          <Navigation /> 
          <HeaderRight />
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;