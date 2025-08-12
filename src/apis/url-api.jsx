import axios from 'axios';

const apiClient = axios.create({
  // baseURL: 'http://localhost:7045',
  baseURL: 'https://localhost:7045',
  // baseURL: "https://api.nestlycare.live",
  timeout: 20000,
});

export default apiClient;