import { useState, useEffect, useCallback } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography"; 
import MDInput from "components/MDInput";
import MDAvatar from "components/MDAvatar";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout"; 
import CompaniesService from "services/companies-service"; 
import companyLogo from "assets/images/small-logos/logo-xd.svg"; // Placeholder image for companies
import CustomPagination from "components/CustomPagination";

function CompanyManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCompanies, setTotalCompanies] = useState(0);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Fetch companies
  const fetchCompanies = useCallback(async (pageNum = page, rowsCount = rowsPerPage) => {
    try {
      setLoading(true);
      // API expects 1-based pagination, but Material UI uses 0-based
      const apiPage = pageNum + 1;
      console.log(`Fetching companies: page=${apiPage}, limit=${rowsCount}`);
      
      const response = await CompaniesService.getCompanies(apiPage, rowsCount);
      
      if (response && response.data && response.data.companies) {
        setCompanies(response.data.companies);
        setFilteredCompanies(response.data.companies);
        // Set total count from API response
        setTotalCompanies(response.data.total || 0);
        console.log(`Received ${response.data.companies.length} companies, total: ${response.data.total || 0}`);
      } else {
        console.error("Unexpected API response format:", response);
        setError("Invalid response format from server");
      }
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError(err.message || "Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies(0, rowsPerPage);
  }, []);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    // Fetch new data when page changes
    fetchCompanies(newPage, rowsPerPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    // Fetch new data with new rows per page
    fetchCompanies(0, newRowsPerPage);
  };

  // Handle search
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query) {
      console.log("Searching for:", query);
      
      const filtered = companies.filter(company => {
        // Log the first company to inspect structure
        if (companies.indexOf(company) === 0) {
          console.log("Company object structure:", company);
        }
        
        // Search by name and symbol only
        const name = (company.Company_Name || '').toLowerCase();
        const symbol = (company.Company_Symbol || '').toLowerCase();
        
        return name.includes(query) || symbol.includes(query);
      });
      
      console.log(`Found ${filtered.length} matches for "${query}"`);
      setFilteredCompanies(filtered);
      setPage(0);
    } else {
      setFilteredCompanies(companies);
    }
  };

  // Calculate displayed companies based on pagination
  const displayedCompanies = searchQuery 
    ? filteredCompanies.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : filteredCompanies;

  return (
    <DashboardLayout> 
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Companies Table
                </MDTypography>
              </MDBox>
              
              {/* Search Input */}
              <MDBox p={3} display="flex" justifyContent="flex-end">
                <MDInput
                  label="Search by name or symbol"
                  value={searchQuery}
                  onChange={handleSearch}
                  sx={{
                    maxWidth: "350px",
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "4px",
                    }
                  }}
                />
              </MDBox>
              
              <MDBox pt={0}>
                {loading ? (
                  <MDBox display="flex" justifyContent="center" p={3}>
                    <MDTypography variant="body2">Loading companies...</MDTypography>
                  </MDBox>
                ) : error ? (
                  <MDBox display="flex" justifyContent="center" p={3}>
                    <MDTypography variant="body2" color="error">
                      Error: {error}
                    </MDTypography>
                  </MDBox>
                ) : (
                  <>
                    <TableContainer>
                      <Table sx={{ minWidth: 650 }} aria-label="companies table">
                        <TableHead className="listing_table_head_section" style={{ display: 'table-header-group' }}>
                          <TableRow>
                            <TableCell>Company</TableCell> 
                            <TableCell>Symbol</TableCell>
                            <TableCell>Industries</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {displayedCompanies.length > 0 ? (
                            displayedCompanies.map((company, index) => (
                              <TableRow
                                key={index}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                              >
                                <TableCell component="th" scope="row">
                                  <MDBox display="flex" alignItems="center" lineHeight={1}>
                                    <MDAvatar src={company.Company_LogoURL || companyLogo} name={company.Company_Name} size="sm" />
                                    <MDBox ml={2} lineHeight={1}>
                                      <MDTypography display="block" variant="button" fontWeight="medium">
                                        {company.Company_Name || "N/A"}
                                      </MDTypography>
                                    </MDBox>
                                  </MDBox>
                                </TableCell>
                                <TableCell>
                                  <MDTypography variant="caption" color="text" fontWeight="medium">
                                    {company.Company_Symbol || "N/A"}
                                  </MDTypography>
                                </TableCell>
                                <TableCell>
                                  <MDTypography variant="caption" color="text" fontWeight="medium">
                                    {company.Company_Categories || "N/A"}
                                  </MDTypography>
                                </TableCell>
                                <TableCell align="center">
                                  <MDTypography variant="caption" color="text" fontWeight="medium">
                                    {company.Company_Status || "N/A"}
                                  </MDTypography>
                                </TableCell>
                                <TableCell align="center">
                                  <MDBox display="flex" justifyContent="center">
                                    <MDTypography 
                                      component="a" 
                                      href="#" 
                                      variant="caption" 
                                      color="text" 
                                      fontWeight="medium"
                                      mr={2}
                                    >
                                      Edit
                                    </MDTypography> 
                                  </MDBox>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} align="center">
                                <MDTypography variant="body2">
                                  {searchQuery ? "No matching companies found" : "No companies available"}
                                </MDTypography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <CustomPagination 
                      page={page}
                      rowsPerPage={rowsPerPage}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      totalItems={totalCompanies}
                      searchActive={!!searchQuery}
                      filteredCount={filteredCompanies.length}
                    />
                  </>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox> 
    </DashboardLayout>
  );
}

export default CompanyManagement; 