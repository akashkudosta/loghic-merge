import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import MDBox from "components/MDBox";
import { COINGECKO_API_URL, COINGECKO_API_KEY, getHeaders } from '../config';

const CoinPriceStatic = ({ coinId, coinSymbol, Company_LogoURL }) => {
  const [priceData, setPriceData] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('usd');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const CURRENCY_OPTIONS = [
    { value: 'aed', label: 'AED', symbol: 'د.إ' },
    { value: 'ars', label: 'ARS', symbol: '$' },
    { value: 'aud', label: 'AUD', symbol: 'A$' },
    { value: 'bch', label: 'BCH', symbol: '₿' },
    { value: 'bdt', label: 'BDT', symbol: '৳' },
    { value: 'bhd', label: 'BHD', symbol: '.د.ب' },
    { value: 'bits', label: 'BITS', symbol: 'μ₿' },
    { value: 'bmd', label: 'BMD', symbol: '$' },
    { value: 'bnb', label: 'BNB', symbol: 'BNB' },
    { value: 'brl', label: 'BRL', symbol: 'R$' },
    { value: 'btc', label: 'BTC', symbol: '₿' },
    { value: 'cad', label: 'CAD', symbol: 'C$' },
    { value: 'chf', label: 'CHF', symbol: 'Fr' },
    { value: 'clp', label: 'CLP', symbol: '$' },
    { value: 'cny', label: 'CNY', symbol: '¥' },
    { value: 'czk', label: 'CZK', symbol: 'Kč' },
    { value: 'dkk', label: 'DKK', symbol: 'kr' },
    { value: 'dot', label: 'DOT', symbol: 'DOT' },
    { value: 'eos', label: 'EOS', symbol: 'EOS' },
    { value: 'eth', label: 'ETH', symbol: 'Ξ' },
    { value: 'eur', label: 'EUR', symbol: '€' },
    { value: 'gbp', label: 'GBP', symbol: '£' },
    { value: 'gel', label: 'GEL', symbol: '₾' },
    { value: 'hkd', label: 'HKD', symbol: 'HK$' },
    { value: 'huf', label: 'HUF', symbol: 'Ft' },
    { value: 'idr', label: 'IDR', symbol: 'Rp' },
    { value: 'ils', label: 'ILS', symbol: '₪' },
    { value: 'inr', label: 'INR', symbol: '₹' },
    { value: 'jpy', label: 'JPY', symbol: '¥' },
    { value: 'krw', label: 'KRW', symbol: '₩' },
    { value: 'kwd', label: 'KWD', symbol: 'د.ك' },
    { value: 'link', label: 'LINK', symbol: 'LINK' },
    { value: 'lkr', label: 'LKR', symbol: '₨' },
    { value: 'ltc', label: 'LTC', symbol: 'Ł' },
    { value: 'mmk', label: 'MMK', symbol: 'K' },
    { value: 'mxn', label: 'MXN', symbol: '$' },
    { value: 'myr', label: 'MYR', symbol: 'RM' },
    { value: 'ngn', label: 'NGN', symbol: '₦' },
    { value: 'nok', label: 'NOK', symbol: 'kr' },
    { value: 'nzd', label: 'NZD', symbol: 'NZ$' },
    { value: 'php', label: 'PHP', symbol: '₱' },
    { value: 'pkr', label: 'PKR', symbol: '₨' },
    { value: 'pln', label: 'PLN', symbol: 'zł' },
    { value: 'rub', label: 'RUB', symbol: '₽' },
    { value: 'sar', label: 'SAR', symbol: '﷼' },
    { value: 'sats', label: 'SATS', symbol: 'ș' },
    { value: 'sek', label: 'SEK', symbol: 'kr' },
    { value: 'sgd', label: 'SGD', symbol: 'S$' },
    { value: 'thb', label: 'THB', symbol: '฿' },
    { value: 'try', label: 'TRY', symbol: '₺' },
    { value: 'twd', label: 'TWD', symbol: 'NT$' },
    { value: 'uah', label: 'UAH', symbol: '₴' },
    { value: 'usd', label: 'USD', symbol: '$' },
    { value: 'vef', label: 'VEF', symbol: 'Bs' },
    { value: 'vnd', label: 'VND', symbol: '₫' },
    { value: 'xag', label: 'XAG', symbol: 'XAG' },
    { value: 'xau', label: 'XAU', symbol: 'XAU' },
    { value: 'xdr', label: 'XDR', symbol: 'XDR' },
    { value: 'xlm', label: 'XLM', symbol: 'XLM' },
    { value: 'xrp', label: 'XRP', symbol: 'XRP' },
    { value: 'yfi', label: 'YFI', symbol: 'YFI' },
    { value: 'zar', label: 'ZAR', symbol: 'R' },
  ];

  // Fetch price data from CoinGecko
  const fetchPriceData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${COINGECKO_API_URL}/simple/price?ids=${coinId}&vs_currencies=${selectedCurrency}&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`,
        {
          headers: getHeaders(),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch price data');
      }
      
      const data = await response.json();
      if (data[coinId]) {
        setPriceData({
          price: data[coinId][selectedCurrency],
          change24h: data[coinId][`${selectedCurrency}_24h_change`],
        });
      }
    } catch (error) {
      setError('Failed to fetch price data. Please try again later.');
      console.error('Error fetching price:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on initial load and when currency changes
  useEffect(() => {
    fetchPriceData();
  }, [coinId, selectedCurrency]);

  // Format price with appropriate decimals
  const formatPrice = (price) => {
    if (price >= 1) {
      return price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return price.toFixed(8);
  };

  // Get currency symbol
  const getCurrencySymbol = () => {
    const currency = CURRENCY_OPTIONS.find(c => c.value === selectedCurrency);
    return currency ? currency.symbol : '';
  };

  // Handle currency change
  const handleCurrencyChange = (e) => {
    setSelectedCurrency(e.target.value);
  };

  return (
    <MDBox
      sx={{
        maxWidth: 400,
      }}
    >
      <Box sx={{ mb: 1 }}>
        <Typography variant="h5" fontWeight="bold">
          Coin Price Static
        </Typography>
      </Box>
      <Box sx={{ border: '1px solid #ccc', padding:'10px', borderRadius: '5px' }}>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      ) : priceData && (
        <Box >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img src={Company_LogoURL} alt={coinId} style={{ width: '24px', height: '24px', borderRadius: '50%'}}/>
            <Typography sx={{ textTransform: 'uppercase', ml: 1, fontWeight: 'bold', fontSize: '20px', color: '#000' }}>
              {coinSymbol}
            </Typography>
          </Box>

          <Typography variant="h5" fontWeight="bold" >
            {getCurrencySymbol()}{formatPrice(priceData.price)}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: priceData.change24h >= 0 ? 'success.main' : 'error.main',
              display: 'flex',
              alignItems: 'center',
              fontWeight: 'bold',
              fontSize: '14px',
              borderBottom: '1px solid #ccc',
              paddingBottom: '10px',
            }}
          >
            {priceData.change24h >= 0 ? '↑' : '↓'}{' '}
            {Math.abs(priceData.change24h).toFixed(1)}%
          </Typography>

          <FormControl fullWidth sx={{ mt: 2 }} style={{backgroundColor: '#f1f1f1', borderRadius: '5px', width: '100px'}}>
            <Select
              value={selectedCurrency}
              onChange={handleCurrencyChange}
              variant="outlined"
              IconComponent={KeyboardArrowDown}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '& .MuiSelect-select': {
                  py: 2.5,
                }
              }}
            >
              {CURRENCY_OPTIONS.map((currency) => (
                <MenuItem key={currency.value} value={currency.value}>
                  <span style={{color: '#000', fontWeight: 'bold', fontSize: '16px', padding: '5px 10px'}}>{currency.label}</span>
                  {/* ({currency.symbol}) */}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
      </Box>
    </MDBox>
  );
};

export default CoinPriceStatic; 