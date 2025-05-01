// Utility functions for JWT token handling

export const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const decodedToken = parseJwt(token);
    if (!decodedToken) return true;
    
    // exp is in seconds, Date.now() is in milliseconds
    const expirationTime = decodedToken.exp * 1000;
    return Date.now() >= expirationTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

export const getTokenExpirationTime = (token) => {
  try {
    const decodedToken = parseJwt(token);
    if (!decodedToken || !decodedToken.exp) return null;
    return decodedToken.exp * 1000; // Convert to milliseconds
  } catch (error) {
    console.error('Error getting token expiration time:', error);
    return null;
  }
}; 