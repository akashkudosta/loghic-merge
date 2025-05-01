// src/components/CoinConverter.js
import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { COINGECKO_API_URL, COINGECKO_API_KEY, getHeaders } from '../config';

// Comprehensive currency options including fiat and crypto
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

const CoinConverter = ({ coinName, coinSymbol, Company_LogoURL }) => {
  const [amount, setAmount] = useState(1);
  const [fromCurrency] = useState(coinSymbol);
  const [toCurrency, setToCurrency] = useState('usd');
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch conversion rates based on the selected currencies
  const fetchConversionRate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${COINGECKO_API_URL}/simple/price?ids=${coinName}&vs_currencies=${toCurrency}&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`,
        {
          headers: getHeaders(),
        }
      );
    //   console.log('Coin Converter response', response);
      if (!response.ok) {
        throw new Error('Failed to fetch conversion rate');
      }
      const data = await response.json();
    //   console.log('Coin Converter data', data);
      if (data[coinName] && data[coinName][toCurrency]) {
        const rate = data[coinName][toCurrency];
        setConvertedAmount(amount * rate);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      setError(error.message);
      console.error("Error fetching conversion rate:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversionRate();
  }, [amount, toCurrency, coinName]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || value >= 0) {
      setAmount(value);
    }
  };

  const handleCurrencyChange = (e) => {
    setToCurrency(e.target.value);
  };

  // Get current currency symbol
  const getCurrentCurrencySymbol = () => {
    const currency = CURRENCY_OPTIONS.find(c => c.value === toCurrency);
    return currency ? currency.symbol : '';
  };

  // Format the converted amount based on currency type
  const formatConvertedAmount = (amount) => {
    // For crypto currencies, show more decimal places
    const isCrypto = ['btc', 'eth', 'bch', 'ltc', 'bnb', 'dot', 'link', 'xrp', 'xlm', 'yfi'].includes(toCurrency);
    return isCrypto ? amount.toFixed(8) : amount.toFixed(2);
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
      }}
    >
      
      <Box sx={{ mb: 1 }}>
        <Typography variant="h5" fontWeight="bold">
        Coin Converter
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexDirection: 'column', border:'1px solid #ccc', borderRadius: '5px', padding: '10px', paddingBottom: '25px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', mb: 1 }}>
        <TextField
          type="number"
          value={amount}
          onChange={handleAmountChange}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
              
            },
          }}
          fullWidth
          InputProps={{
            endAdornment: (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right', width: '100%' }}>
                    <Typography color="textSecondary" variant="body2" sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'right', width: '100%', textTransform: 'uppercase', fontWeight: 'bold', fontSize: '16px', color: '#000' }}>
                        <img src={Company_LogoURL} alt={coinName} style={{ width: '24px', height: '24px', borderRadius: '50%'}}/>
                        {fromCurrency}
                    </Typography>
                    
                </Box>
            ),
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right', width: '100%' }} style={{ borderTop:'1px solid #ccc', padding: '15px 10px', height: '70px'}}>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <Typography variant="h6" align="left" >
          {convertedAmount ? (
            <>
              {getCurrentCurrencySymbol()}{formatConvertedAmount(convertedAmount)}
            </>
          ) : (
            'N/A'
          )}
        </Typography>
      )}

      <FormControl fullWidth >
        <Select
          labelId="currency-select-label"
          value={toCurrency}
          onChange={handleCurrencyChange}
          sx={{
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
          }}
        >
          {CURRENCY_OPTIONS.map((currency) => (
            <MenuItem key={currency.value} value={currency.value}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right', width: '100%' }}>
                <span style={{color: '#000', fontWeight: 'bold', fontSize: '16px'}}>{currency.label}</span>
                {/* <Typography color="textSecondary" variant="body2">
                  {currency.symbol}
                </Typography> */}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      </Box>
      </Box>
    </Box>
  );
};

export default CoinConverter;