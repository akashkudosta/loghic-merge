import React from 'react';
import { Box, Card } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';

const AdvisorList = ({ name, category, imageUrl, id }) => {
  const navigate = useNavigate();

  const handleExploreClick = () => {
    navigate(`/advisor-profile/${id}`);
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 3,
        backgroundColor: '#f8f9fa',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }
      }}
    >
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          overflow: 'hidden',
          mb: 2,
          border: '3px solid #FFD700',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <img
          src={imageUrl || '/default-avatar.png'}
          alt={name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={(e) => {
            e.target.src = '/default-avatar.png';
          }}
        />
      </Box>
      
      <MDTypography
        variant="h5"
        sx={{
          mb: 1,
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#2c3e50'
        }}
      >
        {name}
      </MDTypography>

      <MDTypography
        variant="body2"
        sx={{
          mb: 3,
          textAlign: 'center',
          color: '#7f8c8d',
          fontSize: '0.875rem'
        }}
      >
        {category}
      </MDTypography>

      <MDButton
        variant="contained"
        onClick={handleExploreClick}
        sx={{
          mt: 'auto',
          backgroundColor: '#FFD700',
          color: '#000000',
          fontWeight: 'bold',
          '&:hover': {
            backgroundColor: '#F4C430',
            transform: 'translateY(-2px)',
            boxShadow: '0 5px 15px rgba(244, 196, 48, 0.4)'
          },
          transition: 'all 0.3s ease',
          borderRadius: '25px',
          px: 4
        }}
      >
        Explore Me
      </MDButton>
    </Card>
  );
};

export default AdvisorList; 