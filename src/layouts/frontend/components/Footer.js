import React from "react";
import { Box, Container, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 2, 
        borderTop: "1px solid #eee",
        background: "#fff"
      }}
    >
      <Container maxWidth="xl">
        <Typography 
          variant="body2"  
          align="center"
          sx={{ fontSize: "0.875rem", color: "#000" }}
        >
          © 2025 Loghic. All Rights Reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
