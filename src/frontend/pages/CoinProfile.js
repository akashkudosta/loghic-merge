import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Grid, Card } from '@mui/material';
import companyProfileBg from "assets/images/company-profile-banner.png";
import CoinPriceChartsComponent from 'components/CoinPriceChartsComponent';
import PriceComparisonChartComponent from 'components/PriceComparisonChartComponent';
import CoinConverter from 'components/CoinConverter';
import CoinPriceStatic from 'components/CoinPriceStatic';
import CoinPriceMarquee from 'components/CoinPriceMarquee';
import NewsPost from 'components/NewsPost';
import NewsPostProfile from 'components/NewsPostProfile';
import { useNotification } from "../../context/NotificationContext";
import { AuthContext } from "../../context";
import FrontendLayout from "layouts/frontend";

const CoinProfile = () => {
  const { symbol } = useParams(); // Get the coin name from the URL parameters
  const coinName = symbol.replace('.CRYPTO', '');
  const { showNotification } = useNotification();
  const { isAuthenticated } = useContext(AuthContext);

  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);

  const fetchCompanyData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/companies/getCompanybySymbol?Company_Symbol=${symbol}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.status) {
        setCompanyData(data.data);
        // Set posts from company data
        if (data.data.Company_Posts) {
          setPosts(data.data.Company_Posts);
        }
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Error fetching company data");
      console.error("Error fetching company data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInteraction = async (type, postId) => {
    if (!isAuthenticated) {
      const messages = {
        like: 'Please login to like posts',
        dislike: 'Please login to dislike posts',
        comment: 'Please login to comment on posts',
        share: 'Please login to share posts'
      };

      showNotification({
        message: messages[type] || 'Please login to interact with posts',
        severity: 'warning'
      });
      return { success: false };
    }

    if (type === 'like' || type === 'dislike') {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/postVote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            PostVote_PostID: postId,
            PostVote_VoteType: type === 'like' ? 'Like' : 'Dislike'
          }),
        });

        const data = await response.json();
        if (data.status) {
          // Update the post with new counts in local state
          setPosts(prevPosts =>
            prevPosts.map(post => {
              if (post.Post_PublicID === postId) {
                return {
                  ...post,
                  Post_NumLikes: data.data.Post_NumLikes,
                  Post_NumDislikes: data.data.Post_NumDislikes
                };
              }
              return post;
            })
          );

          showNotification({
            message: data.message,
            severity: 'success'
          });

          return {
            success: true,
            likes: data.data.Post_NumLikes,
            dislikes: data.data.Post_NumDislikes
          };
        } else {
          showNotification({
            message: data.message || `Failed to ${type} the post`,
            severity: 'error'
          });
          return { success: false };
        }
      } catch (error) {
        console.error(`Error handling ${type}:`, error);
        showNotification({
          message: 'An error occurred while processing your request',
          severity: 'error'
        });
        return { success: false };
      }
    }
    return { success: true };
  };

  useEffect(() => {
    fetchCompanyData();
  }, [coinName]);

  if (loading) {
    return <Typography variant="body1">Loading...</Typography>;
  }

  if (error) {
    return <Typography variant="body1">{error}</Typography>;
  }

  if (!companyData) {
    return <Typography variant="body1">Company not found.</Typography>;
  }

  const { Company_Name, Company_LogoURL, Company_Symbol, CoinPrice, Company_Categories, Company_CoinSymbol, Related_Companies } = companyData;
  // Remove ".CRYPTO" from Company_Symbol
  const cleanCompanySymbol = Company_Symbol.replace('.CRYPTO', '');

  // Format main company CoinPriceChartsData
  const CoinPriceChartsData = CoinPrice?.Coin_Sparkline_7d 
    ? CoinPrice.Coin_Sparkline_7d.slice(0, 40).map((price, index) => [
        Date.now() - index * 1000 * 60, 
        price
      ])
    : [];

  // Get array of all company symbols
  const allCompanySymbols = [
    cleanCompanySymbol,
    ...Related_Companies.map(company => company.Company_Symbol.replace('.CRYPTO', ''))
  ];

  // Format related companies data with separate variables
  const formattedRelatedCompanies = Related_Companies.reduce((acc, company) => {
    const cleanSymbol = company.Company_Symbol.replace('.CRYPTO', '');
    acc[cleanSymbol] = company.Coin_Sparkline_7d.length
      ? company.Coin_Sparkline_7d[0].slice(0, 100).map((price, index) => [
          Date.now() - index * 1000 * 60, price
        ])
      : [];
    return acc;
  }, {});

  // Create the comparison data object
  const CompanyPriceComparisonData = {
    [cleanCompanySymbol]: CoinPriceChartsData,
    ...formattedRelatedCompanies
  };

  // Create a comma-separated string of all symbols
  const allSymbolsString = allCompanySymbols.join(', ');

  return (
    <FrontendLayout>
      <Box style={{ border: '1px solid #ccc', padding: '5px 10px', backgroundColor: '#ffffff', width: '100%', borderRadius: '5px', overflow: 'hidden', marginBottom: '20px' }}>
        <CoinPriceMarquee coinIds={allCompanySymbols} />
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Box sx={{ padding: 2, border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#ffffff' }}>
            <Box sx={{ backgroundImage: `url(${companyProfileBg})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '5px 5px 0px 0px', marginBottom: 7, height: 80, marginTop: -2, marginLeft: -2, marginRight: -2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img src={Company_LogoURL} alt={Company_Name} height="80" width="80" style={{ borderRadius: '80px', position:'relative', top: '50%', border: '6px solid #fff'  }} />
            </Box>
            <Typography variant="h4" style={{ fontWeight: 'bold', textAlign: 'center' }}>{Company_Name} {Company_CoinSymbol}</Typography>
            <Box sx={{ backgroundColor: '#FDEBD5', padding: 1, borderRadius: 1, marginTop: 2, marginBottom: 2, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">${CoinPrice.Coin_Current_Price.toFixed(2)}</Typography>
              <Typography variant="body1" sx={{fontSize: '14.5px', paddingLeft: '10px', textAlign: 'right'}}>{CoinPrice.Coin_PriceChangePercentage_1h.toFixed(2)}%</Typography>
            </Box>

            <Box style={{ border: '1px solid #ddd', borderRadius: '5px', padding: 2, marginTop: 2 }}>
              <Box sx={{ borderBottom: '1px solid #ddd', padding: 1, marginTop: 1, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Market Cap</Typography>
                <Typography variant="body1" sx={{fontSize: '14.5px', paddingLeft: '10px', textAlign: 'right'}}>${(CoinPrice.Coin_Current_Price * CoinPrice.Coin_Circulating_Supply).toFixed(2)}</Typography>
              </Box>
              <Box sx={{ borderBottom: '1px solid #ddd', padding: 1, marginTop: 1, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Fully Diluted Valuation</Typography>
                <Typography variant="body1" sx={{fontSize: '14.5px', paddingLeft: '10px', textAlign: 'right'}}>${CoinPrice.Coin_Fully_Diluted_Valuation.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ borderBottom: '1px solid #ddd', padding: 1, marginTop: 1, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">24 Hour Trading Vol</Typography>
                <Typography variant="body1" sx={{fontSize: '14.5px', paddingLeft: '10px', textAlign: 'right'}}>
                    {CoinPrice.Coin_Price_24h < 0 ? '-' : ''} 
                    ${Math.abs(CoinPrice.Coin_Price_24h)}
                </Typography>
              </Box>
              <Box sx={{ borderBottom: '1px solid #ddd', padding: 1, marginTop: 1, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Circulating Supply</Typography>
                <Typography variant="body1" sx={{fontSize: '14.5px', paddingLeft: '10px', textAlign: 'right'}} >{CoinPrice.Coin_Circulating_Supply.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ borderBottom: '1px solid #ddd', padding: 1, marginTop: 1, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Total Supply</Typography>
                <Typography variant="body1" sx={{fontSize: '14.5px', paddingLeft: '10px', textAlign: 'right'}}>{CoinPrice.Coin_Total_Supply.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ padding: 1, marginTop: 1, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Max Supply</Typography>
                <Typography variant="body1" sx={{fontSize: '14.5px', paddingLeft: '10px', textAlign: 'right'}}>{CoinPrice.Coin_Max_Supply.toFixed(2)}</Typography>
              </Box>
            </Box>

            <Box sx={{backgroundColor: '#FDEBD5', padding: 1, borderRadius: 1, marginTop: 2, marginBottom: 2, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" style={{fontWeight: 'bold', fontSize: '21px', color: '#000'}}>Company Information </Typography>
            </Box>

            <Box style={{ border: '1px solid #ddd', borderRadius: '5px', padding: 2, marginTop: 2 }}>
              <Box sx={{ borderBottom: '1px solid #ddd', padding: 1, marginTop: 1, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Website</Typography>
                <Typography variant="body1" sx={{fontSize: '14.5px', paddingLeft: '10px', textAlign: 'right'}}>{CoinPrice.Coin_WebsiteURL}</Typography>
              </Box>
              <Box sx={{ padding: 1, marginTop: 1, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Categories</Typography>
                <Typography variant="body1" sx={{fontSize: '14.5px', paddingLeft: '10px', textAlign: 'right'}}>{Company_Categories}</Typography>
              </Box>
            </Box>

          </Box>
        </Grid>
        <Grid item xs={12} md={8}>
          <Box sx={{ padding: 2, border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#ffffff', marginBottom: '20px' }}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 2,  marginBottom: '20px'}}>
              <img src={Company_LogoURL} alt={Company_Name} style={{ width: '40px', height: '40px', borderRadius: '50%'}}/>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {Company_Name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    {Company_CoinSymbol }/USD
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    ${CoinPrice.Coin_Current_Price.toFixed(2)}
                  </Typography>
                  <Typography  variant="body1" sx={{ color: CoinPrice.Coin_PriceChangePercentage_1h < 0 ? '#E63946' : '#2ECC71', fontWeight: 'bold' }} >
                    {CoinPrice.Coin_PriceChangePercentage_1h < 0 ? '▼' : '▲'} 
                    {Math.abs(CoinPrice.Coin_PriceChangePercentage_1h).toFixed(2)}%
                  </Typography>
                </Box>
              </Box>
            </Box>
            <CoinPriceChartsComponent data={CoinPriceChartsData} />
          </Box>

          <Box sx={{ padding: 2, border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#ffffff', marginTop: '20px', marginBottom: '20px' }}>
            <Typography variant="h6" style={{fontWeight: 'bold', fontSize: '18px', color: '#000'}}>Crypto Price Comparison</Typography>
            <PriceComparisonChartComponent currentCompany={companyData} />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ padding: 2, border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#ffffff' }}>
                <CoinConverter coinName={coinName} coinSymbol={Company_CoinSymbol} Company_LogoURL={Company_LogoURL}/>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ padding: 2, border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#ffffff' }}>
                <CoinPriceStatic coinId={coinName} coinSymbol={Company_CoinSymbol} Company_LogoURL={Company_LogoURL}/>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Full Width Posts Section */}
      {posts.length > 0 && (
        <Box sx={{ mt: 4, width: '100%' }}>
          <Card sx={{ 
            p: 3, 
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Loghical News</Typography>
            <Box>
              <Grid container spacing={3}>
                {posts.map((post) => (
                  <Grid item xs={12} sm={6} md={3} key={`grid-${post._id}`}>
                    <Card sx={{ 
                      backgroundColor: 'white', 
                      borderRadius: '10px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      <NewsPostProfile post={post} onInteraction={handleInteraction} />
                    </Card>
                  </Grid>
                ))}
              </Grid>
              {posts.length <= 1 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text">
                    No additional posts available
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>
        </Box>
      )}
    </FrontendLayout>
  );
};

export default CoinProfile;