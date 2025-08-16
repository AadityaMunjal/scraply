// API Configuration
export const API_CONFIG = {
  // Use environment variable if available, otherwise fallback to localhost for development
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  
  // For production, you might want to use HTTPS
  getApiUrl: (endpoint: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return `${baseUrl}${endpoint}`;
  }
};

// Socket Configuration
export const SOCKET_CONFIG = {
  URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
};
