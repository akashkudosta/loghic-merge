import PropTypes from "prop-types"; 
import Link from "@mui/material/Link";  
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography"; 
import typography from "assets/theme/base/typography";

function Footer() {
  const { size } = typography;

  return (
    <MDBox
      width="100%"
      display="flex"
      flexDirection="row"
      justifyContent="center"
      alignItems="center"
      px={1.5}
      py={2.5}
      borderTop="1px solid #cddfff"
      mt={2}
      sx={{
        backgroundColor: "#fff"
      }}
    >
      <MDBox
        display="flex"
        justifyContent="center"
        alignItems="center"
        color="#0c4ac5"
        fontSize="14px"
      >
        <MDTypography variant="button" fontWeight="bold" color="#0c4ac5" fontSize="14px">
          © {new Date().getFullYear()} Loghic. All Rights Reserved
        </MDTypography> 
      </MDBox>
    </MDBox>
  );
}

// No props needed for this simplified version
Footer.propTypes = {};

export default Footer;
