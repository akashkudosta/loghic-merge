import React from 'react';
import { Grid, Card, Select, MenuItem, Container } from '@mui/material';
import MDBox from 'components/MDBox';
import FrontendLayout from "layouts/frontend";
import Calendar from 'components/Calendar/Calendar';
import TrendingNews from '../../components/TrendingNews/TrendingNews';

const CalendarPage = () => {
  return (
    <FrontendLayout>
      <MDBox>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <Calendar />
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
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

export default CalendarPage; 