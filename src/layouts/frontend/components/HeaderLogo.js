import React from "react";
import { Link } from "react-router-dom";
import { Box } from "@mui/material";
import SiteLogo from "assets/images/logos/logo-white.svg";


function HeaderLogo() {
  return (
        <Link to="/" style={{ textDecoration: "none" }}>
            <Box display="flex" alignItems="center">
              <img src={SiteLogo} alt="Logo" height="40" /> 
            </Box>
        </Link>
  );
}

export default HeaderLogo;