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
import DashboardLayout from "examples/LayoutContainers/DashboardLayout"; 
import PostsService from "services/posts-service";  
import CustomPagination from "components/CustomPagination";

function PostManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalPosts, setTotalPosts] = useState(0);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Truncate text helper
  const truncateText = (text, length = 50) => {
    if (!text) return "N/A";
    return text.length > length ? `${text.substring(0, length)}...` : text;
  };

  // Strip HTML tags helper
  const stripHtml = (html) => {
    if (!html) return "N/A";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // Fetch posts
  const fetchPosts = useCallback(async (pageNum = page, rowsCount = rowsPerPage) => {
    try {
      setLoading(true);
      // API expects 1-based pagination, but Material UI uses 0-based
      const apiPage = pageNum + 1;
      console.log(`Fetching posts: page=${apiPage}, limit=${rowsCount}`);
      
      const response = await PostsService.getPosts(apiPage, rowsCount);
      
      if (response && response.data && response.data.posts) {
        setPosts(response.data.posts);
        setFilteredPosts(response.data.posts);
        // Set total count from API response
        setTotalPosts(response.data.total || 0);
        console.log(`Received ${response.data.posts.length} posts, total: ${response.data.total || 0}`);
      } else {
        console.error("Unexpected API response format:", response);
        setError("Invalid response format from server");
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(err.message || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchPosts(0, rowsPerPage);
  }, []);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    // Fetch new data when page changes
    fetchPosts(newPage, rowsPerPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    // Fetch new data with new rows per page
    fetchPosts(0, newRowsPerPage);
  };

  // Handle search
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query) {
      console.log("Searching for:", query);
      
      const filtered = posts.filter(post => {
        // Log the first post to inspect structure
        if (posts.indexOf(post) === 0) {
          console.log("Post object structure:", post);
        }
        
        // Search by title and content using the correct field names
        const title = (post.Post_Title || '').toLowerCase();
        const content = stripHtml((post.Post_Text || '')).toLowerCase();
        
        return title.includes(query) || content.includes(query);
      });
      
      console.log(`Found ${filtered.length} matches for "${query}"`);
      setFilteredPosts(filtered);
      setPage(0);
    } else {
      setFilteredPosts(posts);
    }
  };

  // Calculate displayed posts based on pagination
  const displayedPosts = searchQuery 
    ? filteredPosts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : filteredPosts;

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
                  Posts Table
                </MDTypography>
              </MDBox>
              
              {/* Search Input */}
              <MDBox p={3} display="flex" justifyContent="flex-end">
                <MDInput
                  label="Search by title or content"
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
                    <MDTypography variant="body2">Loading posts...</MDTypography>
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
                      <Table sx={{ minWidth: 650 }} aria-label="posts table">
                        <TableHead className="listing_table_head_section" style={{ display: 'table-header-group' }}>
                          <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Content</TableCell>
                            <TableCell>Author</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Creation Date</TableCell>
                            <TableCell align="center">Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {displayedPosts.length > 0 ? (
                            displayedPosts.map((post, index) => (
                              <TableRow
                                key={index}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                              >
                                <TableCell component="th" scope="row"> 
                                    <MDTypography display="block" variant="button" fontWeight="medium">
                                        {truncateText(post.Post_Title, 30) || "N/A"}
                                    </MDTypography>
                                </TableCell>
                                <TableCell>
                                  <MDTypography variant="caption" color="text" fontWeight="medium">
                                    {truncateText(stripHtml(post.Post_Text), 50) || "N/A"}
                                  </MDTypography>
                                </TableCell>
                                <TableCell>
                                  <MDTypography variant="caption" color="text" fontWeight="medium">
                                    {post.Post_UserName || "N/A"}
                                  </MDTypography>
                                </TableCell>
                                <TableCell>
                                  <MDTypography variant="caption" color="text" fontWeight="medium">
                                    {post.Post_Status || "N/A"}
                                  </MDTypography>
                                </TableCell>
                                <TableCell align="center">
                                  <MDTypography variant="caption" color="text" fontWeight="medium">
                                    {formatDate(post.Post_CreatedDate)}
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
                                  {searchQuery ? "No matching posts found" : "No posts available"}
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
                      totalItems={totalPosts}
                      searchActive={!!searchQuery}
                      filteredCount={filteredPosts.length}
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

export default PostManagement; 