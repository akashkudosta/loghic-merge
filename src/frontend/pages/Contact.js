import React from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import FrontendLayout from "layouts/frontend";

const Contact = () => {
  return (
    <FrontendLayout>
      <MDBox>
        <MDTypography variant="h2">Contact Us</MDTypography>
        <MDTypography variant="body1">You can reach us at contact@example.com</MDTypography>
      </MDBox>
    </FrontendLayout>
  );
};

export default Contact;
