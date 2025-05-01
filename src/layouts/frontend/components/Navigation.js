import React from "react";
import { Link } from "react-router-dom";
import { Box, Button } from "@mui/material";

const Navigation = ({ inDrawer }) => {
  const buttonStyles = {
    mx: inDrawer ? 0 : 1,
    my: inDrawer ? 0.5 : 0,
    textTransform: 'none',
    fontWeight: 'medium',
    padding: '0.625rem 0.6rem',
    minWidth: '40px',
    color: '#000',
    fontSize: '14px',
    width: inDrawer ? '100%' : 'auto',
    justifyContent: inDrawer ? 'flex-start' : 'center',
  };

  return (
    <Box sx={{ 
      display: inDrawer ? 'flex' : { xs: 'none', xl: 'flex' },
      ml: inDrawer ? 0 : 4,
      flexGrow: 1,
      flexDirection: inDrawer ? 'column' : 'row',
      width: '100%',
      '@media (min-width: 2025px)': {
        display: inDrawer ? 'none' : 'flex',
        flexDirection: 'row'
      }
    }}>
        {/* <Button component={Link} to="/" color="inherit" className="menu-nav-button"
          sx={{ mx: 1, textTransform: 'none', fontWeight: 'medium', padding:'0.625rem 0.6rem', minWidth:'40px', color:'#000', fontSize:'14px', borderRadius:'0.5rem' }}>
        Home
        </Button> */}
        <Button 
          component={Link} 
          to="/news" 
          color="inherit" 
          className="menu-nav-button"
          sx={buttonStyles}
        >
          News
        </Button>
        <Button 
          component={Link} 
          to="/tokens" 
          color="inherit" 
          className="menu-nav-button"
          sx={buttonStyles}
        >
          Tokens
        </Button>
        <Button 
          component={Link} 
          to="/calendar" 
          color="inherit" 
          className="menu-nav-button"
          sx={buttonStyles}
        >
          Calendar
        </Button>
        <Button 
          component={Link} 
          to="/advice" 
          color="inherit" 
          className="menu-nav-button"
          sx={buttonStyles}
        >
          Advice
        </Button>
    </Box>
  );
};

export default Navigation;