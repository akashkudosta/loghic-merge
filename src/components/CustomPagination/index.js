import React from "react";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function CustomPagination({
  page,
  count,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 15, 20, 25],
  totalItems,
  searchActive,
  filteredCount
}) {
  // Calculate max page
  const maxPage = Math.ceil((searchActive ? filteredCount : totalItems) / rowsPerPage) - 1;
  
  // Handler for page change
  const handlePageChange = (newPage) => {
    if (newPage < 0 || newPage > maxPage) return;
    onPageChange(null, newPage);
  };

  // Handler for rows per page change
  const handleRowsPerPageChange = (event) => {
    onRowsPerPageChange(event);
  };

  return (
    <MDBox
      display="flex"
      flexDirection={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      p={3}
    >
      <MDBox display="flex" alignItems="center">
        <MDTypography variant="body2" color="secondary">
          Rows per page:
        </MDTypography>
        <select
          value={rowsPerPage}
          onChange={handleRowsPerPageChange}
          style={{ 
            marginLeft: '10px', 
            padding: '5px',
            borderRadius: '4px',
            border: '1px solid #ddd' 
          }}
        >
          {rowsPerPageOptions.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </MDBox>
      
      <MDBox display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }}>
        <MDTypography variant="body2" color="secondary" mr={1}>
          {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, (searchActive ? filteredCount : totalItems))} of {searchActive ? filteredCount : totalItems}
        </MDTypography>
        
        <MDBox display="flex">
          {/* First page button */}
          <MDBox
            color="dark"
            width="30px"
            height="30px"
            display="flex"
            justifyContent="center"
            alignItems="center"
            borderRadius="50%"
            shadow="md"
            opacity={page === 0 ? 0.5 : 1}
            mr={1}
            sx={{ 
              cursor: page === 0 ? "not-allowed" : "pointer",
              backgroundColor: "#cccccc", 
            }}
            onClick={() => page > 0 && handlePageChange(0)}
          >
            <MDTypography variant="body2" fontWeight="bold">
              &lt;&lt;
            </MDTypography>
          </MDBox>
          
          {/* Previous page button */}
          <MDBox
            color="dark"
            width="30px"
            height="30px"
            display="flex"
            justifyContent="center"
            alignItems="center"
            borderRadius="50%"
            shadow="md"
            opacity={page === 0 ? 0.5 : 1}
            mr={1}
            sx={{ 
              cursor: page === 0 ? "not-allowed" : "pointer",
              backgroundColor: "#cccccc", 
            }}
            onClick={() => page > 0 && handlePageChange(page - 1)}
          >
            <MDTypography variant="body2" fontWeight="bold">
              &lt;
            </MDTypography>
          </MDBox>
          
          {/* Page number buttons - only show max 5 pages */}
          {(() => {
            const buttons = [];
            let startPage = 0;
            
            // Calculate which pages to show
            if (maxPage <= 4) {
              // If less than 5 pages, show all
              startPage = 0;
            } else if (page <= 2) {
              // If on first 3 pages, show pages 1-5
              startPage = 0;
            } else if (page >= maxPage - 2) {
              // If on last 3 pages, show last 5 pages
              startPage = maxPage - 4;
            } else {
              // Otherwise show current page with 2 before and 2 after
              startPage = page - 2;
            }
            
            // Generate page buttons
            for (let i = 0; i < Math.min(5, maxPage + 1); i++) {
              const pageNum = startPage + i;
              if (pageNum > maxPage) break;
              
              const isActive = page === pageNum;
              buttons.push(
                <MDBox
                  key={pageNum}
                  color={isActive ? "white" : "dark"}
                  width="30px"
                  height="30px"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  borderRadius="50%"
                  shadow="md"
                  mx={0.5}
                  sx={{ 
                    cursor: "pointer",
                    backgroundColor: isActive ? "#1976d2" : "#cccccc",
                  }}
                  onClick={() => handlePageChange(pageNum)}
                >
                  <MDTypography variant="body2" fontWeight="bold">
                    {pageNum + 1}
                  </MDTypography>
                </MDBox>
              );
            }
            
            return buttons;
          })()}
          
          {/* Next page button */}
          <MDBox
            color="dark"
            width="30px"
            height="30px"
            display="flex"
            justifyContent="center"
            alignItems="center"
            borderRadius="50%"
            shadow="md"
            opacity={page >= maxPage ? 0.5 : 1}
            ml={1}
            sx={{ 
              cursor: page >= maxPage ? "not-allowed" : "pointer",
              backgroundColor: "#cccccc",
            }}
            onClick={() => page < maxPage && handlePageChange(page + 1)}
          >
            <MDTypography variant="body2" fontWeight="bold">
              &gt;
            </MDTypography>
          </MDBox>
          
          {/* Last page button */}
          <MDBox
            color="dark"
            width="30px"
            height="30px"
            display="flex"
            justifyContent="center"
            alignItems="center"
            borderRadius="50%"
            shadow="md"
            opacity={page >= maxPage ? 0.5 : 1}
            ml={1}
            sx={{ 
              cursor: page >= maxPage ? "not-allowed" : "pointer",
              backgroundColor: "#cccccc",
            }}
            onClick={() => page < maxPage && handlePageChange(maxPage)}
          >
            <MDTypography variant="body2" fontWeight="bold">
              &gt;&gt;
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
    </MDBox>
  );
}

// Prop types validation
CustomPagination.propTypes = {
  page: PropTypes.number.isRequired,
  count: PropTypes.number,
  rowsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func.isRequired,
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
  totalItems: PropTypes.number.isRequired,
  searchActive: PropTypes.bool,
  filteredCount: PropTypes.number
};

// Default props
CustomPagination.defaultProps = {
  count: 0,
  rowsPerPageOptions: [5, 10, 15, 20, 25],
  searchActive: false,
  filteredCount: 0
};

export default CustomPagination; 