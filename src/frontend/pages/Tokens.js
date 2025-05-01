import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
} from "@mui/material";
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Sparkline from 'components/Sparkline';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import BookmarkAddRoundedIcon from '@mui/icons-material/BookmarkAddRounded';
import FrontendLayout from "layouts/frontend";
import { AuthContext } from "context";
import { useNotification } from "../../context/NotificationContext";
import DOMPurify from 'dompurify';

const Tokens = () => {
  const { isAuthenticated, token, user } = useContext(AuthContext);
  const { showNotification } = useNotification();
  const [localUser, setLocalUser] = useState(null);
  const [tokensData, settokensData] = useState([]);
  const [watchlistData, setWatchlistData] = useState([]);
  const [gainersData, setGainersData] = useState([]);
  const [losersData, setLosersData] = useState([]);
  
  // Pagination states for each tab
  const [pagination, setPagination] = useState({
    all: { page: 1, limit: 20, hasMore: true },
    watchlist: { page: 1, limit: 20, hasMore: true },
    gainers: { page: 1, limit: 20, hasMore: true },
    losers: { page: 1, limit: 20, hasMore: true }
  });
  
  const [loading, setLoading] = useState({
    all: true,
    watchlist: true,
    gainers: true,
    losers: true
  });
  const [tabValue, setTabValue] = useState(0);

  // Try to get user data from localStorage if not available in context
  useEffect(() => {
    const checkUserData = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setLocalUser(parsedUser);
          // console.log('Retrieved user from localStorage:', parsedUser);
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }
    };

    if (isAuthenticated && !user) {
      // console.log('No user in context, checking localStorage');
      checkUserData();
    }
  }, [isAuthenticated, user]);

  // Debug effect to monitor auth state
  useEffect(() => {
    const authState = {
      isAuthenticated,
      contextUser: user,
      localStorageUser: localUser,
      token
    };
  }, [isAuthenticated, user, localUser, token]);

  // Process company data into the required format
  const processCompanyData = (companies) => {
    return companies.map(company => {
      const CoinPrice = company.CoinPrice[0];
      const sparklineData = CoinPrice && CoinPrice.Coin_Sparkline_7d && CoinPrice.Coin_Sparkline_7d.length > 1 ? CoinPrice.Coin_Sparkline_7d : [];
      
      const Current_Price =  CoinPrice && CoinPrice.Coin_Current_Price !== undefined 
          ? `${CoinPrice.Coin_Current_Price.toFixed(5)}` 
          : '0'
      const change1h = CoinPrice && CoinPrice.Coin_PriceChangePercentage_1h !== undefined 
          ? `${(CoinPrice.Coin_PriceChangePercentage_1h * 100).toFixed(5)}` 
          : '0'
      const change24h = CoinPrice && CoinPrice.Coin_PriceChangePercentage_24h !== undefined 
          ? `${(CoinPrice.Coin_PriceChangePercentage_24h * 100).toFixed(5)}` 
          : '0'
      const change7d = CoinPrice && CoinPrice.Coin_PriceChangePercentage_7h !== undefined 
          ? `${(CoinPrice.Coin_PriceChangePercentage_7h * 100).toFixed(5)}` 
          : '0'
      const volume = CoinPrice && CoinPrice.Coin_Price_24h !== undefined 
          ? `${CoinPrice.Coin_Price_24h.toFixed(5)}` 
          : '0'
      const marketCap = CoinPrice && CoinPrice.Coin_Circulating_Supply !== undefined 
          ? `${(CoinPrice.Coin_Current_Price * CoinPrice.Coin_Circulating_Supply).toFixed(5)}` 
          : '0'

      return {
        coin: `${company.Company_Name}`,
        price: Current_Price,
        change1h: change1h,
        change24h: change24h,
        change7d: change7d,
        volume: volume,
        marketCap: marketCap,
        last7Days: sparklineData.map(price => ({ value: price })),
        company: company,
        isWatchlisted: company.isWatchlisted === true,
        isFollowed: company.isFollowed === true
      };
    });
  };

  // Separate fetch functions for each tab
  const fetchAllTokens = async (append = false) => {
    const { page, limit } = pagination.all;
    try {
      const token = localStorage.getItem('token');
      setLoading(prev => ({ ...prev, all: true }));
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/companies/getCompanies?page=${page}&limit=${limit}`, {
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
      
      if (data && data.status) {
        const processedData = processCompanyData(data.data.companies);
        const hasMore = data.data.total > page * limit;
        
        setPagination(prev => ({
          ...prev,
          all: { ...prev.all, hasMore }
        }));
        
        if (append) {
          settokensData(prev => [...prev, ...processedData]);
        } else {
          settokensData(processedData);
        }
      } else {
        const errorMessage = data?.message || 'Failed to fetch tokens';
        showNotification({
          message: errorMessage,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching all tokens:', error);
      showNotification({
        message: error.message || 'An error occurred while fetching tokens',
        severity: 'error'
      });
    } finally {
      setLoading(prev => ({ ...prev, all: false }));
    }
  };

  const fetchWatchlist = async (append = false) => {
    const { page, limit } = pagination.watchlist;
    try {
      const token = localStorage.getItem('token');
      setLoading(prev => ({ ...prev, watchlist: true }));
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/companies/getUserCoinWatchlist?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        showNotification({
          message: 'Please login to view watchlist',
          severity: 'warning'
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.status) {
        const processedData = processCompanyData(data.data.companies);
        const hasMore = data.data.total > page * limit;
        
        setPagination(prev => ({
          ...prev,
          watchlist: { ...prev.watchlist, hasMore }
        }));
        
        if (append) {
          setWatchlistData(prev => [...prev, ...processedData]);
        } else {
          setWatchlistData(processedData);
        }
      } else {
        const errorMessage = data?.message || 'Failed to fetch watchlist';
        showNotification({
          message: errorMessage,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      showNotification({
        message: error.message || 'An error occurred while fetching watchlist',
        severity: 'error'
      });
    } finally {
      setLoading(prev => ({ ...prev, watchlist: false }));
    }
  };

  const fetchGainers = async (append = false) => {
    const { page, limit } = pagination.gainers;
    try {
      const token = localStorage.getItem('token');
      setLoading(prev => ({ ...prev, gainers: true }));
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/companies/getTopGainers?page=${page}&limit=${limit}`, {
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
      
      if (data && data.status) {
        const processedData = processCompanyData(data.data.companies);
        const hasMore = data.data.total > page * limit;
        
        setPagination(prev => ({
          ...prev,
          gainers: { ...prev.gainers, hasMore }
        }));
        
        if (append) {
          setGainersData(prev => [...prev, ...processedData]);
        } else {
          setGainersData(processedData);
        }
      } else {
        const errorMessage = data?.message || 'Failed to fetch gainers';
        showNotification({
          message: errorMessage,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching gainers:', error);
      showNotification({
        message: error.message || 'An error occurred while fetching gainers',
        severity: 'error'
      });
    } finally {
      setLoading(prev => ({ ...prev, gainers: false }));
    }
  };

  const fetchLosers = async (append = false) => {
    const { page, limit } = pagination.losers;
    try {
      const token = localStorage.getItem('token');
      setLoading(prev => ({ ...prev, losers: true }));
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/companies/getTopLosers?page=${page}&limit=${limit}`, {
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
      
      if (data && data.status) {
        const processedData = processCompanyData(data.data.companies);
        const hasMore = data.data.total > page * limit;
        
        setPagination(prev => ({
          ...prev,
          losers: { ...prev.losers, hasMore }
        }));
        
        if (append) {
          setLosersData(prev => [...prev, ...processedData]);
        } else {
          setLosersData(processedData);
        }
      } else {
        const errorMessage = data?.message || 'Failed to fetch losers';
        showNotification({
          message: errorMessage,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching losers:', error);
      showNotification({
        message: error.message || 'An error occurred while fetching losers',
        severity: 'error'
      });
    } finally {
      setLoading(prev => ({ ...prev, losers: false }));
    }
  };

  // Separate load more functions for each tab
  const loadMoreAll = () => {
    if (!pagination.all.hasMore || loading.all) return;
    
    setPagination(prev => ({
      ...prev,
      all: { 
        ...prev.all,
        page: prev.all.page + 1
      }
    }));
  };

  const loadMoreWatchlist = () => {
    if (!pagination.watchlist.hasMore || loading.watchlist) return;
    
    setPagination(prev => ({
      ...prev,
      watchlist: { 
        ...prev.watchlist,
        page: prev.watchlist.page + 1
      }
    }));
  };

  const loadMoreGainers = () => {
    if (!pagination.gainers.hasMore || loading.gainers) return;
    
    setPagination(prev => ({
      ...prev,
      gainers: { 
        ...prev.gainers,
        page: prev.gainers.page + 1
      }
    }));
  };

  const loadMoreLosers = () => {
    if (!pagination.losers.hasMore || loading.losers) return;
    
    setPagination(prev => ({
      ...prev,
      losers: { 
        ...prev.losers,
        page: prev.losers.page + 1
      }
    }));
  };

  useEffect(() => {
    // Initial data fetch for all tabs
    fetchAllTokens();
    if (isAuthenticated) {
      fetchWatchlist();
    }
    fetchGainers();
    fetchLosers();
  }, [isAuthenticated]);

  // Add effect to handle pagination changes
  useEffect(() => {
    if (pagination.all.page > 1) fetchAllTokens(true);
  }, [pagination.all.page]);

  useEffect(() => {
    if (pagination.watchlist.page > 1) fetchWatchlist(true);
  }, [pagination.watchlist.page]);

  useEffect(() => {
    if (pagination.gainers.page > 1) fetchGainers(true);
  }, [pagination.gainers.page]);

  useEffect(() => {
    if (pagination.losers.page > 1) fetchLosers(true);
  }, [pagination.losers.page]);

  useEffect(() => {
    const handleScroll = () => {
      if (loading.all || loading.watchlist || loading.gainers || loading.losers) return;
      
      const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
      const scrollThreshold = document.documentElement.offsetHeight - 200; // Increased threshold
      
      if (scrollPosition >= scrollThreshold) {
        // Adjust tab indices based on authentication status
        const adjustedTabValue = !isAuthenticated && tabValue > 0 ? tabValue + 1 : tabValue;
        
        switch(adjustedTabValue) {
          case 0:
            loadMoreAll();
            break;
          case 1:
            if (isAuthenticated) loadMoreWatchlist();
            break;
          case 2:
            loadMoreGainers();
            break;
          case 3:
            loadMoreLosers();
            break;
        }
      }
    };

    // Throttle scroll event for better performance
    let timeoutId;
    const throttledScroll = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', throttledScroll);
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loading, tabValue, pagination, isAuthenticated]);

  const handleCoinClick = (companyData) => {
    // Handle navigation to the profile view page
    window.location.href = `/profile/${companyData.Company_Symbol}`;
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    window.scrollTo(0, 0);
    
    // Reset pagination state for all tabs
    setPagination({
      all: { page: 1, limit: 20, hasMore: true },
      watchlist: { page: 1, limit: 20, hasMore: true },
      gainers: { page: 1, limit: 20, hasMore: true },
      losers: { page: 1, limit: 20, hasMore: true }
    });
    
    // Reset data arrays
    settokensData([]);
    setWatchlistData([]);
    setGainersData([]);
    setLosersData([]);
    
    // Determine which data to fetch based on tab index and auth status
    if (isAuthenticated) {
      switch(newValue) {
        case 0:
          fetchAllTokens();
          break;
        case 1:
          fetchWatchlist();
          break;
        case 2:
          fetchGainers();
          break;
        case 3:
          fetchLosers();
          break;
      }
    } else {
      switch(newValue) {
        case 0:
          fetchAllTokens();
          break;
        case 1:
          fetchGainers();
          break;
        case 2:
          fetchLosers();
          break;
      }
    }
  };

  const handleFavorite = async (company) => {
    try {
      if (!isAuthenticated) {
        showNotification({
          message: 'You must be logged in to follow coins',
          severity: 'warning'
        });
        return;
      }
      const token = localStorage.getItem('token');

      // Optimistically update UI
      const updateDataState = (prevData) => {
        return prevData.map(item => {
          if (item.company.Company_PublicID === company.Company_PublicID) {
            return {
              ...item,
              isFollowed: !item.isFollowed
            };
          }
          return item;
        });
      };

      settokensData(updateDataState);
      setWatchlistData(updateDataState);
      setGainersData(updateDataState);
      setLosersData(updateDataState);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/companies/coinAddorRemoveFollow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          Company_PublicID: company.Company_PublicID
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.status === true) {
        showNotification({
          message: data.data.isFollowed ? 'Coin followed successfully!' : 'Coin unfollowed successfully!',
          severity: 'success'
        });
      } else {
        // Revert state on error
        settokensData(updateDataState);
        setWatchlistData(updateDataState);
        setGainersData(updateDataState);
        setLosersData(updateDataState);
        
        const errorMessage = data?.message || 'Failed to update follow status';
        showNotification({
          message: errorMessage,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error in follow/unfollow:', error);
      showNotification({
        message: error.message || 'An error occurred while updating follow status',
        severity: 'error'
      });
    }
  };

  const handleBookmark = async (company) => {
    try {
      if (!isAuthenticated) {
        showNotification({
          message: 'You must be logged in to add to watchlist',
          severity: 'warning'
        });
        return;
      }

      const token = localStorage.getItem('token');

      // Optimistically update UI
      const updateDataState = (prevData) => {
        return prevData.map(item => {
          if (item.company.Company_PublicID === company.Company_PublicID) {
            return {
              ...item,
              isWatchlisted: !item.isWatchlisted
            };
          }
          return item;
        });
      };

      settokensData(updateDataState);
      setWatchlistData(prevData => {
        const isCurrentlyWatchlisted = prevData.some(
          item => item.company.Company_PublicID === company.Company_PublicID
        );
        
        if (isCurrentlyWatchlisted) {
          // Remove from watchlist
          return prevData.filter(
            item => item.company.Company_PublicID !== company.Company_PublicID
          );
        } else {
          // Add to watchlist if we have the full item data
          const itemToAdd = [...tokensData, ...gainersData, ...losersData].find(
            item => item.company.Company_PublicID === company.Company_PublicID
          );
          return itemToAdd ? [...prevData, itemToAdd] : prevData;
        }
      });
      setGainersData(updateDataState);
      setLosersData(updateDataState);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/companies/coinAddorRemoveWatchlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          Company_PublicID: company.Company_PublicID
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.status === true) {
        showNotification({
          message: data.data.isAdded ? 'Added to watchlist successfully!' : 'Removed from watchlist successfully!',
          severity: 'success'
        });
      } else {
        // Revert state on error
        settokensData(updateDataState);
        setWatchlistData(updateDataState);
        setGainersData(updateDataState);
        setLosersData(updateDataState);
        
        const errorMessage = data?.message || 'Failed to update watchlist';
        showNotification({
          message: errorMessage,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error in watchlist update:', error);
      showNotification({
        message: error.message || 'An error occurred while updating watchlist',
        severity: 'error'
      });
    }
  };

  const renderTable = (data, isLoading) => {
    if (isLoading && pagination.all.page === 1) {
      return <MDTypography variant="body1" p={2}>Loading...</MDTypography>;
    }

    return ( 
      <TableContainer sx={{boxShadow: 'none'}}>
        <Table>
          <TableHead style={{ display: "table-header-group" }}>
            <TableRow>
              <TableCell>Coin</TableCell>
              <TableCell>Price($)</TableCell>
              <TableCell>1h(%)</TableCell>
              <TableCell>24h(%)</TableCell>
              <TableCell>7d(%)</TableCell>
              <TableCell>24h Volume($)</TableCell>
              <TableCell>Market Cap($)</TableCell>
              <TableCell>Last 7 Days</TableCell>
              {isAuthenticated && (
                <TableCell align="right" sx={{ width: '100px', minWidth: '100px' }}>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((security, index) => (
              <TableRow key={`${security.company.Company_PublicID}-${index}`} sx={{ cursor: 'pointer' }}>
                <TableCell>
                  <Link to={`/coin-profile/${security.company.Company_Symbol}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <MDBox display="flex" alignItems="center">
                      <MDBox
                        component="img"
                        src={security.company.Company_LogoURL}
                        alt={security.coin}
                        width="32px"
                        height="32px"
                        mr={2}
                        borderRadius="50%"
                      />
                      <MDTypography variant="button" fontWeight="medium">
                        {security.coin}
                      </MDTypography>
                    </MDBox>
                  </Link>
                </TableCell>
                <TableCell style={{ color: security.price.startsWith('-') ? 'red' : 'green' }}>{security.price}</TableCell>
                <TableCell style={{ color: security.change1h.startsWith('-') ? 'red' : 'green' }}>{security.change1h}</TableCell>
                <TableCell style={{ color: security.change24h.startsWith('-') ? 'red' : 'green' }}>{security.change24h}</TableCell>
                <TableCell style={{ color: security.change7d.startsWith('-') ? 'red' : 'green' }}>{security.change7d}</TableCell>
                <TableCell style={{ color: security.volume.startsWith('-') ? 'red' : 'green' }}>{security.volume}</TableCell>
                <TableCell style={{ color: security.marketCap.startsWith('-') ? 'red' : 'green' }}>{security.marketCap}</TableCell>
                <TableCell width="150" >
                  <Sparkline data={security.last7Days} />
                </TableCell>
                {isAuthenticated && (
                  <TableCell align="right" sx={{ 
                    width: '100px', 
                    minWidth: '100px',
                    pr: 2,
                    '& .MuiSvgIcon-root': {
                      transition: 'all 0.2s ease-in-out',
                    }
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <FavoriteRoundedIcon 
                        sx={{ 
                          color: security.isFollowed ? '#FF3B30' : '#666',
                          
                          cursor: 'pointer', 
                          fontSize: '20px',
                          '&:hover': { 
                            opacity: 0.8,
                            transform: 'scale(1.1)'
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavorite(security.company);
                        }}
                        style={{width: '24px', height: '24px'}}
                      />
                      <BookmarkAddRoundedIcon 
                        sx={{ 
                          color: security.isWatchlisted ? '#34C759' : '#666',
                          cursor: 'pointer', 
                          fontSize: '20px',
                          '&:hover': { 
                            opacity: 0.8,
                            transform: 'scale(1.1)'
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookmark(security.company);
                        }}
                        style={{width: '24px', height: '24px'}}
                      />
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer> 
    );
  };

  const renderContent = () => {
    if (isAuthenticated) {
      switch(tabValue) {
        case 0:
          return (
            <MDBox>
              {renderTable(tokensData, loading.all)}
            </MDBox>
          );
        case 1:
          return (
            <MDBox>
              {renderTable(watchlistData, loading.watchlist)}
            </MDBox>
          );
        case 2:
          return (
            <MDBox>
              {renderTable(gainersData, loading.gainers)}
            </MDBox>
          );
        case 3:
          return (
            <MDBox>
              {renderTable(losersData, loading.losers)}
            </MDBox>
          );
        default:
          return null;
      }
    } else {
      switch(tabValue) {
        case 0:
          return (
            <>
              {renderTable(tokensData, loading.all)}
            </>
          );
        case 1:
          return (
            <>
              {renderTable(gainersData, loading.gainers)}
            </>
          );
        case 2:
          return (
            <>
              {renderTable(losersData, loading.losers)}
            </>
          );
        default:
          return null;
      }
    }
  };

  return (
    <FrontendLayout>
      <MDBox>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          style={{backgroundColor: 'transparent', padding:0, width: 'max-content', marginBottom:'10px'}}
          sx={{
            width: { xs: '100%', md: '60%' },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Tab style={{padding:'10px 20px'}} icon={<FormatListBulletedIcon />} label="Tokens" />
          {isAuthenticated && (
            <Tab style={{padding:'10px 20px'}} icon={<RemoveRedEyeOutlinedIcon />} label="Watchlist" />
          )}
          <Tab style={{padding:'10px 20px'}} icon={<TrendingUpIcon />} label="Gainers" />
          <Tab style={{padding:'10px 20px'}} icon={<TrendingDownIcon />} label="Losers" />
        </Tabs>
        <Card>
          <MDBox p={0}>
            {renderContent()}
          </MDBox>
        </Card>
      </MDBox>
    </FrontendLayout>
  );
};

export default Tokens;
