import React, { useState, useEffect } from 'react';
import { Grid, Card, Select, MenuItem, Container } from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import AdvisorList from '../../components/AdvisorList/AdvisorList';
import TrendingNews from '../../components/TrendingNews/TrendingNews';
import FrontendLayout from "layouts/frontend";
import { useNotification } from "../../context/NotificationContext";
import placehoderUserImage from '../../assets/images/user-placehoder.png';

const Advisor = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Advisors');
  const [advisors, setAdvisors] = useState([]);
  const [categories, setCategories] = useState(['All Advisors']);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 5,
    pages: 1
  });

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/advisors/getAdvisorCategories/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data.categories) {
        setCategories(['All Advisors', ...data.data.categories]);
      } else {
        showNotification({
          message: data.message || 'Failed to fetch categories',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      showNotification({
        message: error.message || 'An error occurred while fetching categories',
        severity: 'error'
      });
    }
  };

  const fetchAdvisors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/advisors/getAdvisors`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const advisorsData = data.data.map(advisor => ({
          name: advisor.User_Name,
          category: advisor.Uesr_Advisor_Category || 'General',
          imageUrl: advisor.User_ImageURL || placehoderUserImage,
          email: advisor.User_Email,
          phone: advisor.User_Phone,
          role: advisor.User_Role,
          id: advisor.User_PublicID
        }));
        
        setAdvisors(advisorsData);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages
        }));
      } else {
        showNotification({
          message: data.message || 'Failed to fetch advisors',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching advisors:', error);
      showNotification({
        message: error.message || 'An error occurred while fetching advisors',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchAdvisors();
  }, [pagination.page, pagination.limit]);

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const filteredAdvisors = selectedCategory === 'All Advisors'
    ? advisors
    : advisors.filter(advisor => advisor.category === selectedCategory);

  return ( 
    <FrontendLayout>
      <MDBox>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3, boxShadow: 'none', backgroundColor: 'transparent' }}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <MDTypography variant="h4" fontWeight="bold">
                  All Advisors
                </MDTypography>
                <Select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  sx={{ 
                    minWidth: 260,
                    backgroundColor: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E0E0E0'
                    },
                    minHeight: 40
                  }}
                  displayEmpty
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </MDBox>

              <Grid container spacing={3}>
                {loading ? (
                  <Grid item xs={12}>
                    <MDTypography>Loading...</MDTypography>
                  </Grid>
                ) : filteredAdvisors.length === 0 ? (
                  <Grid item xs={12}>
                    <MDTypography>No advisors found</MDTypography>
                  </Grid>
                ) : (
                  filteredAdvisors.map((advisor, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <AdvisorList {...advisor} />
                    </Grid>
                  ))
                )}
              </Grid>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ boxShadow: 'none', backgroundColor: 'white' }}>
              <MDBox p={3}>
                <TrendingNews limit={10} />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </FrontendLayout>
  );
};

export default Advisor; 