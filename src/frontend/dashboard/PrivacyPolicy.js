import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  Divider,
  Paper
} from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import FrontendLayout from "layouts/frontend";
import axios from 'axios';
import DashboardSidebar from './DashboardSidebar';

const PrivacyPolicy = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserInfo(response.data.data.userInfo);
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  if (loading) {
    return (
      <FrontendLayout>
        <MDBox>
          <Typography>Loading...</Typography>
        </MDBox>
      </FrontendLayout>
    );
  }

  return (
    <FrontendLayout>
      <MDBox>
        <Grid container spacing={3}>
          {/* Left Sidebar */}
          <Grid item xs={12} md={3}>
            <DashboardSidebar userInfo={userInfo} />
          </Grid>

          {/* Main Content Area */}
          <Grid item xs={12} md={9}>
            <Card sx={{ p: 3, backgroundColor: 'white' }}>
              <MDTypography variant="h5" color="dark">
                Privacy Policy
              </MDTypography>

              <Typography variant='body2' color="text.secondary" mb={4}>
                Last updated: March 15, 2024
              </Typography>

              {/* Our Privacy Principles Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="medium" gutterBottom>
                  Our Privacy Principles
                </Typography>
                <Typography variant="body2">
                  We keep your personal information personal and private. We will not sell, rent, share, or otherwise disclose your personal information to anyone except as necessary to provide our services or as otherwise described in this Policy without first providing you with notice and the opportunity to consent.
                </Typography>
              </Box>
              

              {/* Legal Basis For Processing Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="medium" gutterBottom>
                  Legal Basis For Processing
                </Typography>
                <Typography variant="body2">
                  Our legal basis for collecting and using your personal information depends on the personal information collected and the specific context in which we collect it. We normally will collect personal information from you only where:
                </Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>
                  (a) we have your consent to do so
                </Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>
                  (b) we need your personal information to perform a contract with you (e.g. to deliver the Services you have requested)
                </Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>
                  (c) the processing is in our legitimate interests
                </Typography>
                <Typography variant="body2">
                  We have a legitimate interest in operating our Services and communicating with you as necessary to provide these Services, for example when responding to your queries, improving our platform, protecting the safety and security of our Services and our Customers, undertaking marketing, or for the purposes of detecting or preventing illegal activities.
                </Typography>
                <Typography variant="body2">
                  Please note that in most cases, if you do not provide the requested information, ClusterCS will not be able to provide the requested service to you.
                </Typography>
              </Box>

              {/* Data Aggregation Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="medium" gutterBottom>
                  Data Aggregation
                </Typography>
                <Typography variant="body2">
                  ClusterCS may aggregate data we acquire about our Customers and their End Users, including the Log Database and Server Usage and Contents described above. For example, we may assemble data to determine whether attacks are being performed against servers and applications of our Customers or their End Users, to identify common applications and application versions, to identify server and application performance profiles, or to compile information and statistics for informational or marketing purposes.
                </Typography>
              </Box>

              {/* International Information Transfers Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="medium" gutterBottom>
                  International Information Transfers
                </Typography>
                <Typography variant="body2">
                  We store your information in Romania, country member of the European Union. If you are accessing or using our Websites or Services or otherwise providing information to us, you are agreeing to the transfer of your personal information to Romania. ClusterCS is subject to the investigatory and enforcement powers governed by the laws in action in the European Union.
                </Typography>
              </Box>

              {/* Notification Of Changes Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="medium" gutterBottom>
                  Notification Of Changes
                </Typography>
                <Typography variant="body2">
                  This Privacy Policy is subject to occasional revision, and if any substantial changes are made to the way your Personal Data is used, we will notify you by email to the email address that you have provided as being the most current posting the notice of such changes on our website. Any changes to the Privacy Policy will be effective upon the earlier of either thirty (30) calendar days from the dispatch of the email notice to you or thirty (30) calendar days following our posting of the update terms on our website, or the date on which you accept the terms by clicking "I Accept" or similar means.
                </Typography>
                <Typography variant="body2">
                  These changes will be effective immediately for any new users and customers of our website and related products and services. Please note that you are responsible at all times for updating your Personal Data and with providing us with your most recent and current email address. In the event that the email address is no longer valid the date at which the proposed changes were dispatched will still constitute effective notice of any changes to the Privacy Policy. If you do not wish to permit changes in our use of your Personal Data you must notify us prior to the effective date of the changes and that you wish to deactivate your account. Continued use of our website, products, and or related services, following notice of any such changes shall indicate your acknowledgement of such changes and agreement to be bound by the terms and conditions of such changes.
                </Typography>
              </Box>

              {/* Business Transactions Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="medium" gutterBottom>
                  Business Transactions
                </Typography>
                <Typography variant="body2">
                  We may assign or transfer this Policy, as well as information covered by this Policy, in the event of a merger, sale, change in control, or reorganization of all our part of our business.
                </Typography>
              </Box>

              {/* Contact Information */}
              <Box sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
                <Typography variant="body2">
                  If you have any questions about this Privacy Policy, you can contact us by email at{' '}
                  <Box component="span" sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                    office@loghic.com
                  </Box>
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </FrontendLayout>
  );
};

export default PrivacyPolicy; 