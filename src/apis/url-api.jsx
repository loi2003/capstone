import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://localhost:7045',
  timeout: 10000,
});

export default apiClient;