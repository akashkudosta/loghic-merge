import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

const CoinPriceMarquee = ({ coinIds = [] }) => {
  const [priceData, setPriceData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPriceData = async () => {
    try {
      // Create an array of promises for each coin fetch
      const fetchPromises = coinIds.map(async (coinId) => {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/companies/getCoinPriceDetails?Coin_CompanyCode=${coinId}.CRYPTO`, 
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch price data for ${coinId}`);
        }

        const data = await response.json();
        if (data.status && data.data) {
          return {
            id: coinId,
            name: data.data.Company_Name,
            symbol: data.data.Company_Symbol.replace('.CRYPTO', ''),
            logoUrl: data.data.Company_LogoURL,
            price: data.data.Coin_Current_Price,
            change_1h: data.data.Coin_PriceChangePercentage_1h
          };
        }
        return null;
      });

      // Wait for all fetches to complete
      const results = await Promise.all(fetchPromises);
      // Filter out any null results
      const validResults = results.filter(result => result !== null);
      setPriceData(validResults);
    } catch (error) {
      console.error('Error fetching price:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (coinIds.length > 0) {
      fetchPriceData();
    }
  }, [coinIds]);

  const formatPrice = (price) => {
    if (price >= 1) {
      return price.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return `$${price.toFixed(8)}`;
  };

  if (loading || priceData.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        width: '100%',
        overflow: 'hidden',
        bgcolor: '#fff',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          animation: 'marquee 30s linear infinite',
          '@keyframes marquee': {
            '0%': { transform: 'translateX(100%)' },
            '100%': { transform: 'translateX(-100%)' },
          },
          '&:hover': {
            animationPlayState: 'paused',
          },
          gap: 4,
          py: 1,
        }}
      >
        {[...priceData, ...priceData].map((coin, index) => (
          <Box
            key={`${coin.id}-${index}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              whiteSpace: 'nowrap',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <img 
                src={coin.logoUrl} 
                alt={coin.name}
                style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <Typography
                component="span"
                sx={{
                  fontWeight: 'bold',
                  color: '#1e2026',
                  fontSize: '16px',
                }}
              >
                {coin.name}
              </Typography>
            </Box>
            <Typography
              component="span"
              sx={{
                color: '#1e2026',
                fontSize: '16px',
              }}
            >
              {formatPrice(coin.price)}
            </Typography>
            <Typography
              component="span"
              sx={{
                color: coin.change_1h >= 0 ? '#00c853' : '#ff1744',
                display: 'flex',
                alignItems: 'center',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
            >
              {coin.change_1h >= 0 ? '↑' : '↓'}
              {Math.abs(coin.change_1h).toFixed(2)}%
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CoinPriceMarquee; 