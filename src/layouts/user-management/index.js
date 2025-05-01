import { Link } from "react-router-dom";
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
import UsersService from "services/users-service"; 
import userPlaceholderImage from "assets/images/user-placehoder.png"; 
import CustomPagination from "components/CustomPagination";

function UserManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Fetch users
  const fetchUsers = useCallback(async (pageNum = page, rowsCount = rowsPerPage) => {
    try {
      setLoading(true);
      // API expects 1-based pagination, but Material UI uses 0-based
      const apiPage = pageNum + 1;
      console.log(`Fetching users: page=${apiPage}, limit=${rowsCount}`);
      
      const response = await UsersService.getUsers(apiPage, rowsCount);
      
      if (response && response.data && response.data.users) {
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
        // Set total count from API response
        setTotalUsers(response.data.total || 0);
        console.log(`Received ${response.data.users.length} users, total: ${response.data.total || 0}`);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    // Fetch new data when page changes
    fetchUsers(newPage, rowsPerPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    // Fetch new data with new rows per page
    fetchUsers(0, newRowsPerPage);
  };

  // Handle search
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query) {
      console.log("Searching for:", query);
      console.log("Available users:", users);
      
      const filtered = users.filter(user => {
        // Log the first user to inspect structure
        if (users.indexOf(user) === 0) {
          console.log("User object structure:", user);
        }
        
        // Check all possible name fields with thorough null checking
        const firstName = (user.User_Fname || '').toLowerCase();
        const lastName = (user.User_Lname || '').toLowerCase();
        const fullName = (user.User_Name || '').toLowerCase();
        
        // Properly handle email field which might be in different properties
        const email = (user.User_Email || user.email || '').toLowerCase();
        
        // Check if any field contains the search string
        const hasMatch = 
          firstName.includes(query) || 
          lastName.includes(query) || 
          fullName.includes(query) || 
          email.includes(query) ||
          `${firstName} ${lastName}`.includes(query);
          
        return hasMatch;
      });
      
      console.log(`Found ${filtered.length} matches for "${query}"`);
      setFilteredUsers(filtered);
      // Reset to page 0 when searching
      setPage(0);
    } else {
      setFilteredUsers(users);
    }
  };

  // Calculate displayed users based on pagination
  // If searching, do client-side pagination, otherwise use the fetched page
  const displayedUsers = searchQuery 
    ? filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : filteredUsers;

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
                  Users Table
                </MDTypography>
              </MDBox>
              
              {/* Search Input */}
              <MDBox p={3} display="flex" justifyContent="flex-end">
                <MDInput
                  label="Search by name or email"
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
                    <MDTypography variant="body2">Loading users...</MDTypography>
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
                      <Table sx={{ minWidth: 650 }} aria-label="users table">
                        <TableHead className="listing_table_head_section" style={{ display: 'table-header-group' }}>
                          <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell align="center">Creation Date</TableCell>
                            <TableCell align="center">Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {displayedUsers.length > 0 ? (
                            displayedUsers.map((user, index) => (
                              <TableRow
                                key={index}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                              >
                                <TableCell component="th" scope="row">
                                  <MDBox display="flex" alignItems="center" lineHeight={1}>
                                    <MDAvatar src={user.User_ImageURL || userPlaceholderImage} name={user.User_Name} size="sm" />
                                    <MDBox ml={2} lineHeight={1}>
                                      <MDTypography display="block" variant="button" fontWeight="medium">
                                        {user.User_Name || `${user.User_Fname} ${user.User_Lname}`}
                                      </MDTypography>
                                    </MDBox>
                                  </MDBox>
                                </TableCell>
                                <TableCell>
                                  <MDTypography variant="caption" color="text" fontWeight="medium">
                                    {user.User_Email || "N/A"}
                                  </MDTypography>
                                </TableCell>
                                <TableCell>
                                  <MDTypography variant="caption" color="text" fontWeight="medium">
                                    {user.User_Role || "-"}
                                  </MDTypography>
                                </TableCell>
                                <TableCell align="center">
                                  <MDTypography variant="caption" color="text" fontWeight="medium">
                                    {formatDate(user.User_Created_at)}
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
                                    <MDTypography 
                                      component="a" 
                                      href="#" 
                                      variant="caption" 
                                      color="text" 
                                      fontWeight="medium"
                                    >
                                      Delete
                                    </MDTypography>
                                  </MDBox>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} align="center">
                                <MDTypography variant="body2">
                                  {searchQuery ? "No matching users found" : "No users available"}
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
                      totalItems={totalUsers}
                      searchActive={!!searchQuery}
                      filteredCount={filteredUsers.length}
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

export default UserManagement;
