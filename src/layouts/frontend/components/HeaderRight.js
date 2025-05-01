import React, { useContext, useState, useEffect } from "react";
import { Box, InputBase, IconButton, Avatar, Button, Menu, MenuItem, Drawer, List, ListItem, ListItemText } from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"; 
import MenuIcon from '@mui/icons-material/Menu';
import { AuthContext } from "context";
import Navigation from './Navigation';
import placehoderUserImage from '../../../assets/images/user-placehoder.png';
import Typography from '@mui/material/Typography';

const HeaderRight = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleClose();
    logout();
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setIsDrawerOpen(open);
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchInput(value);

    if (value.length >= 3) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/search/searchCompanies?Search_keyword=${value}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (data.status) {
          setSearchResults(data.data); // Assuming data.data contains the list of companies
        } else {
          setSearchResults([]); // Clear results if no data
        }
      } catch (error) {
        console.error("Error fetching company data:", error);
        setSearchResults([]); // Clear results on error
      }
    } else {
      setSearchResults([]); // Clear results if input is less than 3 characters
    }
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchResults([]); // Clear results when the clear icon is clicked
  };

  const handleListItemClick = (companySymbol) => {
    navigate(`/coin-profile/${companySymbol}`);
    clearSearch(); // Clear search input and results
  };

  const handleSearchIconClick = () => {
    if (searchInput.length >= 3) {
      navigate(`/search?keyword=${searchInput}`); // Redirect to the search page with the keyword
      //clearSearch(); // Clear search input and results
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchIconClick(); // Trigger search on Enter key press
      //clearSearch(); // Clear search input and results
    }
  };

  // Clear search results when the component mounts or when the search input changes
  useEffect(() => {
    if (searchInput.length < 3) {
      setSearchResults([]); // Clear results if input is less than 3 characters
    }
  }, [searchInput]);

  // Clear search results when navigating to the search page
  useEffect(() => {
    if (location.pathname === '/search') {
      setSearchResults([]); // Clear results when on the search page
    }
  }, [location.pathname]);

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}> 
      <IconButton 
        sx={{ 
          display: { xs: 'flex', xl: 'none' }, // Hide below xl breakpoint
          mr: 2, 
          flexGrow: 1,
          '@media (min-width: 2025px)': {
            display: 'none'
          }
        }}
        onClick={toggleDrawer(true)}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            mt: '64px', // Adjust this value based on your header height
            height: 'calc(100% - 64px)',
          },
        }}
      >
        <Box sx={{ width: '100%', p: 2 }}>
          <Navigation inDrawer={true} />
        </Box>
      </Drawer>

      <Box sx={{ 
        position: 'relative', 
        borderRadius: '24px', 
        backgroundColor: '#f5f5f5',
        '&:hover': { backgroundColor: '#f0f0f0' },
        mr: 2,
        width: '200px',
        display: { xs: 'none', xl: 'flex' }, 
        flexGrow: 1,
        '@media (min-width: 2025px)': {
          display: 'flex'
        }
      }}>
        <InputBase 
          placeholder="Searching" 
          value={searchInput}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
          sx={{ padding: '6px 10px', width: '100%', color: '#757575', fontSize: '0.875rem' }} 
        />
        
        {searchInput.length >= 3 && (
          <IconButton onClick={clearSearch} sx={{ position: 'absolute', right: 40, top: 0, height: '100%', padding: '6px' }}>
            <ClearIcon />
          </IconButton>
        )}

        <Box 
          sx={{ padding: '0 16px', height: '100%', position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', right: 0 }}
          onClick={handleSearchIconClick}
        >
          <SearchIcon sx={{ color: '#757575', cursor: 'pointer' }} />
        </Box>

        {searchResults.length > 0 && (
          <List sx={{ position: 'absolute',
            left: 0,
            background: 'white',
            padding: '15px',
            borderRadius: '5px',
            boxShadow: '0px 0px 10px #ccc',
            top: 40,
            maxHeight: 300,
            overflow: 'auto',
            borderBottom: '10px solid white',
            width: '100%',
            zIndex: 2 }}>
            {searchResults.map((company) => (
              <ListItem key={company.Company_Symbol} onClick={() => handleListItemClick(company.Company_Symbol)}>
                <ListItemText 
                  primary={
                    <Typography 
                      sx={{ 
                        padding: '8px 0', 
                        color: '#0D49C5', 
                        fontSize: '12px', 
                        lineHeight: '14px', 
                        fontWeight: 400, 
                        cursor: 'pointer',
                        display: 'block',
                        borderBottom: '1px solid #f1f1f1'
                      }}
                    >
                      {company.Company_Name}
                    </Typography>
                  } 
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
       
      {isAuthenticated && (
        <>
          <IconButton component={Link} to="/messages" color="primary" sx={{ mx: 1 , color: '#213a93' }}>
            <ChatBubbleOutlineIcon />
          </IconButton>
          
          <IconButton component={Link} to="/notifications" color="primary" sx={{ mx: 1, color: '#213a93' }}>
            <NotificationsNoneIcon />
          </IconButton>
        </>
      )}
       
      {isAuthenticated ? (
        <>
          <Avatar 
            sx={{ width: 36, height: 36, ml: 2, border: '2px solid #eee', cursor: 'pointer' }}
            alt="User Profile"
            src={placehoderUserImage}
            onClick={handleMenu}
          />
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          > 
            <MenuItem onClick={() => navigate('/dashboard')}>Dashboard</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </>
      ) : (
        <Button 
          component={Link} 
          to="/auth/login"
          variant="contained"
          style={{backgroundColor: '#213a93', color: 'white'}}
          size="small"
          sx={{ ml: 2, textTransform: 'none', borderRadius: '8px', color: 'white', backgroundColor: '#213a93' }}
        >
          Login
        </Button>
      )}
    </Box> 
  );
};

export default HeaderRight;